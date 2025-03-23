use mongodb::{
    bson::{doc, to_document, from_document, Document},
    Client,
    options::ClientOptions,
    Collection,
};
use serde::{Serialize, Deserialize};
use std::error::Error;
use std::collections::{HashMap, VecDeque};
use crate::block::Block;
use crate::engine::MatchedEntry;
use crate::engine::Order;

pub struct BlockDatabase {
    uri: String,
    client: Option<Client>,
    collection: Option<Collection<Document>>,
    is_test: bool,
}

impl BlockDatabase {
    pub fn new(uri: &str, is_test: bool) -> Self {
        // Just store the URI, don't connect yet
        Self { 
            uri: uri.to_string(),
            client: None,
            collection: None,
            is_test,
        }
    }

    // Initialize the connection when needed
    pub async fn init(&mut self) -> Result<(), Box<dyn Error>> {
        if self.client.is_none() {
            let client = Client::with_uri_str(&self.uri).await?;
            let db = client.database("zkHyperLiquid");
            let collection = if self.is_test {
                db.collection("blocks_test")
            } else {
                db.collection("blocks")
            };
            
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

    pub async fn get_block(&mut self, id: &str) -> Result<Option<Block>, Box<dyn Error>> {
        self.ensure_connected().await?;
        let collection = self.collection.as_ref().unwrap();
        
        let filter = doc! { "id": id };
        let doc = collection.find_one(filter).await?;
        
        match doc {
            Some(doc) => {
                // Convert document to Block
                let id = doc.get_str("id")?.to_string();
                let timestamp = doc.get_i64("timestamp")? as u64;
                let length = doc.get_i64("length")? as u64;
                
                // Deserialize logs from the document
                let logs = if let Ok(logs_json) = doc.get_str("logs") {
                    deserialize_logs(logs_json)?
                } else {
                    HashMap::new()
                };
                
                let block = Block {
                    id,
                    timestamp,
                    length,
                    logs,
                };
                
                Ok(Some(block))
            },
            None => Ok(None),
        }
    }

    pub async fn save_block(&mut self, block: &Block) -> Result<(), Box<dyn Error>> {
        self.ensure_connected().await?;
        let collection = self.collection.as_ref().unwrap();
        
        // Serialize logs to JSON string
        let logs_json = serialize_logs(&block.logs);
        
        // Convert Block to Document
        let doc = doc! {
            "id": &block.id,
            "timestamp": block.timestamp as i64,
            "length": block.length as i64,
            "logs": logs_json,
        };
        
        collection.insert_one(doc).await?;
        Ok(())
    }

    pub async fn get_latest_blocks(&mut self, limit: i64) -> Result<Vec<Block>, Box<dyn Error>> {
        self.ensure_connected().await?;
        let collection = self.collection.as_ref().unwrap();
        
        // Create an empty filter document to match all documents
        let filter = doc! {};
        
        // Create options for sorting and limiting results
        let options = mongodb::options::FindOptions::builder()
            .sort(doc! { "timestamp": -1 })
            .limit(limit)
            .build();
        
        // Pass both filter and options to find
        let mut cursor = collection.find(filter).with_options(options).await?;
        
        let mut blocks = Vec::new();
        while cursor.advance().await? {
            let doc = cursor.current();
            
            // Convert document to Block
            let id = doc.get_str("id")?.to_string();
            let timestamp = doc.get_i64("timestamp")? as u64;
            let length = doc.get_i64("length")? as u64;
            
            // Deserialize logs from the document
            let logs = if let Ok(logs_json) = doc.get_str("logs") {
                deserialize_logs(logs_json)?
            } else {
                HashMap::new()
            };
            
            let block = Block {
                id,
                timestamp,
                length,
                logs,
            };
            
            blocks.push(block);
        }
        
        Ok(blocks)
    }
}

// Serialize logs to json string
fn serialize_logs(logs: &HashMap<String, VecDeque<MatchedEntry>>) -> String {
    let json = serde_json::to_string(logs).unwrap();
    json
}

// Deserialize logs from json string
fn deserialize_logs(json: &str) -> Result<HashMap<String, VecDeque<MatchedEntry>>, Box<dyn Error>> {
    let logs: HashMap<String, VecDeque<MatchedEntry>> = serde_json::from_str(json)?;
    Ok(logs)
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_serialize_logs() {
        let mut logs = HashMap::new();
        logs.insert("BTCUSDT".to_string(), VecDeque::from([
            MatchedEntry {
                timestamp: 1,
                buy_order: Order::new(
                    "order1".to_string(),
                    "user1".to_string(),
                    "BTCUSDT".to_string(),
                    100,
                    10,
                    true
                ),
                sell_order: Order::new(
                    "order2".to_string(),
                    "user2".to_string(),
                    "BTCUSDT".to_string(),
                    100,
                    10,
                    false
                ),
                matched_amount: 1,
            },
        ]));
        
        let json = serialize_logs(&logs);
        
        // Instead of checking the exact string, verify that it contains the expected data
        assert!(json.contains("\"BTCUSDT\""));
        assert!(json.contains("\"timestamp\":1"));
        assert!(json.contains("\"buy_order\""));
        assert!(json.contains("\"sell_order\""));
        assert!(json.contains("\"matched_amount\":1"));
        assert!(json.contains("\"id\":\"order1\""));
        assert!(json.contains("\"id\":\"order2\""));
    }

    #[test]
    fn test_deserialize_logs() {
        let json = "{\"BTCUSDT\":[{\"timestamp\":1,\"buy_order\":{\"id\":\"order1\",\"user_id\":\"user1\",\"pair_id\":\"BTCUSDT\",\"amount\":100,\"filled_amount\":0,\"price\":10,\"side\":true,\"status\":\"Pending\",\"created_at\":1742704200,\"updated_at\":1742704200},\"sell_order\":{\"id\":\"order2\",\"user_id\":\"user2\",\"pair_id\":\"BTCUSDT\",\"amount\":100,\"filled_amount\":0,\"price\":10,\"side\":false,\"status\":\"Pending\",\"created_at\":1742704200,\"updated_at\":1742704200},\"matched_amount\":1}]}";
        let logs = deserialize_logs(&json).unwrap();
        // Get the BTCUSDT queue from the logs
        let btc_queue = logs.get("BTCUSDT").expect("BTCUSDT pair should exist");
        assert_eq!(btc_queue.len(), 1);
        
        // Check the matched entry details
        let entry = &btc_queue[0];
        assert_eq!(entry.timestamp, 1);
        assert_eq!(entry.matched_amount, 1);
        
        // Check buy order details
        let buy_order = &entry.buy_order;
        assert_eq!(buy_order.id, "order1");
        assert_eq!(buy_order.user_id, "user1");
        assert_eq!(buy_order.pair_id, "BTCUSDT");
        assert_eq!(buy_order.amount, 100);
        assert_eq!(buy_order.price, 10);
        assert_eq!(buy_order.side, true);
        
        // Check sell order details
        let sell_order = &entry.sell_order;
        assert_eq!(sell_order.id, "order2");
        assert_eq!(sell_order.user_id, "user2");
        assert_eq!(sell_order.pair_id, "BTCUSDT");
        assert_eq!(sell_order.amount, 100);
        assert_eq!(sell_order.price, 10);
        assert_eq!(sell_order.side, false);
    }

    #[tokio::test]
    async fn test_save_block() {
        let mut block_db = BlockDatabase::new("mongodb://localhost:27017", true);
        
        // Skip the test if we can't connect to MongoDB
        if let Err(_) = block_db.init().await {
            println!("Skipping test_save_block: MongoDB connection failed");
            return;
        }
        
        let logs = HashMap::from([("BTCUSDT".to_string(), VecDeque::from([
            MatchedEntry {
                timestamp: 1,
                buy_order: Order::new(
                    "order1".to_string(),
                    "user1".to_string(),
                    "BTCUSDT".to_string(),
                    100,
                    10,
                    true
                ),
                sell_order: Order::new(
                    "order2".to_string(),
                    "user2".to_string(),
                    "BTCUSDT".to_string(),
                    80,
                    10,
                    false
                ),
                matched_amount: 80,
            }
        ]))]);
        
        let block = Block::new(logs);
        block_db.save_block(&block).await.unwrap();

        let retrieved_block = block_db.get_block(&block.id).await.unwrap();
        assert!(retrieved_block.is_some(), "Block should be retrieved successfully");
        
        let retrieved_block = retrieved_block.unwrap();
        assert_eq!(retrieved_block.id, block.id);
        assert_eq!(retrieved_block.timestamp, block.timestamp);
        assert_eq!(retrieved_block.length, block.length);
        
        // Verify the logs were properly saved and retrieved
        assert!(retrieved_block.logs.contains_key("BTCUSDT"), "BTCUSDT pair should exist");
        
        if let Some(btc_queue) = retrieved_block.logs.get("BTCUSDT") {
            assert_eq!(btc_queue.len(), 1);
            let entry = &btc_queue[0];
            assert_eq!(entry.timestamp, 1);
            assert_eq!(entry.matched_amount, 80);
        }
    }

    #[tokio::test]
    async fn test_get_latest_blocks() {
        let mut block_db = BlockDatabase::new("mongodb://localhost:27017", true);
        block_db.init().await.unwrap();
        
        let logs = HashMap::from([("BTCUSDT".to_string(), VecDeque::from([
            MatchedEntry {
                timestamp: 1,
                buy_order: Order::new(
                    "order1".to_string(),
                    "user1".to_string(),
                    "BTCUSDT".to_string(),
                    100,
                    10,
                    true
                ),
                sell_order: Order::new(
                    "order2".to_string(),
                    "user2".to_string(),
                    "BTCUSDT".to_string(),
                    80,
                    10,
                    false
                ),
                matched_amount: 80,
            }
        ]))]);
        
        let block = Block::new(logs);
        block_db.save_block(&block).await.unwrap();

        let retrieved_blocks = block_db.get_latest_blocks(1).await.unwrap();
        assert_eq!(retrieved_blocks.len(), 1);
        assert_eq!(retrieved_blocks[0].id, block.id);
    }
}

