"use client";

import { ArbitrageData } from '@/lib/types';
import { getTrendIcon, getTrendColor } from '@/lib/utils';

interface StocksTableProps {
  stocks: string[];
  currentData: { [key: string]: ArbitrageData };
  onSelectStock: (stock: string) => void;
}

export function StocksTable({ stocks, currentData, onSelectStock }: StocksTableProps) {
  const receivedStocks = Object.keys(currentData).length;
  
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-800/50 bg-slate-900/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Market Overview</h2>
              <p className="text-sm text-slate-400">
                All stocks with real-time arbitrage analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                <span className="text-white font-bold">{receivedStocks}</span>
                <span className="text-slate-400 text-sm">/ {stocks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
            <tr>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>🏷️</span> Symbol
                </div>
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>📈</span> Spot
                </div>
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>📉</span> Futures
                </div>
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>💰</span> Spread %
                </div>
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider text-center">
                <span>📊</span> Trend
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>📦</span> Lot
                </div>
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>💵</span> Profit
                </div>
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>🎯</span> ROI %
                </div>
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>⚡</span> Action
                </div>
              </th>
              <th className="p-4 text-slate-300 font-bold text-xs uppercase tracking-wider text-center">
                <span>🚨</span> Status
              </th>
            </tr>
          </thead>
          <tbody className="text-white">
            {stocks.map((stock) => {
              const data = currentData[stock];
              
              if (!data) {
                return (
                  <tr
                    key={stock}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-all"
                    onClick={() => onSelectStock(stock)}
                  >
                    <td className="p-4 font-bold text-slate-500">{stock}</td>
                    <td colSpan={9} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-slate-500 italic text-sm">Fetching data...</span>
                      </div>
                    </td>
                  </tr>
                );
              }
              
              return (
                <tr
                  key={stock}
                  className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-all cursor-pointer group"
                  onClick={() => onSelectStock(stock)}
                >
                  <td className="p-4">
                    <div className="font-bold text-orange-400 group-hover:text-orange-300 transition-colors">
                      {stock}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-400 font-medium">₹{data.spot_price.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-purple-400 font-medium">₹{data.futures_price.toFixed(2)}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-bold text-base ${
                        data.spread_percentage > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {data.spread_percentage > 0 ? '+' : ''}{data.spread_percentage.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`${getTrendColor(data.spread_trend)} text-xl`}>
                      {getTrendIcon(data.spread_trend)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-400 font-medium">{data.lot_size}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-green-400 font-bold">+₹{data.gross_profit.toFixed(0)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-bold">+{data.roi_percentage.toFixed(2)}%</span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-400 text-xs px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50">
                      {data.action}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {data.opportunity ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500/15 to-emerald-500/15 text-green-400 rounded-lg text-xs font-bold border border-green-500/30 shadow-lg shadow-green-500/10">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Opportunity
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1.5 bg-slate-800/50 text-slate-400 rounded-lg text-xs font-medium border border-slate-700/50">
                        Normal
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Opportunity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-600 rounded-full"></span>
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span>Loading</span>
            </div>
          </div>
          <span className="text-slate-500 italic">Click any row to view details</span>
        </div>
      </div>
    </div>
  );
}
