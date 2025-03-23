use std::collections::{HashMap, VecDeque};
use super::Order;
use std::time::{SystemTime, UNIX_EPOCH};
use std::cmp::Ordering;
use std::sync::{Arc};
use tokio::sync::Mutex;
use crate::user::UserDatabase;
use serde::{Serialize, Deserialize};

// Matched logs are used to store the orders that have been matched
// Each matched log will have a unique id, and a list of orders
// It is a queue, so the oldest order will be at the front
// and the newest order will be at the back
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MatchedEntry {
    pub timestamp: u64, 
    pub buy_order: Order, 
    pub sell_order: Order, 
    pub matched_amount: u64
}

impl PartialEq for MatchedEntry {
    fn eq(&self, other: &Self) -> bool {
        self.timestamp == other.timestamp
    }
}

impl Eq for MatchedEntry {}

impl PartialOrd for MatchedEntry {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for MatchedEntry {
    fn cmp(&self, other: &Self) -> Ordering {
        self.timestamp.cmp(&other.timestamp)
    }
}

pub struct MatchedLogs {
    // pair_id -> FIFO queue of matched (buy, sell) orders
    logs: HashMap<String, VecDeque<MatchedEntry>>,
    user_db: Option<Arc<Mutex<UserDatabase>>>,
}

impl MatchedLogs {
    pub fn new() -> Self {
        Self {
            logs: HashMap::new(),
            user_db: None,
        }
    }

    pub fn set_user_db(&mut self, user_db: Arc<Mutex<UserDatabase>>) {
        self.user_db = Some(user_db);
    }

    pub async fn add_matched_entry(&mut self, buy_order: Order, sell_order: Order, matched_amount: u64) {

        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        let pair_id = buy_order.pair_id.clone();
        let buy_user_id = buy_order.user_id.clone();
        let sell_user_id = sell_order.user_id.clone();
        
        self.logs
            .entry(pair_id.clone())
            .or_insert_with(VecDeque::new)
            .push_back(MatchedEntry { timestamp, buy_order, sell_order, matched_amount });

        // Update user balances when a match is made
        if let Some(user_db) = &self.user_db {
            let mut user_db = user_db.lock().await;

            let mut user = user_db.get_user(&buy_user_id).await.unwrap().unwrap();
            user.add_balance(pair_id.clone(), matched_amount);
            user_db.update_user(&user).await.unwrap();

            let mut user = user_db.get_user(&sell_user_id).await.unwrap().unwrap();
            user.sub_balance(pair_id, matched_amount);
            
            user_db.update_user(&user).await.unwrap();
        }
    }

    pub fn pop_top_n_matched_logs(&mut self, pair_id: &str, n: usize) -> Option<Vec<MatchedEntry>> {
        let mut result = Vec::new();
        if let Some(queue) = self.logs.get_mut(pair_id) {
            for _ in 0..n {
                if let Some(matched_entry) = queue.pop_front() {
                    result.push(matched_entry);
                } else {
                    break;
                }
            }
        }
        if result.is_empty() {
            None
        } else {
            Some(result)
        }
    }

    pub fn get_logs_by_user_id(&self, user_id: &str) -> Vec<&MatchedEntry> {
        self.logs.values()
            .flat_map(|queue| queue.iter())
            .filter(|log| log.buy_order.user_id == user_id || log.sell_order.user_id == user_id)
            .collect()
    }

    pub fn get_orders_by_user_id(&self, user_id: &str) -> Vec<Order> {
        self.logs.values()
            .flat_map(|queue| queue.iter())
            .filter(|log| log.buy_order.user_id == user_id || log.sell_order.user_id == user_id)
            .flat_map(|log| {
                let mut orders = Vec::new();
                if log.buy_order.user_id == user_id {
                    orders.push(log.buy_order.clone());
                }
                if log.sell_order.user_id == user_id {
                    orders.push(log.sell_order.clone());
                }
                orders
            })
            .collect()
    }
}