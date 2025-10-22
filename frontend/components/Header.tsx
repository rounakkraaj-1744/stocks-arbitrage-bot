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
}: HeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent mb-2">
            NSE Cash-Futures Arbitrage Bot
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Real-time monitoring with Yahoo Finance (15-min delayed) • Loaded {receivedCount}/{totalCount} stocks
            {dataPointsCount > 0 && (
              <span className="ml-2 text-green-400">• {dataPointsCount} data points ({timeframe})</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
            <div
              className={`w-2 h-2 rounded-full ${
                status === "Connected" ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50" : "bg-red-500"
              }`}
            />
            <span className="text-slate-300 text-sm font-medium">{status}</span>
          </div>
          {selectedData && (
            <div className="text-slate-400 text-xs bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
              Updated: {selectedData.last_update}
            </div>
          )}
          
          {/* AI Buttons */}
          <button
            onClick={onShowAIAssistant}
            className="px-3 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg border border-purple-500/30 transition-colors text-xs font-medium flex items-center gap-2"
          >
            🤖 AI Trade
          </button>
          <button
            onClick={onShowAIChat}
            className="px-3 py-2 bg-pink-600/20 text-pink-400 hover:bg-pink-600/30 rounded-lg border border-pink-500/30 transition-colors text-xs font-medium flex items-center gap-2"
          >
            💬 AI Chat
          </button>
          <button
            onClick={onShowPortfolioOptimizer}
            className="px-3 py-2 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 rounded-lg border border-cyan-500/30 transition-colors text-xs font-medium flex items-center gap-2"
          >
            🎯 Optimize
          </button>
          
          <button
            onClick={onShowSimulator}
            className="px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-colors text-xs font-medium flex items-center gap-2"
          >
            💹 Simulator
          </button>
          <button
            onClick={onShowBacktest}
            className="px-3 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded-lg border border-emerald-500/30 transition-colors text-xs font-medium flex items-center gap-2"
          >
            📈 Backtest
          </button>
          <button
            onClick={onShowAlerts}
            className="px-3 py-2 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 rounded-lg border border-yellow-500/30 transition-colors text-xs font-medium flex items-center gap-2"
          >
            🔔 Alerts ({alertsCount})
          </button>
          <button
            onClick={onClearData}
            className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg border border-red-500/30 transition-colors text-xs font-medium"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
}
