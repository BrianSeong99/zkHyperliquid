use std::collections::{HashMap, BinaryHeap};
use super::Order;
use std::time::{SystemTime, UNIX_EPOCH};
use std::cmp::Ordering;

// Matched logs are used to store the orders that have been matched
// Each matched log will have a unique id, and a list of orders
// It is a queue, so the oldest order will be at the front
// and the newest order will be at the back
#[derive(Clone, Debug)]
struct MatchedEntry(u64, Order, Order, u64);  // timestamp, buy_order, sell_order, matched_amount

impl PartialEq for MatchedEntry {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
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
        self.0.cmp(&other.0)
    }
}

pub struct MatchedLogs {
    // pair_id -> vec of matched (buy, sell) orders
    logs: HashMap<String, BinaryHeap<MatchedEntry>>
}

impl MatchedLogs {
    pub fn new() -> Self {
        Self {
            logs: HashMap::new(),
        }
    }

    pub fn add_matched_entry(&mut self, buy_order: Order, sell_order: Order, matched_amount: u64) {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        self.logs
            .entry(buy_order.pair_id.clone())
            .or_insert_with(BinaryHeap::new)
            .push(MatchedEntry(timestamp, buy_order, sell_order, matched_amount));
    }

    // pub fn get_matched_orders(&self, pair_id: &str) -> Option<&BinaryHeap<MatchedEntry>> {
    //     self.logs.get(pair_id)
    // }

    pub fn pop_top_n_matched_orders(&mut self, pair_id: &str, n: usize) -> Option<Vec<(Order, Order, u64)>> {
        let orders = self.logs.get_mut(pair_id)?;
        let mut result = Vec::new();
        for _ in 0..n {
            if let Some(MatchedEntry(_, buy, sell, matched_amount)) = orders.pop() {
                result.push((buy, sell, matched_amount));
            }
        }
        Some(result)
    }

    pub fn get_logs_by_user_id(&self, user_id: &str) -> Vec<&MatchedEntry> {
        self.logs.values()
            .flat_map(|heap| heap.iter())
            .filter(|log| log.1.user_id == user_id || log.2.user_id == user_id)
            .collect()
    }

    pub fn get_orders_by_user_id(&self, user_id: &str) -> Vec<Order> {
        self.logs.values()
            .flat_map(|heap| heap.iter())
            .filter(|log| log.1.user_id == user_id || log.2.user_id == user_id)
            .flat_map(|log| {
                let mut orders = Vec::new();
                if log.1.user_id == user_id {
                    orders.push(log.1.clone());
                }
                if log.2.user_id == user_id {
                    orders.push(log.2.clone());
                }
                orders
            })
            .collect()
    }
}