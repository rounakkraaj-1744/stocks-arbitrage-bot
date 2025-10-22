"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArbitrageData } from '@/lib/types';
import { optimizePortfolio, PortfolioOptimization } from '@/lib/ai-client';
import toast from 'react-hot-toast';

interface AIPortfolioOptimizerProps {
  opportunities: ArbitrageData[];
  onClose: () => void;
}

export function AIPortfolioOptimizer({ opportunities, onClose }: AIPortfolioOptimizerProps) {
  const [capital, setCapital] = useState(100000);
  const [result, setResult] = useState<PortfolioOptimization | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    if (opportunities.length === 0) {
      toast.error('No opportunities available to optimize');
      return;
    }

    setLoading(true);
    try {
      const optimization = await optimizePortfolio(opportunities, capital);
      setResult(optimization);
      toast.success('Portfolio optimized!');
    } catch (error) {
      toast.error('Failed to optimize portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🎯</span>
                AI Portfolio Optimizer
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input Section */}
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Investment Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-sm mb-2 block">Total Capital (₹)</label>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-purple-500 outline-none text-lg font-semibold"
                  />
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-2">Available Opportunities: <span className="text-green-400 font-semibold">{opportunities.length}</span></p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {opportunities.map((opp) => (
                      <div key={opp.symbol} className="text-slate-300 text-sm flex justify-between">
                        <span>{opp.symbol}</span>
                        <span className="text-green-400">{opp.spread_percentage.toFixed(2)}% spread</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleOptimize}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '🔄 Optimizing...' : '⚡ Optimize Portfolio'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-purple-900/20 to-pink-900/10 rounded-lg border border-purple-500/30">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span>📊</span>
                    Optimal Allocation Strategy
                  </h3>
                  
                  {/* Expected Return */}
                  <div className="mb-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <p className="text-slate-400 text-sm">Expected Return</p>
                    <p className="text-3xl font-bold text-green-400">{result.expectedReturn.toFixed(2)}%</p>
                  </div>

                  {/* Allocations */}
                  <div className="space-y-2 mb-4">
                    {result.allocations.map((allocation) => (
                      <div key={allocation.symbol} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white font-semibold">{allocation.symbol}</span>
                          <span className="text-purple-400 font-bold">{allocation.percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Allocation</span>
                          <span className="text-green-400 font-semibold">₹{allocation.amount.toFixed(0)}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${allocation.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Reasoning */}
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
                    <p className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
                      <span>🤖</span>
                      AI Reasoning:
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">{result.reasoning}</p>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-slate-400 text-xs mb-1">Total Allocated</p>
                    <p className="text-xl font-bold text-blue-400">
                      ₹{result.allocations.reduce((sum, a) => sum + a.amount, 0).toFixed(0)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-slate-400 text-xs mb-1">Stocks Selected</p>
                    <p className="text-xl font-bold text-green-400">{result.allocations.length}</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-slate-400 text-xs mb-1">Avg Allocation</p>
                    <p className="text-xl font-bold text-purple-400">
                      {(result.allocations.reduce((sum, a) => sum + a.percentage, 0) / result.allocations.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
