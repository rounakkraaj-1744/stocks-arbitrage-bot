use std::collections::HashMap;
use std::sync::{Arc, Mutex};

pub type SpreadHistory = Arc<Mutex<HashMap<String, Vec<f64>>>>;

/// Create a new spread history tracker
pub fn create_spread_tracker() -> SpreadHistory {
    Arc::new(Mutex::new(HashMap::new()))
}

/// Calculate trend based on recent spread history
pub fn calculate_trend( symbol: &str, current_spread: f64, history: &SpreadHistory ) -> String {
    let mut history_map = history.lock().unwrap();
    let spreads = history_map.entry(symbol.to_string()).or_insert_with(Vec::new);
    
    // Add current spread
    spreads.push(current_spread);
    
    // Keep only last 5 values for trend calculation
    if spreads.len() > 5 {
        spreads.remove(0);
    }
    
    // Need at least 3 data points to calculate trend
    if spreads.len() < 3 {
        return "stable".to_string();
    }
    
    // Calculate average of recent 2 values vs older values
    let recent_avg = spreads[spreads.len() - 2..].iter().sum::<f64>() / 2.0;
    let older_avg = spreads[..spreads.len() - 2].iter().sum::<f64>() / (spreads.len() - 2) as f64;
    
    // Threshold for trend detection: 0.05%
    if recent_avg > older_avg + 0.05 {
        "rising".to_string()
    }
    else if recent_avg < older_avg - 0.05 {
        "falling".to_string()
    }
    else {
        "stable".to_string()
    }
}

pub fn get_spread_change( symbol: &str, history: &SpreadHistory ) -> Option<f64> {
    let history_map = history.lock().unwrap();
    if let Some(spreads) = history_map.get(symbol) {
        if spreads.len() >= 2 {
            let current = spreads[spreads.len() - 1];
            let previous = spreads[spreads.len() - 2];
            return Some(current - previous);
        }
    }
    None
}

pub fn clear_history(history: &SpreadHistory) {
    let mut history_map = history.lock().unwrap();
    history_map.clear();
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_trend_calculation() {
        let tracker = create_spread_tracker();
        
        assert_eq!(calculate_trend("TEST", 0.5, &tracker), "stable");
        assert_eq!(calculate_trend("TEST", 0.52, &tracker), "stable");
        
        assert_eq!(calculate_trend("TEST", 0.7, &tracker), "rising");
        assert_eq!(calculate_trend("TEST", 0.75, &tracker), "rising");
        
        let tracker2 = create_spread_tracker();
        calculate_trend("TEST2", 1.0, &tracker2);
        calculate_trend("TEST2", 0.95, &tracker2);
        calculate_trend("TEST2", 0.85, &tracker2);
        assert_eq!(calculate_trend("TEST2", 0.8, &tracker2), "falling");
    }
}
