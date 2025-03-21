use std::sync::{Arc, RwLock};
use super::{Order, OrdersMempool, MatchedLogs};
use log::debug;
// Order matching engine
// Match transactions based on a 0.05% deviation.
// FIFO for the same price.
// Once find the match, add the transactions into Transaction Logs
pub struct OrderMatchingEngine {
    deviation: f64,
    mempool: Arc<RwLock<OrdersMempool>>,
    pub matched_logs: Arc<RwLock<MatchedLogs>>,
}

impl OrderMatchingEngine {
    pub fn new(deviation: f64, mempool: Arc<RwLock<OrdersMempool>>, matched_logs: Arc<RwLock<MatchedLogs>>) -> Self {
        Self {
            deviation,
            mempool,
            matched_logs,
        }
    }

    pub fn add_order(&mut self, order: Order) {
        debug!("Adding order: {:?}", order);
        let mut mempool = self.mempool.write().unwrap();
        mempool.add_order(order);
    }

    // for zkVM bulk adding orders
    pub fn add_orders(&mut self, orders: Vec<Order>) {
        for order in orders {
            self.add_order(order);
        }
    }

    pub fn try_match(&mut self) -> Vec<(Order, Order, u64)> {  // Returns (buy_order, sell_order, matched_amount)
        let mut matches = Vec::new();
        
        debug!("\nStarting matching round...");
        
        loop {
            let (buy_order, sell_order) = {
                let mempool = self.mempool.read().unwrap();
                let buy_order = mempool.get_top_buy_order().cloned();
                let sell_order = mempool.get_top_sell_order().cloned();
                (buy_order, sell_order)
            };
            
            if buy_order.is_none() || sell_order.is_none() {
                break;
            }
            
            let mut buy_order = buy_order.unwrap();
            let mut sell_order = sell_order.unwrap();
            
            debug!("\nTop of order books:");
            debug!("Buy order: id={}, price={}, amount={}", 
                buy_order.id, buy_order.price, buy_order.remaining_amount());
            debug!("Sell order: id={}, price={}, amount={}", 
                sell_order.id, sell_order.price, sell_order.remaining_amount());
            
            if !self.is_match(&buy_order, &sell_order) {
                debug!("No match possible: buy price {} < sell price {}", 
                    buy_order.price, sell_order.price);
                break;
            }

            debug!("Found match! Buy order {} at {} with Sell order {} at {}", 
                buy_order.id, buy_order.price,
                sell_order.id, sell_order.price);

            let match_amount = buy_order.remaining_amount().min(sell_order.remaining_amount());
            
            buy_order.fill(match_amount);
            sell_order.fill(match_amount);
            
            // Update or remove orders from mempool
            {
                let mut mempool = self.mempool.write().unwrap();
                
                if buy_order.is_filled() {
                    debug!("Removing filled buy order {}", buy_order.id);
                    mempool.remove_order(buy_order.id.clone());
                } else {
                    debug!("Updating partially filled buy order {}", buy_order.id);
                    mempool.update_order(buy_order.clone());
                }
                
                if sell_order.is_filled() {
                    debug!("Removing filled sell order {}", sell_order.id);
                    mempool.remove_order(sell_order.id.clone());
                } else {
                    debug!("Updating partially filled sell order {}", sell_order.id);
                    mempool.update_order(sell_order.clone());
                }
            }

            self.matched_logs.write().unwrap()
                .add_matched_entry(buy_order.clone(), sell_order.clone(), match_amount);
            matches.push((buy_order, sell_order, match_amount));
        }
        
        matches
    }

    fn is_match(&self, buy_order: &Order, sell_order: &Order) -> bool {
        buy_order.price as f64 >= sell_order.price as f64
    }

    pub fn get_matched_logs(&self) -> Arc<RwLock<MatchedLogs>> {
        Arc::clone(&self.matched_logs)
    }
}