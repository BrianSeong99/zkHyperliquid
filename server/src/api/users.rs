use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
    response::{IntoResponse, Response},
};
use axum_macros::debug_handler;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use crate::user::{User, UserDatabase};
use crate::api::orders::AppState;

use crate::engine::{Order, ORDERS_MEMPOOL};


#[derive(Deserialize)]
pub struct CreateUserRequest {
    address: String,
    initial_balances: Option<HashMap<String, u64>>,
}

#[derive(Serialize, Debug)]
pub struct UserResponse {
    address: String,
    balances: HashMap<String, u64>,
    created_at: u64,
    updated_at: u64,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        Self {
            address: user.address,
            balances: user.balances,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    }
}

#[derive(Deserialize)]
pub struct UpdateBalanceRequest {
    token_id: String,
    amount: u64,
    is_addition: bool, // true for adding balance, false for subtracting
}

#[derive(Serialize, Debug)]
pub struct UserOrdersResponse {
    orders: Vec<Order>,
}

impl From<Vec<Order>> for UserOrdersResponse {
    fn from(orders: Vec<Order>) -> Self {
        Self { orders }
    }
}

impl From<Vec<&Order>> for UserOrdersResponse {
    fn from(orders: Vec<&Order>) -> Self {
        let owned_orders: Vec<Order> = orders.iter().map(|&order| order.clone()).collect();
        Self { orders: owned_orders }
    }
}

// Create a new user
#[debug_handler]
pub async fn create_user(
    State(state): State<AppState>,
    Json(req): Json<CreateUserRequest>,
) -> Result<Json<UserResponse>, StatusCode> {
    let mut user_db = state.user_db.lock().await;
    
    // Check if user already exists
    if let Ok(Some(_)) = user_db.get_user(&req.address).await {
        return Err(StatusCode::CONFLICT);
    }
    
    // Create new user
    let user = if let Some(balances) = req.initial_balances {
        User::new_with_balances(req.address, balances)
    } else {
        User::new(req.address)
    };
    
    // Save to database
    if let Err(_) = user_db.create_user(&user).await {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }
    
    Ok(Json(UserResponse::from(user)))
}

// Get user by address
#[debug_handler]
pub async fn get_user(
    State(state): State<AppState>,
    Path(address): Path<String>,
) -> Result<Json<UserResponse>, StatusCode> {
    let mut user_db = state.user_db.lock().await;
    match user_db.get_user(&address).await {
        Ok(Some(user)) => Ok(Json(UserResponse::from(user))),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

// Update user balance
#[debug_handler]
pub async fn update_balance(
    State(state): State<AppState>,
    Path(address): Path<String>,
    Json(req): Json<UpdateBalanceRequest>,
) -> Result<Json<UserResponse>, StatusCode> {
    let mut user_db = state.user_db.lock().await;
    
    // Get user
    let mut user = match user_db.get_user(&address).await {
        Ok(Some(user)) => user,
        Ok(None) => return Err(StatusCode::NOT_FOUND),
        Err(_) => return Err(StatusCode::INTERNAL_SERVER_ERROR),
    };
    
    // Update balance
    if req.is_addition {
        user.add_balance(req.token_id, req.amount);
    } else {
        // Handle insufficient balance
        if user.get_balance(&req.token_id) < req.amount {
            return Err(StatusCode::BAD_REQUEST);
        }
        user.sub_balance(req.token_id, req.amount);
    }
    
    // Save updated user
    if let Err(_) = user_db.update_user(&user).await {
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }
    
    Ok(Json(UserResponse::from(user)))
}

// Get user orders
// including orders in all status, pending, matched, settled
pub async fn get_user_orders(
    State(state): State<AppState>,
    Path(address): Path<String>,
) -> Result<Json<UserOrdersResponse>, StatusCode> {
    // Read from the mempool
    let mempool = ORDERS_MEMPOOL.read().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let orders = mempool.get_orders_by_user_id(&address);
    Ok(Json(UserOrdersResponse::from(orders)))
}   