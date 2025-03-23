// Epoch Block Builder
// - A buffer for all matched orders, when adding txns, always update user's balance accordingly
// - fetch the matched orders into Blocks
// - Once an epoch(500ms) is reached, transactions are batched into a block
// - Calculate the user balance merkle tree updates according to the block
// - Saves the block inside the Block Database

use crate::engine::{MatchedLogs, MATCHED_LOGS};
use crate::block::Block;

pub struct EpochBlockBuilder{

}

impl EpochBlockBuilder {
    pub fn new() -> Self {
        Self {}
    }


    
}
