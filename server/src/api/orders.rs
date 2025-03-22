use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
    response::{IntoResponse, Response},
};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use std::sync::{Arc, RwLock};
use std::collections::HashMap;
use tokio::sync::Mutex;

use crate::engine::{Order, OrdersMempool, MATCHED_LOGS, ORDERS_MEMPOOL};
use crate::user::UserDatabase;

#[derive(Clone)]
pub struct AppState {
    pub order_tx: mpsc::Sender<Order>,
    pub user_db: Arc<Mutex<UserDatabase>>,
}

#[derive(Deserialize)]
pub struct PlaceOrderRequest {
    user_id: String,
    pair_id: String,
    amount: u64,
    price: u64,
    side: bool, // true for buy, false for sell
}

#[derive(Serialize, Debug)]
pub struct OrderResponse {
    id: String,
    user_id: String,
    pair_id: String,
    amount: u64,
    filled_amount: u64,
    price: u64,
    side: bool,
    status: String,
    created_at: u64,
    updated_at: u64,
}

impl From<Order> for OrderResponse {
    fn from(order: Order) -> Self {
        Self {
            id: order.id,
            user_id: order.user_id,
            pair_id: order.pair_id,
            amount: order.amount,
            filled_amount: order.filled_amount,
            price: order.price,
            side: order.side,
            status: format!("{:?}", order.status),
            created_at: order.created_at,
            updated_at: order.updated_at,
        }
    }
}

#[derive(Deserialize)]
pub struct GetOrdersQuery {
    pair_id: Option<String>,
    side: Option<bool>,
    page: Option<usize>,
    limit: Option<usize>,
}

#[derive(Serialize, Debug)]
pub struct GetOrdersResponse {
    orders: Vec<OrderResponse>,
    total: usize,
    page: usize,
    limit: usize,
}

// Place a new order
pub async fn place_order(
    State(state): State<AppState>,
    Json(req): Json<PlaceOrderRequest>,
) -> Result<Json<OrderResponse>, StatusCode> {
    // Generate a unique order ID (in production, use UUID)
    let order_id = format!("order_{}", std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos());
    
    // Create the order
    let order = Order::new(
        order_id,
        req.user_id,
        req.pair_id,
        req.amount,
        req.price,
        req.side,
    );
    
    // Send the order to the matching engine
    if let Err(_) = state.order_tx.send(order.clone()).await {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }
    
    // Return the created order
    Ok(Json(OrderResponse::from(order)))
}

// Get orders from the mempool with pagination
pub async fn get_orders(
    State(state): State<AppState>,
    Query(params): Query<GetOrdersQuery>,
) -> Result<Json<GetOrdersResponse>, StatusCode> {
    let pair_id = params.pair_id.unwrap_or_else(|| "".to_string());
    let side = params.side;
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(10).min(100);
    
    // Read from the mempool
    let mempool = ORDERS_MEMPOOL.read().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Get all orders from the mempool
    let (buy_orders, sell_orders) = mempool.get_all_orders();
    
    // Filter and combine orders based on parameters
    let mut filtered_orders = Vec::new();
    
    // Add buy orders if no side filter or side=true
    if side.is_none() || side == Some(true) {
        filtered_orders.extend(
            buy_orders.into_iter()
                .filter(|order| pair_id.is_empty() || order.pair_id == pair_id)
        );
    }
    
    // Add sell orders if no side filter or side=false
    if side.is_none() || side == Some(false) {
        filtered_orders.extend(
            sell_orders.into_iter()
                .filter(|order| pair_id.is_empty() || order.pair_id == pair_id)
        );
    }
    
    let total = filtered_orders.len();
    
    // Paginate the results
    let start = (page - 1) * limit;
    let end = (start + limit).min(total);
    
    let paginated_orders = if start < total {
        filtered_orders[start..end].to_vec()
    } else {
        Vec::new()
    };
    
    // Convert to response format
    let order_responses: Vec<OrderResponse> = paginated_orders
        .into_iter()
        .map(OrderResponse::from)
        .collect();
    
    Ok(Json(GetOrdersResponse {
        orders: order_responses,
        total,
        page,
        limit,
    }))
}

