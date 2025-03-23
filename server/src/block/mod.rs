mod block;
mod block_database;
mod block_builder;

use crate::block::Block;
use crate::block::BlockBuilder;
use crate::block::BlockDatabase;

pub use block::*;
pub use block_database::*;
pub use block_builder::*;

use std::time::Duration;

pub struct BlockManager {
    block_builder: BlockBuilder,
    block_database: BlockDatabase,
}

impl BlockManager {
    pub fn new(block_duration: Duration, block_size: u64, block_height: u64, last_block_hash: String, uri: String, is_test: bool) -> Self {
        Self {
            block_builder: BlockBuilder::new(block_duration, block_size, block_height, last_block_hash),
            block_database: BlockDatabase::new(&uri, is_test),
        }
    }

    pub async fn run(&mut self, interval: Duration) {
        loop {
            if self.block_builder.build_block().await {
                let _ = self.block_database.save_block(&self.block_builder.block).await;
            }
            tokio::time::sleep(interval).await;
        }
    }

}  

pub async fn run_block_pipeline(block_manager: BlockManager, interval: Duration) {
    tokio::spawn(async move {
        let mut block_manager = block_manager;
        block_manager.run(interval).await;
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::test;
    use std::sync::{Arc, RwLock};
    use tokio::sync::Mutex;
    use std::time::Instant;
    use log::debug;
    use crate::user::UserDatabase;
    use crate::engine::{run_order_pipeline, Order, MatchedLogs, OrdersMempool};
    use lazy_static::lazy_static;


    #[test]
    async fn test_block_manager() {
        lazy_static! {
            pub static ref MATCHED_LOGS: Arc<RwLock<MatchedLogs>> = Arc::new(RwLock::new(MatchedLogs::new()));
            pub static ref ORDERS_MEMPOOL: Arc<RwLock<OrdersMempool>> = Arc::new(RwLock::new(OrdersMempool::new()));
        }

        if std::env::var("RUST_LOG").is_ok() {
            env_logger::init();
        }
        let uri = std::env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        let user_db = Arc::new(Mutex::new(UserDatabase::new(&uri)));
        let order_tx = run_order_pipeline(0.05, user_db).await;

        let num_orders = 800;
        println!("Submitting {} orders", num_orders);
        
        let start_time = Instant::now();
        
        // Generate all orders first
        let mut orders = Vec::with_capacity(num_orders);
        for i in 0..num_orders {
            orders.push(Order::new(
                i.to_string(),
                format!("user{}", (i % 3) + 1),
                "POL-ETH".to_string(),
                50 + rand::random::<u64>() % 51, // 50-100
                95 + rand::random::<u64>() % 11, // 95-105
                i % 2 == 0
            ));
        }

        // Submit orders in batches
        const BATCH_SIZE: usize = 50;
        for chunk in orders.chunks(BATCH_SIZE) {
            for order in chunk {
                order_tx.send(order.clone()).await.unwrap();
            }
            // Small delay between batches instead of between each order
            tokio::time::sleep(Duration::from_millis(1)).await;
        }

        let elapsed = start_time.elapsed();
        let orders_per_second = num_orders as f64 / elapsed.as_secs_f64();
        println!("Time elapsed: {:?}", elapsed);
        println!("Orders per second: {:.2}", orders_per_second);

        tokio::time::sleep(Duration::from_millis(500)).await;

        // Read the matched logs
        match MATCHED_LOGS.write() {
            Ok(mut logs) => {
                match logs.pop_top_n_matched_logs("POL-ETH", 1000) {
                    Some(matches) => {
                        println!("Number of matches: {}", matches.len());
                        for entry in matches {
                            debug!("Match: Buy order {} amount {} at price {} - Sell order {} amount {} at price {}", 
                                entry.buy_order.id, entry.matched_amount, entry.buy_order.price,
                                entry.sell_order.id, entry.matched_amount, entry.sell_order.price);
                        }
                    }
                    None => println!("No matches found")
                }
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }

        let block_manager = BlockManager::new(Duration::from_millis(10), 0, 0, "".to_string(), "mongodb://localhost:27017".to_string(), true);
        run_block_pipeline(block_manager, Duration::from_millis(20)).await;

        // Create a new instance for testing
        let mut test_block_manager = BlockManager::new(Duration::from_millis(10), 100, 0, "".to_string(), "mongodb://localhost:27017".to_string(), true);
        let blocks = test_block_manager.block_database.get_latest_blocks(1).await.unwrap();
        assert_eq!(blocks.len(), 1);
        assert_eq!(blocks[0].id, "0x0");
    }
}