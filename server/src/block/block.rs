use crate::engine::{MatchedLogs, ORDERS_MEMPOOL};

// Block datatype
pub struct Block {
    pub id: String,
    pub timestamp: u64,
    pub length: u64,
    pub matched_logs: MatchedLogs,
}

impl Block {
    pub fn new(matched_logs: MatchedLogs) -> Self {
        Self { matched_logs }
    }
}