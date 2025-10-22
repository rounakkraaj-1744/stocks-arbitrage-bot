"use client";

import { useState } from 'react';
import { ChartDataPoint, BacktestResult, Trade } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

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

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-5xl my-8" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📈</span>
                Historical Backtest & PnL Analytics
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Backtest Parameters */}
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Backtest Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Stock</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  >
                    {Object.keys(chartData).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Buy Threshold (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={buyThreshold}
                    onChange={(e) => setBuyThreshold(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Sell Threshold (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sellThreshold}
                    onChange={(e) => setSellThreshold(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Initial Capital (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    value={capital}
                    onChange={(e) => setCapital(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button
                onClick={runBacktest}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Run Backtest
              </button>
            </div>

            {/* Backtest Results */}
            {backtestResult && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-slate-400 text-sm mb-1">Total Trades</p>
                    <p className="text-3xl font-bold text-blue-400">{backtestResult.totalTrades}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-slate-400 text-sm mb-1">Win Rate</p>
                    <p className="text-3xl font-bold text-green-400">{backtestResult.winRate.toFixed(1)}%</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${
                    backtestResult.totalPnL >= 0 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <p className="text-slate-400 text-sm mb-1">Total P&L</p>
                    <p className={`text-3xl font-bold ${
                      backtestResult.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      ₹{backtestResult.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-slate-400 text-sm mb-1">Max Drawdown</p>
                    <p className="text-3xl font-bold text-orange-400">{backtestResult.maxDrawdown.toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-slate-400 text-sm mb-1">Sharpe Ratio</p>
                    <p className="text-3xl font-bold text-purple-400">{backtestResult.sharpeRatio.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-slate-400 text-sm mb-1">Profitable Trades</p>
                    <p className="text-3xl font-bold text-cyan-400">{backtestResult.profitableTrades}</p>
                  </div>
                </div>

                {/* Trade History */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Trade History</h3>
                  <div className="max-h-96 overflow-y-auto bg-slate-800/30 rounded-lg border border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                        <tr>
                          <th className="p-3 text-left text-slate-400 font-medium">Time</th>
                          <th className="p-3 text-left text-slate-400 font-medium">Type</th>
                          <th className="p-3 text-right text-slate-400 font-medium">Spot</th>
                          <th className="p-3 text-right text-slate-400 font-medium">Futures</th>
                          <th className="p-3 text-right text-slate-400 font-medium">Spread</th>
                          <th className="p-3 text-right text-slate-400 font-medium">Qty</th>
                          <th className="p-3 text-right text-slate-400 font-medium">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backtestResult.trades.map((trade) => (
                          <tr key={trade.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <td className="p-3 text-slate-300">{new Date(trade.timestamp).toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-300">₹{trade.spotPrice.toFixed(2)}</td>
                            <td className="p-3 text-right text-slate-300">₹{trade.futuresPrice.toFixed(2)}</td>
                            <td className="p-3 text-right text-slate-300">{trade.spread.toFixed(2)}%</td>
                            <td className="p-3 text-right text-slate-400">{trade.quantity}</td>
                            <td className={`p-3 text-right font-semibold ${
                              trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ₹{trade.pnl.toFixed(2)}
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
              <div className="text-center py-12">
                <p className="text-slate-400">Configure parameters above and click "Run Backtest" to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
