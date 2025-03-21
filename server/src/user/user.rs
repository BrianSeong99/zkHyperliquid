pub struct User {
    pub address: String,
    pub balance: u64
}

impl User {
    // Create a new user with a given address and balance
    pub fn new(address: String, balance: u64) -> Self {
        Self { address, balance }
    }

    // Get the balance of the user
    pub fn get_balance(&self) -> u64 {
        self.balance
    }

    // Set the balance of the user
    pub fn set_balance(&mut self, balance: u64) {
        self.balance = balance;
    }
}
