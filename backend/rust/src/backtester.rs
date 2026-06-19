use serde::{Serialize, Deserialize};
use rand::Rng;

#[derive(Serialize, Deserialize)]
pub struct BacktestParams {
    pub initial_capital: f64,
    pub num_simulations: usize,
    pub days: usize,
    pub win_rate: f64,
    pub avg_win_pct: f64,
    pub avg_loss_pct: f64,
}

#[derive(Serialize, Deserialize)]
pub struct SimulationResult {
    pub equity_curve: Vec<f64>,
    pub final_equity: f64,
    pub max_drawdown: f64,
}

#[derive(Serialize, Deserialize)]
pub struct BacktestResponse {
    pub average_final_equity: f64,
    pub best_case_equity: f64,
    pub worst_case_equity: f64,
    pub average_max_drawdown: f64,
    pub sample_simulations: Vec<SimulationResult>,
}

pub fn run_monte_carlo(params: BacktestParams) -> BacktestResponse {
    let mut rng = rand::rng();
    let mut all_simulations = Vec::new();
    
    let mut total_final_equity = 0.0;
    let mut total_max_drawdown = 0.0;
    let mut best_case = params.initial_capital;
    let mut worst_case = f64::MAX;

    for _ in 0..params.num_simulations {
        let mut equity = params.initial_capital;
        let mut peak = equity;
        let mut max_drawdown = 0.0;
        let mut equity_curve = Vec::with_capacity(params.days);
        
        equity_curve.push(equity);

        for _ in 1..=params.days {
            let is_win = rng.random::<f64>() < params.win_rate;
            let pnl_pct = if is_win {
                // Add some randomness to win
                params.avg_win_pct * (0.5 + rng.random::<f64>())
            } else {
                // Add some randomness to loss
                params.avg_loss_pct * (0.5 + rng.random::<f64>())
            };

            equity = equity * (1.0 + pnl_pct);
            equity_curve.push(equity);

            if equity > peak {
                peak = equity;
            }

            let drawdown = (peak - equity) / peak;
            if drawdown > max_drawdown {
                max_drawdown = drawdown;
            }
        }

        if equity > best_case {
            best_case = equity;
        }
        if equity < worst_case {
            worst_case = equity;
        }

        total_final_equity += equity;
        total_max_drawdown += max_drawdown;

        if all_simulations.len() < 5 {
            all_simulations.push(SimulationResult {
                equity_curve,
                final_equity: equity,
                max_drawdown: max_drawdown * 100.0,
            });
        }
    }

    BacktestResponse {
        average_final_equity: total_final_equity / (params.num_simulations as f64),
        best_case_equity: best_case,
        worst_case_equity: worst_case,
        average_max_drawdown: (total_max_drawdown / (params.num_simulations as f64)) * 100.0,
        sample_simulations: all_simulations,
    }
}