use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum OrderStatus {
    Pending,
    PartiallyFilled,
    Filled,
    Cancelled,
    Settled,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Order {
    pub id: String,
    pub user_id: String,
    pub pair_id: String,
    pub amount: u64,
    pub filled_amount: u64,  // Track how much has been filled
    pub price: u64,
    pub side: bool,
    pub status: OrderStatus,
    pub created_at: u64,
    pub updated_at: u64,
}

impl PartialEq for Order {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id
    }
}

impl Eq for Order {}

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
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        
        Self { 
            id, user_id, pair_id, amount,
            filled_amount: 0,
            price, side,
            status: OrderStatus::Pending, 
            created_at: now,
            updated_at: now
        }
    }

    pub fn set_status(&mut self, status: OrderStatus) {
        self.status = status;
        self.updated_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
    }

    pub fn get_status(&self) -> OrderStatus {
        self.status.clone()
    }

    pub fn remaining_amount(&self) -> u64 {
        self.amount - self.filled_amount
    }

    pub fn is_filled(&self) -> bool {
        self.filled_amount >= self.amount
    }

    pub fn fill(&mut self, amount: u64) {
        self.filled_amount += amount;
        if self.is_filled() {
            self.status = OrderStatus::Filled;
        }
    }
}