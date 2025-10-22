use std::fs::OpenOptions;
use std::io::Write;
use log::{info, error};
use crate::arbitrage_detector::ArbitrageResult;

const LOG_FILE: &str = "arbitrage_log.csv";

pub fn initialize_csv_log() {
    match OpenOptions::new().create(true).write(true).truncate(true).open(LOG_FILE)
    {
        Ok(mut file) => {
            if let Err(e) = writeln!( file, "timestamp,symbol,spot_price,futures_price,spread,spread_percentage,action,opportunity,lot_size,gross_profit,margin_required,roi_percentage,trend" ){
                error!("Failed to write CSV header: {}", e);
            }
            else {
                info!("CSV log initialized: {}", LOG_FILE);
            }
        }
        Err(e) => {
            error!("Failed to create CSV file: {}", e);
        }
    }
}

pub fn log_to_csv(result: &ArbitrageResult) {
    match OpenOptions::new().create(true).write(true).append(true).open(LOG_FILE)
    {
        Ok(mut file) => {
            let log_entry = format!(
                "{},{},{:.2},{:.2},{:.2},{:.2},{},{},{},{:.2},{:.2},{:.2},{}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
                result.symbol,
                result.spot_price,
                result.futures_price,
                result.spread,
                result.spread_percentage,
                result.action,
                result.opportunity,
                result.lot_size,
                result.gross_profit,
                result.margin_required,
                result.roi_percentage,
                result.spread_trend
            );
            
            if let Err(e) = writeln!(file, "{}", log_entry) {
                error!("Failed to write to CSV: {}", e);
            }
        }
        Err(e) => {
            error!("Failed to open CSV file for logging: {}", e);
        }
    }
}

#[allow(dead_code)]
pub fn export_summary_stats(results: &[ArbitrageResult]) -> Result<(), std::io::Error> {
    let summary_file = "arbitrage_summary.txt";
    let mut file = OpenOptions::new().create(true).write(true).truncate(true).open(summary_file)?;
    
    let total_opportunities = results.iter().filter(|r| r.opportunity).count();
    let avg_spread: f64 = results.iter().map(|r| r.spread_percentage).sum::<f64>() / results.len() as f64;
    let total_profit: f64 = results.iter().filter(|r| r.opportunity).map(|r| r.gross_profit).sum();
    
    writeln!(file, "Arbitrage Summary Report")?;
    writeln!(file, "========================")?;
    writeln!(file, "Total Checks: {}", results.len())?;
    writeln!(file, "Total Opportunities: {}", total_opportunities)?;
    writeln!(file, "Average Spread: {:.2}%", avg_spread)?;
    writeln!(file, "Total Potential Profit: ₹{:.2}", total_profit)?;
    
    info!("Summary exported to {}", summary_file);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_csv_initialization() {
        initialize_csv_log();
        assert!(std::path::Path::new(LOG_FILE).exists());
    }
}