// Get a specific order by ID
pub async fn get_order_by_id(
    State(state): State<AppState>,
    Path(order_id): Path<String>,
) -> Result<Json<OrderResponse>, StatusCode> {
    // Read from the mempool
    let mempool = ORDERS_MEMPOOL.read().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Find the order by ID
    if let Some(order) = mempool.get_order_by_id(&order_id) {
        Ok(Json(OrderResponse::from(order.clone())))
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

// Cancel an order
pub async fn cancel_order(
    State(state): State<AppState>,
    Path(order_id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    // Get write access to the mempool
    let mut mempool = ORDERS_MEMPOOL.write().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Remove the order from the mempool
    if mempool.remove_order_by_id(&order_id) {
        Ok(StatusCode::OK)
    } else {
        Err(StatusCode::NOT_FOUND)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::engine::Order;
    use tokio::sync::mpsc;

    #[tokio::test]
    async fn test_place_order() {
        let (order_tx, mut order_rx) = mpsc::channel(1000);
        let uri = std::env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        let user_db = Arc::new(Mutex::new(UserDatabase::new(&uri)));
        let state = AppState { order_tx, user_db };

        let order = Order::new(
            "order_1".to_string(),
            "user_1".to_string(),
            "BTC/USD".to_string(),
            100,
            10000,
            true
        );

        let _ = state.order_tx.send(order.clone()).await;

        let received_order = order_rx.recv().await.unwrap();
        assert_eq!(order, received_order);
    }

    #[tokio::test]
    async fn test_get_orders() {
        let (order_tx, _) = mpsc::channel(1000);
        let uri = std::env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        let user_db = Arc::new(Mutex::new(UserDatabase::new(&uri)));
        let state = AppState { order_tx, user_db };

        // Add order to the global mempool
        let mut mempool = ORDERS_MEMPOOL.write().unwrap();
        mempool.add_order(Order::new(
            "order_1".to_string(),
            "user_1".to_string(),
            "BTC/USD".to_string(),
            100,
            10000,
            true
        ));
        drop(mempool);

        let query = GetOrdersQuery {
            pair_id: None,
            side: None,
            page: Some(1),
            limit: Some(10),
        };

        // Wrap with State and Query extractors
        let response = get_orders(State(state), Query(query)).await.unwrap();
        assert_eq!(response.orders[response.orders.len()-1].id, "order_1");
    }

    #[tokio::test]
    async fn test_get_order_by_id() {
        let (order_tx, _) = mpsc::channel(1000);
        let uri = std::env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        let user_db = Arc::new(Mutex::new(UserDatabase::new(&uri)));
        let state = AppState { order_tx, user_db };

        // Add order to the global mempool
        let mut mempool = ORDERS_MEMPOOL.write().unwrap();
        mempool.add_order(Order::new(
            "order_1".to_string(),
            "user_1".to_string(),
            "BTC/USD".to_string(),
            100,
            10000,
            true
        ));
        drop(mempool);

        // Wrap with State and Path extractors
        let response = get_order_by_id(State(state), Path("order_1".to_string())).await.unwrap();
        assert_eq!(response.id, "order_1");
    }

    #[tokio::test]
    async fn test_cancel_order() {
        let (order_tx, _) = mpsc::channel(1000);
        let uri = std::env::var("MONGODB_URI").unwrap_or_else(|_| "mongodb://localhost:27017".to_string());
        let user_db = Arc::new(Mutex::new(UserDatabase::new(&uri)));
        let state = AppState { order_tx, user_db };

        // Add order to the global mempool
        let mut mempool = ORDERS_MEMPOOL.write().unwrap();
        mempool.add_order(Order::new(
            "order_1".to_string(),
            "user_1".to_string(),
            "BTC/USD".to_string(),
            100,
            10000,
            true
        ));
        drop(mempool);

        // Wrap with State and Path extractors
        let response = cancel_order(State(state), Path("order_1".to_string())).await.unwrap();
        assert_eq!(response, StatusCode::OK);
    }
}
