use mongodb::{
    bson::{doc, to_document},
    Client,
    options::ClientOptions,
    Collection,
};
use serde::{Serialize, Deserialize};
use std::error::Error;
use crate::user::User;

pub struct UserDatabase {
    uri: String,
    client: Option<Client>,
    collection: Option<Collection<User>>,
}

impl UserDatabase {
    pub fn new(uri: &str) -> Self {
        // Just store the URI, don't connect yet
        Self { 
            uri: uri.to_string(),
            client: None,
            collection: None,
        }
    }

    // Initialize the connection when needed
    pub async fn init(&mut self) -> Result<(), Box<dyn Error>> {
        if self.client.is_none() {
            let client = Client::with_uri_str(&self.uri).await?;
            let db = client.database("zkHyperLiquid");
            let collection = db.collection("users");
            
            self.client = Some(client);
            self.collection = Some(collection);
        }
        Ok(())
    }

    // Make sure we're connected before operations
    async fn ensure_connected(&mut self) -> Result<(), Box<dyn Error>> {
        if self.collection.is_none() {
            self.init().await?;
        }
        Ok(())
    }

    pub async fn get_user(&mut self, address: &str) -> Result<Option<User>, Box<dyn Error>> {
        self.ensure_connected().await?;
        let collection = self.collection.as_ref().unwrap();
        
        let filter = doc! { "address": address };
        let user = collection.find_one(filter).await?;
        Ok(user)
    }

    pub async fn update_user(&mut self, user: &User) -> Result<(), Box<dyn Error>> {
        self.ensure_connected().await?;
        let collection = self.collection.as_ref().unwrap();
        
        let filter = doc! { "address": &user.address };
        let update = doc! { "$set": to_document(user)? };
        collection.update_one(filter, update).await?;
        Ok(())
    }

    pub async fn create_user(&mut self, user: &User) -> Result<(), Box<dyn Error>> {
        self.ensure_connected().await?;
        let collection = self.collection.as_ref().unwrap();
        
        collection.insert_one(user).await?;
        Ok(())
    }

    pub async fn get_or_create_user(&mut self, address: &str) -> Result<User, Box<dyn Error>> {
        if let Some(user) = self.get_user(address).await? {
            Ok(user)
        } else {
            let user = User::new(address.to_string());
            self.create_user(&user).await?;
            Ok(user)
        }
    }
}