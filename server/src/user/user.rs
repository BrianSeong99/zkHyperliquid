use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Serialize, Deserialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct User {
    pub address: String,
    pub balances: HashMap<String, u64>, // token_id -> balance
    pub created_at: u64,
    pub updated_at: u64
}

impl User {
    // Create a new user with a given address and balance
    pub fn new(address: String) -> Self {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        Self { 
            address, 
            balances: HashMap::new(), 
            created_at: now, 
            updated_at: now
        }
    }

    pub fn new_with_balances(address: String, balances: HashMap<String, u64>) -> Self {
        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        Self { 
            address, 
            balances, 
            created_at: now, 
            updated_at: now
        }
    }

    // Get the balance of a token for the user
    pub fn get_balance(&self, token_id: &str) -> u64 {
        *self.balances.get(token_id).unwrap_or(&0)
    }

    // Set the balance of a token for the user
    pub fn set_balance(&mut self, token_id: String, balance: u64) {
        self.balances.insert(token_id, balance);
        self.updated_at = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    }

    pub fn get_balances(&self) -> HashMap<String, u64> {
        self.balances.clone()
    }

    pub fn set_balances(&mut self, balances: HashMap<String, u64>) {
        for (token_id, balance) in balances.iter() {
            if balance < &0 {
                panic!("Balance cannot be negative");
            }
        }
        self.balances = balances;
        self.updated_at = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    }

    pub fn add_balance(&mut self, token_id: String, amount: u64) {
        *self.balances.entry(token_id.to_string()).or_insert(0) += amount;
        self.updated_at = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    }

    pub fn sub_balance(&mut self, token_id: String, amount: u64) {
        if let Some(balance) = self.balances.get_mut(&token_id) {
            *balance = balance.saturating_sub(amount);
        }
        self.updated_at = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
    }
    
}
