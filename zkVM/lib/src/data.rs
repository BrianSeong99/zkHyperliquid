// prepare data for zkVM

use crate::types::*;
use std::collections::{HashMap, VecDeque};
use std::time::{SystemTime, UNIX_EPOCH};
use std::fmt::Write;

// Add a simple deterministic random function
fn deterministic_random(seed: usize) -> u64 {
    // Simple deterministic hash function
    let mut value = seed as u64;
    value = value.wrapping_mul(6364136223846793005);
    value = value.wrapping_add(1442695040888963407);
    value
}

pub fn populate_block_data(num_orders: usize) -> BlockProofInput {
    // Generate all orders first
    let mut orders = Vec::with_capacity(num_orders);
    for i in 0..num_orders {
        // Use our deterministic random function instead of rand::random
        orders.push(Order::new(
            i.to_string(),
            format!("user{}", (i % 3) + 1),
            "POL-ETH".to_string(),
            50 + deterministic_random(i * 2) % 51, // 50-100
            95 + deterministic_random(i * 2 + 1) % 11, // 95-105
            true
        ));
    }
    let mut matched_logs = HashMap::new(); // HashMap<String, VecDeque<MatchedEntry>>
    for order in orders {
        matched_logs.entry(order.pair_id.clone()).or_insert(VecDeque::new()).push_back(MatchedEntry::new(order));
    }
    let block1 = Block {
        id: "1".to_string(),
        last_block_hash: [0u8; 32],
        timestamp: 1000, // Fixed timestamp instead of SystemTime::now()
        length: matched_logs.len() as u64,
        logs: matched_logs,
    };
    let mut block2 = block1.clone();
    let block1_hash = block1.hash();
    block2.last_block_hash = block1_hash.clone();
    let block2_hash = block2.hash();

    let mut previous_users_balance_state = UserBalanceState { users: HashMap::new() };
    let mut users_balance_state = UserBalanceState { users: HashMap::new() };

    let mut user1 = User {
        address: "user1".to_string(),
        balances: 1000000000,
    };
    let mut user2 = user1.clone();
    user2.address = "user2".to_string();
    let mut user3 = user1.clone();
    user3.address = "user3".to_string();    

    // create user balance state
    previous_users_balance_state.users.insert("user1".to_string(), user1.clone());
    previous_users_balance_state.users.insert("user2".to_string(), user2.clone());
    previous_users_balance_state.users.insert("user3".to_string(), user3.clone());

    // now calculate the users new balance state after the block is settled
    for pair in block1.logs.values() {
        for matched_entry in pair {
            if matched_entry.buy_order.user_id == "user1" {
                user1.balances += matched_entry.matched_amount;
            }
            if matched_entry.buy_order.user_id == "user2" {
                user2.balances += matched_entry.matched_amount;
            }
            if matched_entry.buy_order.user_id == "user3" {
                user3.balances += matched_entry.matched_amount;
            }
            if matched_entry.sell_order.user_id == "user1" {
                user1.balances -= matched_entry.matched_amount;
            }
            if matched_entry.sell_order.user_id == "user2" {
                user2.balances -= matched_entry.matched_amount;
            }   
            if matched_entry.sell_order.user_id == "user3" {
                user3.balances -= matched_entry.matched_amount;
            }
        }
    }

    users_balance_state.users.insert("user1".to_string(), user1.clone());
    users_balance_state.users.insert("user2".to_string(), user2.clone());
    users_balance_state.users.insert("user3".to_string(), user3.clone());

    let user_balance_hash = users_balance_state.hash();
    let previous_user_balance_hash = previous_users_balance_state.hash();

    let block_proof_input = BlockProofInput {
        block: block1,
        hash: block1_hash,
        user_balance_hash: user_balance_hash,
        previous_user_balance_hash: previous_user_balance_hash,
        previous_user_balance_state: previous_users_balance_state,
        user_balance_state: users_balance_state,
    };

    println!("Data: Expected user balance hash: {:?}", user_balance_hash);

    block_proof_input
}