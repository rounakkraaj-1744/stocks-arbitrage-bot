"use client";

import { useState } from 'react';
import { ArbitrageData } from '@/lib/types';

interface PositionSimulatorProps {
  stock: ArbitrageData;
  onClose: () => void;
}

export function PositionSimulator({ stock, onClose }: PositionSimulatorProps) {
  const [quantity, setQuantity] = useState(stock.lot_size);
  const [spotEntry, setSpotEntry] = useState(stock.spot_price);
  const [futuresEntry, setFuturesEntry] = useState(stock.futures_price);
  const [spotExit, setSpotExit] = useState(stock.spot_price * 1.01);
  const [futuresExit, setFuturesExit] = useState(stock.futures_price * 1.01);
  const [fees, setFees] = useState(0.05); // 0.05%

  const calculatePnL = () => {
    const spotPnL = (spotExit - spotEntry) * quantity;
    const futuresPnL = (futuresEntry - futuresExit) * quantity; // Short futures
    const grossPnL = spotPnL + futuresPnL;
    const totalFees = (spotEntry + futuresEntry + spotExit + futuresExit) * quantity * (fees / 100);
    const netPnL = grossPnL - totalFees;
    const margin = (spotEntry * quantity * 0.2) + (futuresEntry * quantity * 0.2); // 20% margin
    const roi = (netPnL / margin) * 100;

    return { spotPnL, futuresPnL, grossPnL, totalFees, netPnL, margin, roi };
  };

  const result = calculatePnL();

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl"
      onClick={onClose}
    >
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                <span className="text-2xl">💹</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Position Simulator</h2>
                <p className="text-sm text-slate-400">Calculate P&L for {stock.symbol}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Input Form */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <span className="text-lg">⚙️</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">Trade Parameters</h3>
                </div>
                
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">Quantity (Shares)</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-1">Lot size: {stock.lot_size}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="text-green-400">📈</span> Spot Entry
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={spotEntry}
                      onChange={(e) => setSpotEntry(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="text-purple-400">📉</span> Futures Entry
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={futuresEntry}
                      onChange={(e) => setFuturesEntry(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="text-green-400">🎯</span> Spot Exit
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={spotExit}
                      onChange={(e) => setSpotExit(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                      <span className="text-purple-400">🎯</span> Futures Exit
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={futuresExit}
                      onChange={(e) => setFuturesExit(parseFloat(e.target.value))}
                      className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                    <span className="text-orange-400">💳</span> Transaction Fees (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={fees}
                    onChange={(e) => setFees(parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <span className="text-lg">📊</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">Calculated Results</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-400 text-sm font-medium">Spot P&L</p>
                      <span className="text-lg">📈</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">₹{result.spotPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-400 text-sm font-medium">Futures P&L</p>
                      <span className="text-lg">📉</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">₹{result.futuresPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-xl border border-orange-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-400 text-sm font-medium">Gross P&L</p>
                      <span className="text-lg">💰</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-400">₹{result.grossPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-red-500/10 to-red-500/5 rounded-xl border border-red-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-slate-400 text-sm font-medium">Total Fees</p>
                      <span className="text-lg">💳</span>
                    </div>
                    <p className="text-2xl font-bold text-red-400">-₹{result.totalFees.toFixed(2)}</p>
                  </div>

                  <div className={`p-5 rounded-xl border shadow-lg ${
                    result.netPnL >= 0 
                      ? 'bg-gradient-to-br from-emerald-500/15 to-green-500/10 border-emerald-500/30 shadow-emerald-500/10' 
                      : 'bg-gradient-to-br from-red-500/15 to-red-500/10 border-red-500/30 shadow-red-500/10'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-300 text-sm font-semibold">Net P&L (After Fees)</p>
                      <span className="text-2xl">{result.netPnL >= 0 ? '💰' : '📉'}</span>
                    </div>
                    <p className={`text-4xl font-bold ${result.netPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.netPnL >= 0 ? '+' : ''}₹{result.netPnL.toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-xl border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-slate-400 text-xs font-medium">Margin</p>
                        <span className="text-sm">🏦</span>
                      </div>
                      <p className="text-lg font-bold text-yellow-400">₹{result.margin.toFixed(0)}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl border border-cyan-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-slate-400 text-xs font-medium">ROI</p>
                        <span className="text-sm">📊</span>
                      </div>
                      <p className={`text-lg font-bold ${result.roi >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                        {result.roi >= 0 ? '+' : ''}{result.roi.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Footer */}
            <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="flex-1">
                  <p className="text-slate-300 text-sm font-medium mb-1">Arbitrage Strategy</p>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Buy spot at entry price, sell futures at entry price. Exit when spread narrows. 
                    Margin requirement is 20% of total position value. Fees apply to all legs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}