"use client";

import { ArbitrageData } from '@/lib/types';

interface SummaryProps {
  currentData: { [key: string]: ArbitrageData };
  receivedStocks: string[];
}

export function Summary({ currentData, receivedStocks }: SummaryProps) {
  const totalOpportunities = receivedStocks.filter((s) => currentData[s]?.opportunity).length;
  const avgSpread =
    receivedStocks.length > 0
      ? receivedStocks.reduce((sum, s) => sum + (currentData[s]?.spread_percentage || 0), 0) / receivedStocks.length
      : 0;
  const totalPotentialProfit = receivedStocks.reduce(
    (sum, s) => sum + (currentData[s]?.opportunity ? currentData[s].gross_profit : 0),
    0
  );
  const bestOpportunity = receivedStocks.reduce((best, s) => {
    const data = currentData[s];
    if (!data?.opportunity) return best;
    if (!best || Math.abs(data.spread_percentage) > Math.abs(currentData[best]?.spread_percentage || 0)) {
      return s;
    }
    return best;
  }, "" as string);

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50 bg-slate-900/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Portfolio Analytics</h2>
              <p className="text-sm text-slate-400">Real-time market opportunities summary</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Active Opportunities */}
            <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-xl border border-green-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Opportunities</p>
                <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                  <span className="text-lg">🚀</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-green-400">{totalOpportunities}</p>
                {totalOpportunities > 0 && (
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                of {receivedStocks.length} stocks monitored
              </p>
            </div>

            {/* Average Spread */}
            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-xl border border-blue-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Avg Spread</p>
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-lg">📐</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-black ${avgSpread >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {avgSpread >= 0 ? '+' : ''}{avgSpread.toFixed(2)}%
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                portfolio-wide average
              </p>
            </div>

            {/* Potential Profit */}
            <div className="p-5 bg-gradient-to-br from-orange-500/10 to-yellow-500/5 rounded-xl border border-orange-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Potential Profit</p>
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-orange-400">
                  ₹{totalPotentialProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                gross estimated return
              </p>
            </div>

            {/* Top Opportunity */}
            <div className="p-5 bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-xl border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Best Pick</p>
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <span className="text-lg">🎯</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black text-purple-400">
                  {bestOpportunity || "—"}
                </p>
                {bestOpportunity && (
                  <span className="text-xs text-purple-400 font-bold">
                    {currentData[bestOpportunity]?.spread_percentage.toFixed(2)}%
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {bestOpportunity ? 'highest spread stock' : 'no opportunities yet'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
