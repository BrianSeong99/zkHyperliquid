mod engine;

// use axum::{
//     extract::{Path, State},
//     routing::{get, post},
//     Router
// };
// use std::sync::Arc;
// use crate::user_db::user_database::UserDatabase;

use engine::run_order_pipeline;
use engine::MATCHED_LOGS;

// pub async fn users_get(Path(wallet_address): Path<String>) -> String {
//     println!("Hello, {}!", wallet_address);
//     format!("Hello, {}!", wallet_address)
// }

// pub async fn orders_get(Path(pair_id): Path<String>) -> String {
//     println!("Hello, {}!", pair_id);
//     format!("Hello, {}!", pair_id)
// }

// pub async fn orders_post(Path(pair_id): Path<String>) -> String {
//     println!("Hello, {}!", pair_id);
//     format!("Hello, {}!", pair_id)
// }

#[tokio::main]
async fn main() {
    // let db = UserDatabase::new("mongodb://localhost:27017").unwrap();
    // let shared_state = Arc::new(db);

    // let users_api = Router::new().route("/users/{wallet_address}", get(users_get));
    // let orders_api = Router::new()
    //     .route("/orders/{pair_id}", get(orders_get))
    //     .route("/orders/{pair_id}", post(orders_post));
    // let app = Router::new()
    //     .nest("/api", users_api.merge(orders_api))
    //     .with_state(shared_state.clone());

    // let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    // axum::serve(listener, app).await.unwrap();

    let order_tx = run_order_pipeline(0.0005).await;

    // Submit orders
    // order_tx.send(new_order).await.unwrap();

    // Read matched orders
    let mut logs = MATCHED_LOGS.write().unwrap();
    let matches = logs.pop_top_n_matched_orders("BTC-USD", 10);
}