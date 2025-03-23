use crate::engine::{MatchedEntry, ORDERS_MEMPOOL};
use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};

// Block datatype
pub struct Block {
    pub id: String,
    pub timestamp: u64,
    pub length: u64,
    pub logs: HashMap<String, VecDeque<MatchedEntry>>,
}

impl Block {
    pub fn new(logs: HashMap<String, VecDeque<MatchedEntry>>) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let length = logs.values()
            .map(|queue| queue.len() as u64)
            .sum();
        Self { 
            id: format!("{:x}", md5::compute(format!("{:?}", logs))),
            timestamp,
            length,
            logs
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::Order;

    #[tokio::test]
    async fn test_new() {
        let logs = HashMap::from([("BTCUSDT".to_string(), VecDeque::from([
            MatchedEntry {
                timestamp: 1,
                buy_order: Order::new(
                    "order1".to_string(),
                    "user1".to_string(),
                    "BTCUSDT".to_string(),
                    100,
                    10,
                    true
                ),
                sell_order: Order::new(
                    "order2".to_string(),
                    "user2".to_string(),
                    "BTCUSDT".to_string(),
                    80,
                    10,
                    false
                ),
                matched_amount: 80,
            },
            MatchedEntry {
                timestamp: 1,
                buy_order: Order::new(
                    "order1".to_string(),
                    "user1".to_string(),
                    "BTCUSDT".to_string(),
                    90,
                    10,
                    true
                ),
                sell_order: Order::new(
                    "order2".to_string(),
                    "user2".to_string(),
                    "BTCUSDT".to_string(),
                    90,
                    10,
                    false
                ),
                matched_amount: 90,
            },
            MatchedEntry {
                timestamp: 1,
                buy_order: Order::new(
                    "order1".to_string(),
                    "user1".to_string(),
                    "BTCUSDT".to_string(),
                    80,
                    10,
                    true
                ),
                sell_order: Order::new(
                    "order2".to_string(),
                    "user2".to_string(),
                    "BTCUSDT".to_string(),
                    80,
                    10,
                    false
                ),
                matched_amount: 80,
            },
        ]))]);
        
        let block = Block::new(logs.clone());
        
        assert!(!block.id.is_empty());
        assert!(block.timestamp > 0);
        assert_eq!(block.length, 3);
        assert_eq!(block.logs, logs);
    }
}