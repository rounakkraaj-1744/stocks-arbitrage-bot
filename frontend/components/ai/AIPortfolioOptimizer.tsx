"use client";

import { useState } from 'react';
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
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-5xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-gradient-to-r from-purple-900/30 to-pink-900/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Portfolio Optimizer</h2>
                <p className="text-sm text-slate-400">ML-powered capital allocation strategy</p>
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
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            
            {/* Input Section */}
            <div className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
                <h3 className="text-white font-bold text-lg">Investment Parameters</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 flex items-center gap-2">
                    <span>💰</span> Total Capital
                  </label>
                  <input
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-lg font-bold transition-all"
                    placeholder="Enter amount"
                  />
                </div>
                
                <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-slate-300 text-sm font-medium">Available Opportunities</p>
                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs font-bold">
                      {opportunities.length} stocks
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {opportunities.map((opp) => (
                      <div key={opp.symbol} className="flex justify-between items-center p-2 bg-slate-800/50 rounded border border-slate-700/50">
                        <span className="text-white font-medium">{opp.symbol}</span>
                        <span className="text-green-400 font-bold text-sm">+{opp.spread_percentage.toFixed(2)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleOptimize}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">🔄</span>
                      Optimizing Portfolio...
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      Optimize Portfolio
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div className="space-y-6">
                
                {/* Expected Return */}
                <div className="p-6 bg-gradient-to-br from-green-500/15 to-emerald-500/10 rounded-xl border border-green-500/30 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm font-medium">Expected Portfolio Return</p>
                      <p className="text-4xl font-black text-green-400">+{result.expectedReturn.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>

                {/* Allocations */}
                <div className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                      <span className="text-lg">📊</span>
                    </div>
                    <h3 className="text-white font-bold text-lg">Optimal Allocation Strategy</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {result.allocations.map((allocation, idx) => (
                      <div key={allocation.symbol} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-lg">{allocation.symbol}</span>
                            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded text-xs font-bold">
                              #{idx + 1}
                            </span>
                          </div>
                          <span className="text-purple-400 font-black text-xl">{allocation.percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-3">
                          <span className="text-slate-400">Allocation Amount</span>
                          <span className="text-green-400 font-bold text-base">₹{allocation.amount.toLocaleString('en-IN')}</span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                            style={{ width: `${allocation.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="p-5 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 rounded-xl border border-cyan-500/30 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <p className="text-cyan-400 font-bold text-base">AI Strategy Reasoning</p>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.reasoning}</p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Allocated</p>
                      <span className="text-lg">💵</span>
                    </div>
                    <p className="text-2xl font-black text-blue-400">
                      ₹{result.allocations.reduce((sum, a) => sum + a.amount, 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Stocks Selected</p>
                      <span className="text-lg">🎯</span>
                    </div>
                    <p className="text-2xl font-black text-green-400">{result.allocations.length}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Avg Allocation</p>
                      <span className="text-lg">📐</span>
                    </div>
                    <p className="text-2xl font-black text-purple-400">
                      {(result.allocations.reduce((sum, a) => sum + a.percentage, 0) / result.allocations.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !loading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                  <span className="text-4xl">🎯</span>
                </div>
                <p className="text-slate-300 font-semibold text-lg mb-2">Ready to Optimize</p>
                <p className="text-slate-500 text-sm">Configure your capital and run the optimizer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
