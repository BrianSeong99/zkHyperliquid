use mongodb::{
    Client,
    options::ClientOptions,
    sync::Collection,
};
use crate::user_db::user::User;

pub struct UserDatabase {
    collection: Collection<User>,
}

impl UserDatabase {
    pub fn new(uri: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let client_options = ClientOptions::parse(uri)?;
        let client = Client::with_options(client_options)?;
        let db = client.database("user_db");
        let collection = db.collection("users");
        Ok(Self { collection })
    }

    pub fn get_user(&self, address: &str) -> Result<Option<User>, Box<dyn std::error::Error>> {
        let user = self.collection.find_one(doc! { "address": address }, None)?;
        Ok(user)
    }

    pub fn update_user(&self, address: &str, user: &User) -> Result<(), Box<dyn std::error::Error>> {
        self.collection.update_one(doc! { "address": address }, doc! { "$set": user }, None)?;
        Ok(())
    }

    pub fn create_user(&self, user: &User) -> Result<(), Box<dyn std::error::Error>> {
        self.collection.insert_one(user, None)?;
        Ok(())
    }
}