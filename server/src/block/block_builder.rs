// Epoch Block Builder
// - A buffer for all matched orders, when adding txns, always update user's balance accordingly
// - fetch the matched orders into Blocks
// - Once an epoch(500ms) is reached, transactions are batched into a block
// - Calculate the user balance merkle tree updates according to the block
// - Saves the block inside the Block Database

use crate::engine::{MatchedLogs, MATCHED_LOGS};
use crate::block::Block;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
pub struct BlockBuilder{
    block_duration: Duration,
    block_size: u64, // number of matched entries
    block_height: u64,
    last_block_timestamp: u64,
    last_block_hash: String,
    pub block: Block,
}

impl BlockBuilder {
    pub fn new(block_duration: Duration, block_size: u64, block_height: u64, last_block_hash: String) -> Self {
        let last_block_timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        Self {
            block_duration,
            block_size,
            block_height,
            last_block_timestamp,
            last_block_hash: last_block_hash.clone(),
            block: Block::new(last_block_hash),
        }
    }

    pub async fn build_block(&mut self) -> bool {
        let mut matched_logs = MATCHED_LOGS.write().unwrap();
        while self.block_size > self.block.length {
            for pair_id in matched_logs.get_all_pair_ids() {
                let matched_entries = matched_logs.pop_top_n_matched_logs(&pair_id, (self.block_size - self.block.length) as usize);
                if let Some(entries) = matched_entries {
                    if entries.len() == 0 {
                        break;
                    }
                    for entry in entries {
                        self.block.add_entry(entry);
                    }
                }
            }
        }
        
        let current_timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        if current_timestamp - self.last_block_timestamp > self.block_duration.as_secs() || self.block.length == self.block_size {
            self.block.finalize_block();
            self.last_block_timestamp = current_timestamp;
            self.last_block_hash = self.block.id.clone();
            self.block_height += 1;
            return true;
        }
        false
    }


    
}
