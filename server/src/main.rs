mod api;
mod engine;

use engine::{run_order_pipeline, MATCHED_LOGS, ORDERS_MEMPOOL};

use axum::{
    routing::{get, post, delete},
    Router,
};
use std::sync::{Arc, RwLock};
use tokio::sync::mpsc;
use std::net::SocketAddr;

use crate::api::orders::{AppState, place_order, get_orders, get_order_by_id, cancel_order};
// use crate::api::blocks::get_matched_orders;
// use crate::api::users::get_user;

#[tokio::main]
async fn main() {
    // Initialize logger
    env_logger::init();
    
    // Set up the order matching engine
    let order_tx = run_order_pipeline(0.05).await;
    
    // Create the application state
    let app_state = AppState {
        order_tx,
    };
    
    // Build our application with routes
    let app = Router::new()
        // Order routes
        .route("/api/orders", post(place_order))
        .route("/api/orders", get(get_orders))
        .route("/api/orders/{order_id}", get(get_order_by_id))
        .route("/api/orders/{order_id}", delete(cancel_order))
        .with_state(app_state);
    
    // Run the server
    println!("Server listening on 0.0.0.0:3000");
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

    