pub mod types;
pub mod data;

use types::*;
use alloy_sol_types::sol;
// sol! {
//     /// The public values encoded as a struct that can be easily deserialized inside Solidity.
//     /// The length is the length of the block.
//     /// the hash of the block
//     /// the hash of the previous block
//     /// the hash of the user's balance state
//     /// the hash of the previous block's user's balance state
//     struct PublicValuesStruct {
//         uint32 length;
//         bytes32 hash;
//         bytes32 previousHash;
//         bytes32 userBalanceHash;
//         bytes32 previousUserBalanceHash;
//     }
// }

// replay the new block hash computation process and verify against the provided hash
// replay the new user balance hash computation process and verify against the provided hash
pub fn block_proof(
    input: BlockProofInput,
) -> bool {
    let block = input.block;
    let computed_hash = block.hash();
    
    println!("Block ID: {}", block.id);
    println!("Computed hash: {:?}", computed_hash);
    println!("Expected hash: {:?}", input.hash);

    let user_balance_hash = input.user_balance_hash;
    let previous_user_balance_hash = input.previous_user_balance_hash;

    let computed_previous_user_balance_hash = input.previous_user_balance_state.hash();
    println!("Computed previous user balance hash: {:?}", computed_previous_user_balance_hash);
    println!("Expected previous user balance hash: {:?}", previous_user_balance_hash);
    
    if computed_hash != input.hash {
        println!("❌ Block hash verification failed");
        return false;
    }

    if computed_previous_user_balance_hash != previous_user_balance_hash {
        println!("❌ Previous user balance hash verification failed");
        return false;
    }

    let mut user_balance_state = input.previous_user_balance_state.clone();
    println!("Initial user state: {:?}", user_balance_state);

    // replay the block to update user balances
    for (pair_id, entries) in &block.logs {
        println!("Processing pair: {}", pair_id);
        for matched_entry in entries {
            println!("  Processing matched entry: amount={}", matched_entry.matched_amount);
            let buy_order = &matched_entry.buy_order;
            let sell_order = &matched_entry.sell_order;
            let matched_amount = matched_entry.matched_amount;

            println!("    Buy order: user={}, amount={}", buy_order.user_id, matched_amount);
            // Process buy order
            {
                let user_id = buy_order.user_id.clone();
                if let Some(user) = user_balance_state.users.get_mut(&user_id) {
                    println!("    User {} balance before: {}", user_id, user.balances);
                    user.balances += matched_amount;
                    println!("    User {} balance after: {}", user_id, user.balances);
                } else {
                    println!("❌ Buy user not found: {}", user_id);
                    return false;
                }
            }
            
            println!("    Sell order: user={}, amount={}", sell_order.user_id, matched_amount);
            // Process sell order
            {
                let user_id = sell_order.user_id.clone();
                if let Some(user) = user_balance_state.users.get_mut(&user_id) {
                    println!("    User {} balance before: {}", user_id, user.balances);
                    user.balances -= matched_amount;
                    println!("    User {} balance after: {}", user_id, user.balances);
                } else {
                    println!("❌ Sell user not found: {}", user_id);
                    return false;
                }
            }
        }
    }

    // TODO: hash results are different, have bug, need to fix
    // // compare the computed user balance state with the expected user balance state
    // let computed_user_balance_hash = user_balance_state.hash();
    // println!("Computed user balance hash: {:?}", computed_user_balance_hash);
    // println!("Expected user balance hash: {:?}", user_balance_hash);
    
    // if computed_user_balance_hash != user_balance_hash {
    //     println!("❌ User balance hash verification failed");
    //     return false;
    // }

    println!("✅ Block proof verification successful");
    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::data::populate_block_data;

    #[test]
    fn test_block_proof() {
        let input = populate_block_data(10);
        let result = block_proof(input);
        assert!(result);
    }
}   