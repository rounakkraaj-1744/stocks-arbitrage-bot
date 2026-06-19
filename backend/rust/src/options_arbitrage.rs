use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionContract {
    pub symbol: String,
    pub strike_price: f64,
    pub expiry_date: String,
    pub call_price: f64,
    pub put_price: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PutCallParityOpportunity {
    pub symbol: String,
    pub strike_price: f64,
    pub expiry_date: String,
    pub spot_price: f64,
    pub synthetic_futures_price: f64, // call_price - put_price + strike_price / (1+r*t)
    pub actual_futures_price: f64,
    pub deviation: f64,
    pub is_opportunity: bool,
}

pub fn detect_put_call_parity(
    spot: f64,
    futures: f64,
    call_price: f64,
    put_price: f64,
    strike: f64,
    risk_free_rate: f64,
    time_to_expiry_years: f64,
) -> PutCallParityOpportunity {
    // Basic PCP: C - P = S - X / (1 + r)^t
    // For futures equivalence: F = S * (1 + r)^t
    // Simplified synthetic futures: C - P + X
    
    let discount_factor = (1.0 + risk_free_rate).powf(time_to_expiry_years);
    let pv_strike = strike / discount_factor;
    let synthetic_futures = call_price - put_price + strike; // ignoring continuous yield for simple detection

    let deviation = (synthetic_futures - futures).abs() / futures * 100.0;
    
    PutCallParityOpportunity {
        symbol: "UNKNOWN".to_string(),
        strike_price: strike,
        expiry_date: "UNKNOWN".to_string(),
        spot_price: spot,
        synthetic_futures_price: synthetic_futures,
        actual_futures_price: futures,
        deviation,
        is_opportunity: deviation > 0.5, // 0.5% threshold
    }
}
