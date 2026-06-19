"use client";

import { useState } from 'react';
import { ChartDataPoint, BacktestResult, Trade, MonteCarloResponse } from '@/lib/types';
import toast from 'react-hot-toast';
import { EquityCurveChart } from '@/components/charts/EquityCurveChart';
import { DrawdownChart } from '@/components/charts/DrawdownChart';

interface BacktestModalProps {
  selectedStock: string;
  chartData: { [key: string]: ChartDataPoint[] };
  onClose: () => void;
  backtestResult: BacktestResult | null;
  setBacktestResult: (result: BacktestResult | null) => void;
}

export function BacktestModal({
  selectedStock,
  chartData,
  onClose,
  backtestResult,
  setBacktestResult,
}: BacktestModalProps) {
  const [symbol, setSymbol] = useState(selectedStock);
  const [buyThreshold, setBuyThreshold] = useState(0.5);
  const [sellThreshold, setSellThreshold] = useState(0.1);
  const [capital, setCapital] = useState(100000);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [isSimulating, setIsSimulating] = useState(false);

  const runBacktest = () => {
    const data = chartData[symbol] || [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredData = data.filter(
      (d) => d.timestamp >= start.getTime() && d.timestamp <= end.getTime()
    );

    if (filteredData.length === 0) {
      toast.error("No data available for selected date range");
      return;
    }

    let position: 'none' | 'long' = 'none';
    let entryPrice = 0;
    const trades: Trade[] = [];
    let currentCapital = capital;

    filteredData.forEach((point, index) => {
      if (position === 'none' && point.spread >= buyThreshold) {
        position = 'long';
        entryPrice = point.spot;
      } else if (position === 'long' && (point.spread <= sellThreshold || index === filteredData.length - 1)) {
        const pnl = (point.spot - entryPrice) * 100;
        currentCapital += pnl;
        
        trades.push({
          id: `trade-${Date.now()}-${Math.random()}`,
          timestamp: point.timestamp,
          symbol,
          type: pnl > 0 ? 'buy' : 'sell',
          spotPrice: point.spot,
          futuresPrice: point.futures,
          quantity: 100,
          spread: point.spread,
          pnl,
        });
        
        position = 'none';
      }
    });

    const profitableTrades = trades.filter((t) => t.pnl > 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    
    // Calculate max drawdown
    let peak = capital;
    let maxDrawdown = 0;
    let runningCapital = capital;
    
    trades.forEach((trade) => {
      runningCapital += trade.pnl;
      if (runningCapital > peak) peak = runningCapital;
      const drawdown = ((peak - runningCapital) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const winRate = trades.length > 0 ? (profitableTrades / trades.length) * 100 : 0;
    
    // Simple Sharpe ratio calculation
    const returns = trades.map((t) => (t.pnl / capital) * 100);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / (returns.length || 1);
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length || 1)
    );
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    const result: BacktestResult = {
      totalTrades: trades.length,
      profitableTrades,
      totalPnL,
      maxDrawdown,
      sharpeRatio,
      winRate,
      trades,
    };

    setBacktestResult(result);
    toast.success("Backtest completed!");
  };

  const runMonteCarloSimulation = async () => {
    if (!backtestResult) {
        toast.error("Please run the base backtest first to get win/loss parameters.");
        return;
    }

    setIsSimulating(true);
    const loadingToast = toast.loading("Running 1,000 Monte Carlo simulations...");

    try {
        const winningTrades = backtestResult.trades.filter(t => t.pnl > 0);
        const losingTrades = backtestResult.trades.filter(t => t.pnl <= 0);

        const avgWinAmount = winningTrades.reduce((sum, t) => sum + t.pnl, 0) / (winningTrades.length || 1);
        const avgLossAmount = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0)) / (losingTrades.length || 1);

        const params = {
            initial_capital: capital,
            num_simulations: 1000,
            days: 252, // Simulate for a year
            win_rate: backtestResult.winRate / 100.0,
            avg_win_pct: avgWinAmount / capital,
            avg_loss_pct: -(avgLossAmount / capital), // keep it negative
        };

        const res = await fetch("http://127.0.0.1:3030/api/backtest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        });

        if (!res.ok) throw new Error("Simulation failed");

        const mcResult: MonteCarloResponse = await res.json();
        
        setBacktestResult({
            ...backtestResult,
            monteCarloResult: mcResult
        });
        
        toast.success("Simulation complete!", { id: loadingToast });
    } catch (error) {
        console.error(error);
        toast.error("Failed to run Monte Carlo simulation", { id: loadingToast });
    } finally {
        setIsSimulating(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0b1120] rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border-b border-slate-800/50">
        <div className="flex items-center justify-between p-6 bg-slate-900/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Strategy Backtesting</h2>
              <p className="text-sm text-slate-400">Historical performance & P&L analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto flex-1">
            
            {/* Backtest Parameters */}
            <div className="mb-6 p-5 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
                <h3 className="text-white font-bold text-lg">Backtest Parameters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Stock Symbol</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  >
                    {Object.keys(chartData).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Buy Threshold (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={buyThreshold}
                    onChange={(e) => setBuyThreshold(parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Sell Threshold (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sellThreshold}
                    onChange={(e) => setSellThreshold(parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Initial Capital (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    value={capital}
                    onChange={(e) => setCapital(parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                  <button
                    onClick={runBacktest}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/30 flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">🚀</span>
                    Run Base Backtest
                  </button>

                  <button
                    onClick={runMonteCarloSimulation}
                    disabled={!backtestResult || isSimulating}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">🔮</span>
                    {isSimulating ? 'Simulating...' : 'Monte Carlo Simulation'}
                  </button>
              </div>
            </div>

            {/* Backtest Results */}
            {backtestResult && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-medium">Total Trades</p>
                      <span className="text-lg">📊</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{backtestResult.totalTrades}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-medium">Win Rate</p>
                      <span className="text-lg">🎯</span>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{backtestResult.winRate.toFixed(1)}%</p>
                  </div>
                  
                  <div className={`p-4 rounded-xl border bg-gradient-to-br ${
                    backtestResult.totalPnL >= 0 
                      ? 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' 
                      : 'from-red-500/10 to-red-500/5 border-red-500/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-medium">Total P&L</p>
                      <span className="text-lg">{backtestResult.totalPnL >= 0 ? '💰' : '📉'}</span>
                    </div>
                    <p className={`text-3xl font-bold ${
                      backtestResult.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {backtestResult.totalPnL >= 0 ? '+' : ''}₹{backtestResult.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-medium">Max Drawdown</p>
                      <span className="text-lg">⚠️</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-400">{backtestResult.maxDrawdown.toFixed(2)}%</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-medium">Sharpe Ratio</p>
                      <span className="text-lg">📐</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-400">{backtestResult.sharpeRatio.toFixed(2)}</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-400 font-medium">Profitable</p>
                      <span className="text-lg">✅</span>
                    </div>
                    <p className="text-3xl font-bold text-cyan-400">{backtestResult.profitableTrades}</p>
                  </div>
                </div>

                {backtestResult.monteCarloResult && (() => {
                    const mc = backtestResult.monteCarloResult;
                    const numDays = mc.sample_simulations[0]?.equity_curve.length || 0;
                    const chartData = [];
                    const drawdownData = [];

                    for (let i = 0; i < numDays; i++) {
                        const eqPoint: any = { day: i };
                        const ddPoint: any = { day: i };
                        
                        mc.sample_simulations.forEach((sim, idx) => {
                            eqPoint[`sim${idx}`] = sim.equity_curve[i];
                            const pastEq = sim.equity_curve.slice(0, i+1);
                            const peak = Math.max(...pastEq, capital);
                            ddPoint[`sim${idx}`] = ((peak - sim.equity_curve[i]) / peak) * 100;
                        });
                        
                        chartData.push(eqPoint);
                        drawdownData.push(ddPoint);
                    }

                    return (
                        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                    <span className="text-lg">🔮</span>
                                </div>
                                <h3 className="text-white font-bold text-lg">Monte Carlo Simulation (1,000 runs)</h3>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                    <p className="text-xs text-slate-400">Avg Final Equity</p>
                                    <p className="text-lg font-bold text-blue-400">₹{mc.average_final_equity.toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                    <p className="text-xs text-slate-400">Best Case Equity</p>
                                    <p className="text-lg font-bold text-green-400">₹{mc.best_case_equity.toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                    <p className="text-xs text-slate-400">Worst Case Equity</p>
                                    <p className="text-lg font-bold text-red-400">₹{mc.worst_case_equity.toFixed(2)}</p>
                                </div>
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                    <p className="text-xs text-slate-400">Avg Max Drawdown</p>
                                    <p className="text-lg font-bold text-orange-400">{mc.average_max_drawdown.toFixed(2)}%</p>
                                </div>
                            </div>

                            <EquityCurveChart data={chartData} />
                            <DrawdownChart data={drawdownData} />
                        </div>
                    );
                })()}

                {/* Trade History */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
                  <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                        <span className="text-lg">📋</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">Trade History</h3>
                      <span className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded-full text-xs text-slate-300 font-semibold">
                        {backtestResult.trades.length} trades
                      </span>
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
                        <tr>
                          <th className="p-3 text-left text-slate-300 font-semibold">Time</th>
                          <th className="p-3 text-left text-slate-300 font-semibold">Type</th>
                          <th className="p-3 text-right text-slate-300 font-semibold">Spot</th>
                          <th className="p-3 text-right text-slate-300 font-semibold">Futures</th>
                          <th className="p-3 text-right text-slate-300 font-semibold">Spread</th>
                          <th className="p-3 text-right text-slate-300 font-semibold">Qty</th>
                          <th className="p-3 text-right text-slate-300 font-semibold">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backtestResult.trades.map((trade) => (
                          <tr key={trade.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 text-slate-300 text-xs">
                              {new Date(trade.timestamp).toLocaleString('en-IN', { 
                                day: '2-digit', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                trade.type === 'buy' 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {trade.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-300 font-medium">₹{trade.spotPrice.toFixed(2)}</td>
                            <td className="p-3 text-right text-slate-300 font-medium">₹{trade.futuresPrice.toFixed(2)}</td>
                            <td className="p-3 text-right text-slate-300">{trade.spread.toFixed(2)}%</td>
                            <td className="p-3 text-right text-slate-400">{trade.quantity}</td>
                            <td className={`p-3 text-right font-bold ${
                              trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {!backtestResult && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50 flex items-center justify-center">
                  <span className="text-4xl">📊</span>
                </div>
                <p className="text-slate-300 font-semibold text-lg mb-2">Ready to Backtest</p>
                <p className="text-slate-500 text-sm">Configure parameters above and run your analysis</p>
              </div>
            )}
          </div>
    </div>
  );
}
