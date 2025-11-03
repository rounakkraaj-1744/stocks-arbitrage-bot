"use client";

import { ArbitrageData } from '@/lib/types';

interface HeaderProps {
  status: string;
  selectedData: ArbitrageData | undefined;
  dataPointsCount: number;
  receivedCount: number;
  totalCount: number;
  timeframe: string;
  alertsCount: number;
  onShowAlerts: () => void;
  onShowSimulator: () => void;
  onShowBacktest: () => void;
  onClearData: () => void;
  onShowAIAssistant: () => void;
  onShowAIChat: () => void;
  onShowPortfolioOptimizer: () => void;
  onShowPrediction: () => void;
}

export function Header({
  status,
  selectedData,
  dataPointsCount,
  receivedCount,
  totalCount,
  timeframe,
  alertsCount,
  onShowAlerts,
  onShowSimulator,
  onShowBacktest,
  onClearData,
  onShowAIAssistant,
  onShowAIChat,
  onShowPortfolioOptimizer,
  onShowPrediction,
}: HeaderProps) {
  return (
    <div className="mb-8">
      {/* Main Header Section */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/90 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl">
        
        {/* Top Row: Title + Status */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent">
                NSE Arbitrage Terminal
              </h1>
              
              {/* Status Badge */}
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${
                status === "Connected" 
                  ? "bg-green-500/10 border-green-500/30 text-green-400" 
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  status === "Connected" ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50" : "bg-red-500"
                }`} />
                <span className="text-xs font-semibold uppercase tracking-wide">{status}</span>
              </div>
            </div>
            
            {/* Subtitle with Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
                <span>Yahoo Finance API</span>
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded text-xs font-medium border border-yellow-500/20">
                  15-min delayed
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-medium">{receivedCount}/{totalCount}</span>
                <span className="text-slate-400">stocks loaded</span>
              </div>
              
              {dataPointsCount > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-medium">{dataPointsCount}</span>
                    <span className="text-slate-400">data points</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-xs font-medium border border-emerald-500/20">
                      {timeframe}
                    </span>
                  </div>
                </>
              )}
              
              {selectedData && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">Last update:</span>
                    <span className="text-slate-300 font-medium">{selectedData.last_update}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="border-t border-slate-800/50 pt-5">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* AI Tools Group */}
            <div className="flex items-center gap-2 p-1 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                AI Tools
              </div>
              <button
                onClick={onShowAIAssistant}
                className="group relative px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-purple-500/20"
              >
                <span className="text-base">🤖</span>
                <span>Trade Signal</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </button>
              
              <button
                onClick={onShowAIChat}
                className="group relative px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 rounded-lg border border-pink-500/20 hover:border-pink-500/40 transition-all text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-pink-500/20"
              >
                <span className="text-base">💬</span>
                <span>Chat</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </button>
              
              <button
                onClick={onShowPrediction}
                className="group relative px-4 py-2 bg-gradient-to-r from-purple-500/15 to-pink-500/15 hover:from-purple-500/25 hover:to-pink-500/25 text-purple-200 rounded-lg border border-purple-400/30 hover:border-purple-400/50 transition-all text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-purple-500/30"
              >
                <span className="text-base">🔮</span>
                <span className="font-semibold">Predict</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </button>
              
              <button
                onClick={onShowPortfolioOptimizer}
                className="group relative px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 transition-all text-sm font-medium flex items-center gap-2 shadow-lg hover:shadow-cyan-500/20"
              >
                <span className="text-base">🎯</span>
                <span>Optimize</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </button>
            </div>

            {/* Trading Tools Group */}
            <div className="flex items-center gap-2 p-1 bg-slate-800/40 rounded-xl border border-slate-700/50">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Tools
              </div>
              <button
                onClick={onShowSimulator}
                className="group relative px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all text-sm font-medium flex items-center gap-2"
              >
                <span className="text-base">💹</span>
                <span>Simulator</span>
              </button>
              
              <button
                onClick={onShowBacktest}
                className="group relative px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all text-sm font-medium flex items-center gap-2"
              >
                <span className="text-base">📈</span>
                <span>Backtest</span>
              </button>
              
              <button
                onClick={onShowAlerts}
                className="group relative px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-300 rounded-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-all text-sm font-medium flex items-center gap-2"
              >
                <span className="text-base">🔔</span>
                <span>Alerts</span>
                {alertsCount > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-bold border border-yellow-400/30">
                    {alertsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Actions Group */}
            <div className="flex items-center gap-2">
              <button
                onClick={onClearData}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all text-sm font-medium flex items-center gap-2"
              >
                <span className="text-base">🗑️</span>
                <span>Clear Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
