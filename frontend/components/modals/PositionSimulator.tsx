"use client";

import { useState } from 'react';
import { ArbitrageData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>💹</span>
                Position Simulator - {stock.symbol}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Trade Parameters</h3>
                
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Spot Entry</label>
                    <input
                      type="number"
                      step="0.01"
                      value={spotEntry}
                      onChange={(e) => setSpotEntry(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Futures Entry</label>
                    <input
                      type="number"
                      step="0.01"
                      value={futuresEntry}
                      onChange={(e) => setFuturesEntry(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Spot Exit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={spotExit}
                      onChange={(e) => setSpotExit(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Futures Exit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={futuresExit}
                      onChange={(e) => setFuturesExit(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Fees (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fees}
                    onChange={(e) => setFees(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Results</h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-slate-400 text-sm">Spot P&L</p>
                    <p className="text-xl font-bold text-blue-400">₹{result.spotPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-slate-400 text-sm">Futures P&L</p>
                    <p className="text-xl font-bold text-purple-400">₹{result.futuresPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-slate-400 text-sm">Gross P&L</p>
                    <p className="text-xl font-bold text-orange-400">₹{result.grossPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-slate-400 text-sm">Total Fees</p>
                    <p className="text-xl font-bold text-red-400">-₹{result.totalFees.toFixed(2)}</p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    result.netPnL >= 0 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <p className="text-slate-400 text-sm mb-1">Net P&L</p>
                    <p className={`text-3xl font-bold ${result.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{result.netPnL.toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-slate-400 text-xs">Margin Required</p>
                      <p className="text-lg font-bold text-yellow-400">₹{result.margin.toFixed(0)}</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <p className="text-slate-400 text-xs">ROI</p>
                      <p className="text-lg font-bold text-emerald-400">{result.roi.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
