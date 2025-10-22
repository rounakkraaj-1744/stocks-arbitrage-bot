use serde::{Serialize, Deserialize};
use crate::profit_calculator::{calculate_profit_metrics};

#[derive(Serialize, Deserialize, Clone)]
pub struct ArbitrageResult {
    pub opportunity: bool,
    pub symbol: String,
    pub spot_price: f64,
    pub futures_price: f64,
    pub spread: f64,
    pub spread_percentage: f64,
    pub action: String,
    pub details: String,
    pub lot_size: u32,
    pub gross_profit: f64,
    pub margin_required: f64,
    pub roi_percentage: f64,
    pub spread_trend: String,
    pub last_update: String,
}

pub fn detect_cash_futures_arbitrage( symbol: &str, spot_price: f64, futures_price: f64, threshold_percentage: f64 ) -> ArbitrageResult {
    let spread = futures_price - spot_price;
    let spread_percentage = (spread / spot_price) * 100.0;
    
    let opportunity = spread_percentage.abs() > threshold_percentage;
    
    let action = if spread_percentage > threshold_percentage {
        "BUY Spot, SELL Futures".to_string()
    }
    else if spread_percentage < -threshold_percentage {
        "SELL Spot, BUY Futures".to_string()
    }
    else {
        "HOLD".to_string()
    };

    let details = if opportunity {
        format!(
            "Arbitrage opportunity detected for {}! Spot: ₹{:.2}, Futures: ₹{:.2}, Spread: {:.2}%",
            symbol, spot_price, futures_price, spread_percentage
        )
    } else {
        format!(
            "No arbitrage for {}. Spot: ₹{:.2}, Futures: ₹{:.2}, Spread: {:.2}%",
            symbol, spot_price, futures_price, spread_percentage
        )
    };

    let profit_metrics = calculate_profit_metrics(symbol, spot_price, futures_price);

    ArbitrageResult {
        opportunity,
        symbol: symbol.to_string(),
        spot_price,
        futures_price,
        spread,
        spread_percentage,
        action,
        details,
        lot_size: profit_metrics.lot_size,
        gross_profit: profit_metrics.gross_profit,
        margin_required: profit_metrics.margin_required,
        roi_percentage: profit_metrics.roi_percentage,
        spread_trend: "stable".to_string(),
        last_update: chrono::Local::now().format("%H:%M:%S").to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_arbitrage_detection() {
        let result = detect_cash_futures_arbitrage("RELIANCE", 2850.0, 2865.0, 0.5);
        assert!(result.opportunity);
        assert_eq!(result.action, "BUY Spot, SELL Futures");
        assert!(result.spread_percentage > 0.5);
    }
    
    #[test]
    fn test_no_opportunity() {
        let result = detect_cash_futures_arbitrage("TCS", 3950.0, 3952.0, 0.5);
        assert!(!result.opportunity);
        assert_eq!(result.action, "HOLD");
    }
}