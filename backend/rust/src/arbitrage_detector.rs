use serde::{Serialize, Deserialize};
use crate::profit_calculator::{calculate_profit_metrics};

#[derive(Serialize, Deserialize, Clone)]
pub struct RiskMetrics {
    pub suggested_stop_loss: f64,
    pub suggested_position_size: f64,
    pub risk_reward_ratio: f64,
}

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
    pub risk_metrics: RiskMetrics,
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

    let standard_account_size = 100_000.0;
    let risk_amount = standard_account_size * 0.02; 
    
    let suggested_stop_loss = if action.starts_with("BUY") {
        spot_price - (spread.abs() * 0.5)
    } else {
        spot_price + (spread.abs() * 0.5)
    };

    let estimated_max_loss_per_lot = profit_metrics.margin_required * 0.1;
    let max_lots = (risk_amount / estimated_max_loss_per_lot).floor().max(1.0);
    
    let risk_metrics = RiskMetrics {
        suggested_stop_loss,
        suggested_position_size: max_lots * (profit_metrics.lot_size as f64),
        risk_reward_ratio: 2.5,
    };

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
        risk_metrics,
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