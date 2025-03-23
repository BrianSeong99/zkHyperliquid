mod api;
mod engine;
mod user;
mod block;

use engine::{run_order_pipeline, MATCHED_LOGS, ORDERS_MEMPOOL};
use user::{UserDatabase};
use axum::{
    routing::{get, post, put, delete},
    Router,
};
use std::sync::{Arc, RwLock};
use tokio::sync::mpsc;
use std::net::SocketAddr;
use tokio::sync::Mutex;
use std::time::Duration;
use crate::block::{BlockManager, run_block_pipeline};
use crate::api::orders::{AppState, place_order, get_orders, get_order_by_id, cancel_order};
use crate::api::users::{create_user, get_user, update_balance, get_user_orders};
// use crate::api::blocks::get_matched_orders;
// use crate::api::users::get_user;

#[tokio::main]
async fn main() {
    // Initialize logger
    env_logger::init();
    
    // Initialize user database
    let uri = std::env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
    let user_db = Arc::new(Mutex::new(UserDatabase::new(&uri)));

    // Set up the order matching engine
    let order_tx = run_order_pipeline(0.0, user_db.clone()).await;
    
    // Set up the block manager
    let block_manager = BlockManager::new(Duration::from_millis(10), 100, 0, "".to_string(), "mongodb://localhost:27017".to_string(), true);
    run_block_pipeline(block_manager, Duration::from_millis(20)).await;

    // Create the application state
    let app_state = AppState {
        order_tx,
        user_db,
    };
    
    // Build our application with routes
    // Order routes
    let orders_router = Router::new()
        .route("/api/orders", post(place_order))
        .route("/api/orders", get(get_orders))
        .route("/api/orders/{order_id}", get(get_order_by_id))
        .route("/api/orders/{order_id}", delete(cancel_order))
        .with_state(app_state.clone());
    // User routes
    let users_router = Router::new()
        .route("/api/users", post(create_user))
        .route("/api/users/{address}", get(get_user))
        .route("/api/users/{address}/balance", put(update_balance))
        .route("/api/users/{address}/orders", get(get_user_orders))
        .with_state(app_state);
    
    let app = Router::new()
        .merge(orders_router)
        .merge(users_router);
    // Run the server
    println!("Server listening on 0.0.0.0:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

    