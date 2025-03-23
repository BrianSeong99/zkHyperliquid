use std::collections::{BinaryHeap, HashMap};
use super::Order;
use std::cmp::Ordering;
use log::debug;

#[derive(Clone, Debug)]
struct OrderEntry(u64, Order, bool); // price, order, is_buy

impl PartialEq for OrderEntry {
    fn eq(&self, other: &Self) -> bool {
        // Compare price only, since order IDs are unique
        self.0 == other.0
    }
}

impl Eq for OrderEntry {}

impl PartialOrd for OrderEntry {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for OrderEntry {
    fn cmp(&self, other: &Self) -> Ordering {
        if self.2 { // is_buy
            // For buy orders: higher price = higher priority
            match self.0.cmp(&other.0) {
                Ordering::Equal => self.1.created_at.cmp(&other.1.created_at),
                ord => ord // Higher price should come first
            }
        } else {
            // For sell orders: lower price = higher priority
            match self.0.cmp(&other.0) {
                Ordering::Equal => self.1.created_at.cmp(&other.1.created_at),
                ord => ord.reverse() // Reverse to get lowest price first
            }
        }
    }
}

// Each trading pair will have 2 mempools, one for each side of the order
// Rank the orders based on price ranking
// when price is the same, then rank based on FIFO
pub struct OrdersMempool {
    buy_orders: BinaryHeap<OrderEntry>,
    sell_orders: BinaryHeap<OrderEntry>,
    order_lookup: HashMap<String, (bool, u64)>, // order_id -> (is_buy, price)
}

impl OrdersMempool {
    pub fn new() -> Self {
        Self {
            buy_orders: BinaryHeap::with_capacity(1000),
            sell_orders: BinaryHeap::with_capacity(1000),
            order_lookup: HashMap::with_capacity(1000),
        }
    }

    pub fn add_order(&mut self, order: Order) {
        let is_buy = order.side;
        let price = order.price;
        let heap = if is_buy { &mut self.buy_orders } else { &mut self.sell_orders };
        
        heap.push(OrderEntry(price, order.clone(), is_buy));
        self.order_lookup.insert(order.id.clone(), (is_buy, price));
        
        debug!("Order book after adding {} order {} at price {}:", 
            if is_buy { "buy" } else { "sell" }, 
            order.id, price);
        
        #[cfg(debug_assertions)]
        self.debug_print_orders();
        
        debug!("Top buy: {:?}", self.get_top_buy_order());
        debug!("Top sell: {:?}", self.get_top_sell_order());
    }

    // Needed for order cancellation or order matching
    pub fn remove_order(&mut self, order_id: String) {
        if let Some((is_buy, _)) = self.order_lookup.remove(&order_id) {
            let heap = if is_buy { &mut self.buy_orders } else { &mut self.sell_orders };
            // Drain and keep all entries except the specific order we want to remove
            *heap = heap.drain()
                .filter(|entry| !(entry.1.id == order_id))
                .collect();
        }
    }
    
    pub fn update_order(&mut self, order: Order) {
        self.remove_order(order.id.clone());
        self.add_order(order);
    }

    pub fn get_top_buy_order(&self) -> Option<&Order> {
        if let Some(top) = self.buy_orders.peek() {
            debug!("DEBUG: Top buy order in heap has price {}", top.0);
        }
        self.buy_orders.peek().map(|entry| &entry.1)
    }

    pub fn get_top_sell_order(&self) -> Option<&Order> {
        if let Some(top) = self.sell_orders.peek() {
            debug!("DEBUG: Top sell order in heap has price {}", top.0);
        }
        self.sell_orders.peek().map(|entry| &entry.1)
    }

    fn debug_print_orders(&self) {
        let mut buy_orders: Vec<_> = self.buy_orders.iter().collect();
        let mut sell_orders: Vec<_> = self.sell_orders.iter().collect();
        
        buy_orders.sort_by(|a, b| b.0.cmp(&a.0));
        sell_orders.sort_by(|a, b| a.0.cmp(&b.0));

        debug!("Buy orders (highest to lowest price):");
        for entry in &buy_orders {
            debug!("  Buy order: id={}, price={}", entry.1.id, entry.0);
        }
        
        debug!("Sell orders (lowest to highest price):");
        for entry in &sell_orders {
            debug!("  Sell order: id={}, price={}", entry.1.id, entry.0);
        }
    }

    // Get all orders from both buy and sell mempools
    pub fn get_all_orders(&self) -> (Vec<Order>, Vec<Order>) {
        let mut buy_orders = Vec::new();
        let mut sell_orders = Vec::new();
        // Add buy orders
        for entry in &self.buy_orders {
            buy_orders.push(entry.1.clone());
        }
        
        // Add sell orders
        for entry in &self.sell_orders {
            sell_orders.push(entry.1.clone());
        }
        
        (buy_orders, sell_orders)
    }
    
    // Get an order by ID
    pub fn get_order_by_id(&self, order_id: &str) -> Option<&Order> {
        if let Some((is_buy, _)) = self.order_lookup.get(order_id) {
            let heap = if *is_buy { &self.buy_orders } else { &self.sell_orders };
            
            for entry in heap {
                if entry.1.id == order_id {
                    return Some(&entry.1);
                }
            }
        }
        
        None
    }
    
    // Remove an order by ID and return true if found and removed
    pub fn remove_order_by_id(&mut self, order_id: &str) -> bool {
        if let Some((is_buy, _)) = self.order_lookup.remove(order_id) {
            let heap = if is_buy { &mut self.buy_orders } else { &mut self.sell_orders };
            
            // Drain and keep all entries except the specific order we want to remove
            let original_size = heap.len();
            *heap = heap.drain()
                .filter(|entry| entry.1.id != order_id)
                .collect();
                
            return heap.len() < original_size;
        }
        
        false
    }

    // Get all mempoolorders by user ID
    pub fn get_orders_by_user_id(&self, user_id: &str) -> Vec<Order> {
        let mut orders = Vec::new();
        for entry in &self.buy_orders {
            if entry.1.user_id == user_id {
                orders.push(entry.1.clone());
            }
        }
        for entry in &self.sell_orders {
            if entry.1.user_id == user_id {
                orders.push(entry.1.clone());
            }
        }
        orders
    }
}

