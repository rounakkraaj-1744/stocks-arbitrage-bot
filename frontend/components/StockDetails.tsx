"use client";

import { ArbitrageData } from '@/lib/types';
import { getTrendIcon, getTrendColor } from '@/lib/utils';

interface StockDetailsProps {
  data: ArbitrageData;
  onSetAlert: () => void;
}

export function StockDetails({ data, onSetAlert }: StockDetailsProps) {
  return (
    <div className="mb-8">
      <div
        className={`rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden transition-all ${
          data.opportunity
            ? "border-green-500/30 bg-gradient-to-br from-green-950/30 to-emerald-950/20 shadow-green-500/10"
            : "border-slate-700/50 bg-gradient-to-br from-slate-900/90 to-slate-900/50"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                data.opportunity
                  ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30"
                  : "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-slate-600/50"
              }`}>
                <span className="text-4xl">{data.opportunity ? "🚀" : "⏳"}</span>
              </div>
              <div>
                <div className={`text-3xl font-black ${
                  data.opportunity ? "text-green-400" : "text-slate-300"
                }`}>
                  {data.symbol}
                </div>
                <div className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-2">
                  {data.opportunity ? (
                    <>
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Arbitrage Opportunity Active
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-slate-500 rounded-full"></span>
                      Monitoring Price Movements
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onSetAlert}
              className="px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-xl transition-all font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-blue-500/20"
            >
              <span className="text-lg">🔔</span>
              Set Alert
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            
            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium">Spot Price</p>
                <span className="text-lg">📈</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">₹{data.spot_price.toFixed(2)}</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium">Futures Price</p>
                <span className="text-lg">📉</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">₹{data.futures_price.toFixed(2)}</p>
            </div>

            <div className="p-5 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl border border-orange-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium">Spread (₹)</p>
                <span className="text-lg">💰</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">₹{data.spread.toFixed(2)}</p>
            </div>

            <div
              className={`p-5 rounded-xl border shadow-lg ${
                data.spread_percentage > 0
                  ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20"
                  : "bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
                  Spread %
                  <span className={getTrendColor(data.spread_trend)}>
                    {getTrendIcon(data.spread_trend)}
                  </span>
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${
                  data.spread_percentage > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {data.spread_percentage > 0 ? '+' : ''}{data.spread_percentage.toFixed(2)}%
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-xl border border-emerald-500/20 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-400 text-xs font-medium">ROI</p>
                <span className="text-lg">📊</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">+{data.roi_percentage.toFixed(2)}%</p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <div className="text-center">
              <p className="text-slate-400 text-xs font-medium mb-2 flex items-center justify-center gap-1">
                <span>📦</span> Lot Size
              </p>
              <p className="text-xl font-bold text-white">{data.lot_size} shares</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs font-medium mb-2 flex items-center justify-center gap-1">
                <span>💵</span> Gross Profit
              </p>
              <p className="text-xl font-bold text-green-400">+₹{data.gross_profit.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-xs font-medium mb-2 flex items-center justify-center gap-1">
                <span>🏦</span> Margin Required
              </p>
              <p className="text-xl font-bold text-yellow-400">₹{data.margin_required.toFixed(0)}</p>
            </div>
          </div>

          {/* Opportunity Card */}
          {data.opportunity && (
            <div className="p-5 bg-gradient-to-r from-green-500/15 to-emerald-500/10 rounded-xl border border-green-500/30 shadow-lg shadow-green-500/10">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💡</span>
                </div>
                <div className="flex-1">
                  <p className="text-green-400 font-bold text-sm mb-1 flex items-center gap-2">
                    Recommended Action
                    <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-xs">
                      BUY SIGNAL
                    </span>
                  </p>
                  <p className="text-white text-lg font-bold mb-2">{data.action}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Expected Profit:</span>
                      <span className="text-green-400 font-bold">+₹{data.gross_profit.toFixed(2)}</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Return:</span>
                      <span className="text-emerald-400 font-bold">+{data.roi_percentage.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}