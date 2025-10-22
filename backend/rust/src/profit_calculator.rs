use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProfitMetrics {
    pub lot_size: u32,
    pub gross_profit: f64,
    pub margin_required: f64,
    pub roi_percentage: f64,
}

/// Get standard NSE F&O lot sizes (as of Nov 2025)
pub fn get_lot_size(symbol: &str) -> u32 {
    match symbol {
        "RELIANCE" => 250,
        "TCS" => 150,
        "INFY" => 300,
        "HDFCBANK" => 550,
        "ICICIBANK" => 1375,
        "SBIN" => 1500,
        "BHARTIARTL" => 550,
        "ITC" => 1600,
        "KOTAKBANK" => 400,
        "LT" => 300,
        "AXISBANK" => 600,
        "HINDUNILVR" => 300,
        "ASIANPAINT" => 150,
        "MARUTI" => 50,
        "BAJFINANCE" => 125,
        _ => 1,
    }
}

/// Calculate profit metrics for arbitrage opportunity
pub fn calculate_profit_metrics(
    symbol: &str,
    spot_price: f64,
    futures_price: f64,
) -> ProfitMetrics {
    let spread = (futures_price - spot_price).abs();
    let lot_size = get_lot_size(symbol);
    
    // Gross profit = spread per share × lot size
    let gross_profit = spread * lot_size as f64;
    
    // Margin requirement = ~18% of contract value (typical for equity futures)
    let contract_value = futures_price * lot_size as f64;
    let margin_required = contract_value * 0.18;
    
    // ROI = (Gross Profit / Margin) × 100
    let roi_percentage = if margin_required > 0.0 {
        (gross_profit / margin_required) * 100.0
    } else {
        0.0
    };
    
    ProfitMetrics {
        lot_size,
        gross_profit,
        margin_required,
        roi_percentage,
    }
}

/// Calculate net profit after transaction costs (Future use)
#[allow(dead_code)]
pub fn calculate_net_profit(
    gross_profit: f64,
    contract_value: f64,
) -> f64 {
    // Typical costs:
    // - Brokerage: ~0.03% or ₹20 per order (whichever is lower)
    // - STT: 0.025% on futures sell side
    // - Exchange charges: ~0.002%
    // - GST: 18% on brokerage
    
    let brokerage = (contract_value * 0.0003).min(20.0) * 2.0; // Buy + Sell
    let stt = contract_value * 0.00025;
    let exchange_charges = contract_value * 0.00002;
    let gst = brokerage * 0.18;
    
    let total_costs = brokerage + stt + exchange_charges + gst;
    
    gross_profit - total_costs
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_lot_size() {
        assert_eq!(get_lot_size("RELIANCE"), 250);
        assert_eq!(get_lot_size("TCS"), 150);
        assert_eq!(get_lot_size("SBIN"), 1500);
        assert_eq!(get_lot_size("UNKNOWN"), 1);
    }
    
    #[test]
    fn test_profit_calculation() {
        let metrics = calculate_profit_metrics("RELIANCE", 2850.0, 2865.0);
        assert_eq!(metrics.lot_size, 250);
        assert_eq!(metrics.gross_profit, 3750.0); // 15 * 250
        assert!(metrics.roi_percentage > 0.0);
    }
    
    #[test]
    fn test_net_profit() {
        let net = calculate_net_profit(1000.0, 500000.0);
        assert!(net < 1000.0); // Net should be less than gross after costs
        assert!(net > 900.0); // But not too much less
    }
}
