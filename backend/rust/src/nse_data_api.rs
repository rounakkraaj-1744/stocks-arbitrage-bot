use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::time::Duration;
use log::{warn, info, error};
use rand::Rng;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StockPrice {
    pub symbol: String,
    pub ltp: f64,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FuturesPrice {
    pub symbol: String,
    pub expiry: String,
    pub ltp: f64,
    pub timestamp: String,
}

fn get_yahoo_symbol(symbol: &str) -> String {
    format!("{}.NS", symbol)
}

fn generate_futures_price_from_spot(spot: f64) -> f64 {
    let mut rng = rand::rng();
    
    if rng.random_bool(0.7) {
        let premium = rng.random_range(0.003..0.012);
        spot * (1.0 + premium)
    } else {
        let discount = rng.random_range(0.002..0.008);
        spot * (1.0 - discount)
    }
}

pub fn create_nse_client() -> Client {
    Client::builder()
        .timeout(Duration::from_secs(15)) // Increased timeout
        .build()
        .unwrap()
}

pub async fn fetch_nse_spot_price(
    client: &Client,
    symbol: &str,
) -> Result<StockPrice, Box<dyn std::error::Error + Send + Sync>> {
    
    let yahoo_symbol = get_yahoo_symbol(symbol);
    
    let url = format!(
        "https://query1.finance.yahoo.com/v8/finance/chart/{}?interval=1d&range=1d",
        yahoo_symbol
    );
    
    info!("Fetching Yahoo Finance URL: {}", url);
    
    let resp = client
        .get(&url)
        .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .send()
        .await
        .map_err(|e| {
            error!("Network error for {}: {:?}", symbol, e);
            e
        })?;
    
    let status = resp.status();
    if !status.is_success() {
        error!("Yahoo Finance API error for {}: HTTP {}", symbol, status);
        return Err(format!("Yahoo Finance API error: {}", status).into());
    }
    
    let text = resp.text().await?;
    
    if text.is_empty() {
        error!("Empty response from Yahoo Finance for {}", symbol);
        return Err("Empty response from Yahoo Finance".into());
    }
    
    let parsed: Value = serde_json::from_str(&text)
        .map_err(|e| {
            error!("JSON parse error for {}: {:?}", symbol, e);
            error!("Response text: {}", &text[..text.len().min(200)]);
            e
        })?;
    
    // Try multiple fields to get the price
    let ltp = parsed["chart"]["result"][0]["meta"]["regularMarketPrice"]
        .as_f64()
        .or_else(|| parsed["chart"]["result"][0]["meta"]["previousClose"].as_f64())
        .or_else(|| parsed["chart"]["result"][0]["meta"]["chartPreviousClose"].as_f64())
        .ok_or_else(|| {
            error!("No price found in Yahoo response for {}", symbol);
            error!("Available fields: {:?}", parsed["chart"]["result"][0]["meta"]);
            "Yahoo Finance price missing"
        })?;
    
    info!("✓ Successfully fetched {} spot price: ₹{:.2}", symbol, ltp);
    
    Ok(StockPrice {
        symbol: symbol.to_string(),
        ltp,
        timestamp: chrono::Local::now().to_rfc3339(),
    })
}

pub async fn fetch_nse_futures_price(
    client: &Client,
    symbol: &str,
    expiry: &str,
) -> Result<FuturesPrice, Box<dyn std::error::Error + Send + Sync>> {
    
    let spot = fetch_nse_spot_price(client, symbol).await?;
    let futures_ltp = generate_futures_price_from_spot(spot.ltp);
    
    warn!("Simulated futures price for {}: ₹{:.2} (Yahoo doesn't provide futures data)", symbol, futures_ltp);
    
    Ok(FuturesPrice {
        symbol: symbol.to_string(),
        expiry: expiry.to_string(),
        ltp: futures_ltp,
        timestamp: chrono::Local::now().to_rfc3339(),
    })
}
