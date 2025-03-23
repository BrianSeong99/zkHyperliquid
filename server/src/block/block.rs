use crate::engine::{MatchedEntry, ORDERS_MEMPOOL, OrderStatus};
use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};

// Block datatype
pub struct Block {
    pub id: String,
    pub last_block_hash: String,
    pub timestamp: u64,
    pub length: u64,
    pub logs: HashMap<String, VecDeque<MatchedEntry>>,
    // TODO: add balance merkle tree root hash, last block BMR Hash, and related fields.
}

impl Block {

    pub fn new(last_block_hash: String) -> Self {
        Self::new_with_entries(HashMap::new(), last_block_hash)
    }

    pub fn new_with_entries(logs: HashMap<String, VecDeque<MatchedEntry>>, last_block_hash: String) -> Self {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let length = logs.values()
            .map(|queue| queue.len() as u64)
            .sum();
        Self { 
            id: format!("{:x}", md5::compute(format!("{:?}", logs))),
            last_block_hash,
            timestamp,
            length,
            logs
        }
    }

    pub fn add_entry(&mut self, entry: MatchedEntry) {
        self.logs.entry(entry.buy_order.pair_id.clone()).or_insert(VecDeque::new()).push_back(entry);
        self.length += 1;
    }

    pub fn finalize_block(&mut self) {
        self.id = format!("{:x}", md5::compute(format!("{:?}", self.logs)));
        // change all the order status to batched
        for (_, queue) in self.logs.iter_mut() {
            for entry in queue.iter_mut() {
                entry.buy_order.status = OrderStatus::Batched;
                entry.sell_order.status = OrderStatus::Batched;
            }
        }
        self.timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
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
        
        let block = Block::new_with_entries(logs.clone(), "".to_string());
        
        assert!(!block.id.is_empty());
        assert!(block.timestamp > 0);
        assert_eq!(block.length, 3);
        assert_eq!(block.logs, logs);
    }
}