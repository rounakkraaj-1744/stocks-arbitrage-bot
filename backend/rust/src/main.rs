mod nse_data_api;
mod arbitrage_detector;
mod profit_calculator;
mod trend_tracker;
mod data_logger;
mod exchange_api;

use warp::Filter;
use warp::ws::{Message, WebSocket};
use serde::{Serialize, Deserialize};
use log::{info, error, warn};
use nse_data_api::{fetch_nse_spot_price, fetch_nse_futures_price, create_nse_client};
use arbitrage_detector::{detect_cash_futures_arbitrage, ArbitrageResult};
use trend_tracker::{create_spread_tracker, calculate_trend, SpreadHistory};
use data_logger::{initialize_csv_log, log_to_csv};
use std::convert::Infallible;
use tokio::sync::broadcast;
use tokio::time::{sleep, Duration};
use futures::{SinkExt, StreamExt};
use chrono::Timelike;

#[derive(Serialize, Deserialize)]
struct ArbitrageResponse {
    opportunity: bool,
    details: String,
}

const STOCKS_TO_MONITOR: &[&str] = &[
    "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
    "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT",
    "AXISBANK", "HINDUNILVR", "ASIANPAINT", "MARUTI", "BAJFINANCE"
];

const FUTURES_EXPIRY: &str = "28-Nov-2025";
const THRESHOLD_PERCENTAGE: f64 = 0.5;

#[tokio::main]
async fn main() {
    env_logger::init();
    info!("Starting NSE Arbitrage Engine with Yahoo Finance...");

    let now = chrono::Local::now();
    let hour = now.hour();
    let minute = now.minute();
    
    if hour < 9 || (hour == 9 && minute < 15) || hour > 15 || (hour == 15 && minute > 30) {
        info!("Market is closed. Using last traded prices from Yahoo Finance (15-min delayed).");
    } else {
        info!("Market is open. Fetching Yahoo Finance data (15-min delayed).");
    }

    let (tx, _rx) = broadcast::channel::<String>(100);
    let tx_clone = tx.clone();
    
    initialize_csv_log();
    
    let spread_history = create_spread_tracker();
    let spread_history_clone = spread_history.clone();

    tokio::spawn(async move {
        let client = create_nse_client();
        let mut retry_count = std::collections::HashMap::new();
        
        loop {
            info!("Starting new fetch cycle for {} stocks...", STOCKS_TO_MONITOR.len());
            
            for symbol in STOCKS_TO_MONITOR {
                let retries = retry_count.entry(symbol.to_string()).or_insert(0);
                
                match check_arbitrage(&client, symbol, FUTURES_EXPIRY, &spread_history_clone).await {
                    Ok(result) => {
                        log_to_csv(&result);
                        let json = serde_json::to_string(&result).unwrap();
                        let _ = tx_clone.send(json);
                        info!("✓ Successfully fetched {} (Spread: {:.2}%)", symbol, result.spread_percentage);
                        *retries = 0; // Reset retry count on success
                    }
                    Err(e) => {
                        *retries += 1;
                        error!("✗ Failed to fetch {} (attempt {}): {:?}", symbol, retries, e);
                        
                        // Skip this stock if it fails too many times
                        if *retries > 3 {
                            warn!("Skipping {} after {} failed attempts", symbol, retries);
                        }
                    }
                }
                
                // Shorter delay between stocks
                sleep(Duration::from_millis(800)).await;
            }
            
            info!("Cycle complete. Waiting 5 seconds before next cycle...");
            sleep(Duration::from_secs(5)).await;
        }
    });

    let tx_filter = warp::any().map(move || tx.clone());
    let ws_route = warp::path("ws")
        .and(warp::ws())
        .and(tx_filter)
        .map(|ws: warp::ws::Ws, tx: broadcast::Sender<String>| {
            ws.on_upgrade(move |socket| handle_ws_connection(socket, tx))
        });

    let arbitrage_route = warp::path("arbitrage")
        .and(warp::path::param::<String>())
        .and(warp::get())
        .and_then(handle_arbitrage_check);

    let routes = ws_route.or(arbitrage_route);

    info!("Server running on http://127.0.0.1:3030");
    info!("WebSocket endpoint: ws://127.0.0.1:3030/ws");
    
    warp::serve(routes)
        .run(([127, 0, 0, 1], 3030))
        .await;
}

async fn handle_ws_connection(ws: WebSocket, tx: broadcast::Sender<String>) {
    let (mut ws_tx, mut ws_rx) = ws.split();
    let mut rx = tx.subscribe();

    tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if ws_tx.send(Message::text(msg)).await.is_err() {
                break;
            }
        }
    });

    while let Some(result) = ws_rx.next().await {
        if result.is_err() {
            break;
        }
    }
}

async fn handle_arbitrage_check(symbol: String) -> Result<impl warp::Reply, Infallible> {
    let client = create_nse_client();
    let spread_history = create_spread_tracker();

    match check_arbitrage(&client, &symbol, FUTURES_EXPIRY, &spread_history).await {
        Ok(result) => Ok(warp::reply::json(&result)),
        Err(e) => {
            error!("Error fetching data for {}: {:?}", symbol, e);
            let response = ArbitrageResponse {
                opportunity: false,
                details: format!("Failed to fetch data: {:?}", e),
            };
            Ok(warp::reply::json(&response))
        }
    }
}

async fn check_arbitrage(
    client: &reqwest::Client,
    symbol: &str,
    expiry: &str,
    spread_history: &SpreadHistory,
) -> Result<ArbitrageResult, Box<dyn std::error::Error + Send + Sync>> {
    info!("Fetching data for {}...", symbol);
    
    let spot = fetch_nse_spot_price(client, symbol).await?;
    let futures = fetch_nse_futures_price(client, symbol, expiry).await?;

    let mut result = detect_cash_futures_arbitrage(
        symbol,
        spot.ltp,
        futures.ltp,
        THRESHOLD_PERCENTAGE,
    );

    result.spread_trend = calculate_trend(symbol, result.spread_percentage, spread_history);

    Ok(result)
}
