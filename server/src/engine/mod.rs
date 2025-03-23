mod order;
mod orders_mempool;
mod order_matching_engine;
mod matched_logs;

pub use order::*;
pub use orders_mempool::*;
pub use order_matching_engine::*;
pub use matched_logs::*;

use tokio::sync::mpsc;
use std::sync::{Arc, RwLock};
use lazy_static::lazy_static;
use std::time::Duration;
use log::debug;

use tokio::sync::Mutex;
use crate::user::UserDatabase;

lazy_static! {
    pub static ref MATCHED_LOGS: Arc<RwLock<MatchedLogs>> = Arc::new(RwLock::new(MatchedLogs::new()));
    pub static ref ORDERS_MEMPOOL: Arc<RwLock<OrdersMempool>> = Arc::new(RwLock::new(OrdersMempool::new()));
}

pub struct MatchingEngine {
    order_rx: mpsc::Receiver<Order>,
    matching_engine: OrderMatchingEngine,
}

impl MatchingEngine {
    pub fn new(deviation: f64, user_db: Arc<Mutex<UserDatabase>>) -> (Self, mpsc::Sender<Order>) {
        let (order_tx, order_rx) = mpsc::channel(1000);
        let matching_engine = OrderMatchingEngine::new(
            deviation,
            Arc::clone(&ORDERS_MEMPOOL),
            Arc::clone(&MATCHED_LOGS),
        );
        MATCHED_LOGS.write().unwrap().set_user_db(user_db);

        (
            Self {
                order_rx,
                matching_engine,
            },
            order_tx,
        )
    }

    pub async fn run(&mut self, interval: Duration) {
        loop {
            tokio::select! {
                // Process new orders
                Some(order) = self.order_rx.recv() => {
                    debug!("Received order: {:?}", order);
                    self.matching_engine.add_order(order);
                }

                // Run matching more frequently
                _ = tokio::time::sleep(interval) => {
                    let matches = self.matching_engine.try_match();
                    for (buy_order, sell_order, amount) in matches {
                        debug!("Matched: {:?} {:?} {:?} {:?} {:?}", 
                            buy_order.id, buy_order.amount, 
                            sell_order.id, sell_order.amount, amount);
                    }
                }
            }
        }
    }
}

pub async fn run_order_pipeline(deviation: f64, user_db: Arc<Mutex<UserDatabase>>) -> mpsc::Sender<Order> {
    let (mut engine, order_tx) = MatchingEngine::new(deviation, user_db);
    
    tokio::spawn(async move {
        engine.run(Duration::from_millis(1)).await;
    });

    order_tx
}

// pub fn run_execution_proof(epoch_block: EpochBlock) {
//     // TODO: Implement execution proof
// }

// Benchmark the engine with 1000 orders
#[cfg(test)]
mod tests {
    use super::*;
    use env_logger;
    use std::time::{Duration, Instant};

    #[tokio::test]
    async fn bench_engine() {
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
    }
}