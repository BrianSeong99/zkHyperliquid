use alloy_sol_types::sol;
use serde::{Serialize, Deserialize};
use std::cmp::Ordering;
use std::collections::{HashMap, VecDeque};
use std::hash::{Hash, Hasher};
use std::collections::hash_map::DefaultHasher;
use serde_json;


// Define bytes32 type (typically a 32-byte array)
pub type bytes32 = [u8; 32];

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Order {
    pub id: String,
    pub user_id: String,
    pub pair_id: String,
    pub amount: u64,
    pub filled_amount: u64,
    pub price: u64,
    pub side: bool,
    pub status: OrderStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

impl Order {
    // Create a new order with a given id, user_id, pair_id, amount, price, and side
    // The status is pending by default, 
    // then once the order is matched, the status is matched, 
    // then when block is settled on L1, then the status is settled
    pub fn new(
        id: String, 
        user_id: String, 
        pair_id: String, 
        amount: u64, 
        price: u64, 
        side: bool
    ) -> Self {
        let now = 1000; // Fixed timestamp for deterministic behavior
        
        Self { 
            id, user_id, pair_id, amount,
            filled_amount: 0,
            price, side,
            status: OrderStatus::Pending, 
            created_at: now,
            updated_at: now
        }
    }
}

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum OrderStatus {
    Pending, // pending to be filled
    PartiallyFilled, // partially filled
    Filled, // fully filled
    Cancelled, // cancelled
    Batched, // batched to by epoch block builder
    Settled, // settled on L1
}

pub struct BlockProof {
    length: u32,
    hash: bytes32,
    previous_hash: bytes32,
    user_balance_hash: bytes32,
    previous_user_balance_hash: bytes32,
}

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

impl MatchedEntry {
    pub fn new(buy_order: Order) -> Self {
        Self {
            timestamp: 1000, // Fixed timestamp for deterministic behavior
            buy_order: buy_order.clone(),
            sell_order: Order::new(buy_order.id, buy_order.user_id, buy_order.pair_id, buy_order.amount, buy_order.price, !buy_order.side),
            matched_amount: buy_order.amount
        }
    }
}

impl Ord for MatchedEntry {
    fn cmp(&self, other: &Self) -> Ordering {
        self.timestamp.cmp(&other.timestamp)
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct UserBalanceState {
    pub users: HashMap<String, User>, // user id -> user
}

impl UserBalanceState {
    pub fn hash(&self) -> bytes32 {
        let mut hasher = DefaultHasher::new();
        // json serialize the block
        let user_balance_state_json = serde_json::to_string(self).unwrap();
        hasher.write(user_balance_state_json.as_bytes());
        let hash_value = hasher.finish();
        
        // Create a 32-byte array filled with zeros
        let mut result = [0u8; 32];
        
        // Copy the 8 bytes from hash_value into the last 8 bytes of result
        result[24..32].copy_from_slice(&hash_value.to_le_bytes());
        
        result
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub address: String,
    pub balances: u64, // using u64 for simplicity, can be extended to HashMap<String, u64>
}

// Block datatype
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Block {
    pub id: String,
    pub last_block_hash: bytes32,
    pub timestamp: u64,
    pub length: u64,
    pub logs: HashMap<String, VecDeque<MatchedEntry>>,
    // TODO: add balance merkle tree root hash, last block BMR Hash, and related fields.
}

impl Block {
    pub fn hash(&self) -> bytes32 {
        let mut hasher = DefaultHasher::new();
        // json serialize the block
        let block_json = serde_json::to_string(self).unwrap();
        hasher.write(block_json.as_bytes());
        let hash_value = hasher.finish();
        
        // Create a 32-byte array filled with zeros
        let mut result = [0u8; 32];
        
        // Copy the 8 bytes from hash_value into the last 8 bytes of result
        result[24..32].copy_from_slice(&hash_value.to_le_bytes());
        
        result
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BlockProofInput {
    pub block: Block,
    pub hash: bytes32,
    pub user_balance_hash: bytes32,
    pub previous_user_balance_hash: bytes32,
    pub previous_user_balance_state: UserBalanceState,
    pub user_balance_state: UserBalanceState,
}