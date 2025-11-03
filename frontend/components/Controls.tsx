"use client";

import { useEffect, useState } from 'react';
import { Timeframe, ChartMode } from '@/lib/types';
import toast from 'react-hot-toast';

interface ControlsProps {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  chartMode: ChartMode;
  setChartMode: (mode: ChartMode) => void;
  threshold: number;
  setThreshold: (val: number) => void;
  compareStocks: string[];
  setCompareStocks: (stocks: string[]) => void;
}

export function Controls({
  timeframe,
  setTimeframe,
  chartMode,
  setChartMode,
  threshold,
  setThreshold,
  compareStocks,
  setCompareStocks,
}: ControlsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setThreshold(value);
    } else if (e.target.value === "") {
      setThreshold(0);
    }
  };

  // Loading skeleton
  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 p-5">
            <div className="h-20 animate-pulse bg-slate-700/50 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Timeframe Selector */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
            <span className="text-lg">⏰</span>
          </div>
          <label className="text-white font-bold text-sm">Timeframe</label>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(['1m', '5m', '15m', '1h'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-2 rounded-lg font-bold transition-all text-xs ${
                timeframe === tf
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Mode Selector */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <label className="text-white font-bold text-sm">Chart Type</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setChartMode('line')}
            className={`px-3 py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1 ${
              chartMode === 'line'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
            }`}
          >
            <span>📈</span> Line
          </button>
          <button
            onClick={() => setChartMode('candlestick')}
            className={`px-3 py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-1 ${
              chartMode === 'candlestick'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
            }`}
          >
            <span>🕯️</span> Candle
          </button>
        </div>
      </div>

      {/* Threshold Control */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <span className="text-lg">🎯</span>
          </div>
          <label className="text-white font-bold text-sm">
            Threshold: <span className="text-green-400">{threshold}%</span>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={threshold || ""}
            onChange={handleThresholdChange}
            className="flex-1 px-3 py-2 bg-slate-900/80 text-white rounded-lg border border-slate-600/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all text-sm font-medium"
            placeholder="0.0"
          />
          <button
            onClick={() => setThreshold(0.5)}
            className="px-3 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-all text-xs font-bold border border-slate-600/30"
            title="Reset to default"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Compare Mode */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <span className="text-lg">📐</span>
          </div>
          <label className="text-white font-bold text-sm">Compare Mode</label>
        </div>
        <button
          onClick={() => {
            if (compareStocks.length > 0) {
              setCompareStocks([]);
              toast.success("Compare mode disabled");
            } else {
              toast("Click stocks below to compare (max 3)", {
                icon: "ℹ️",
                style: {
                  background: '#1e293b',
                  color: '#fff',
                  border: '1px solid #3b82f6',
                },
              });
            }
          }}
          className={`w-full px-3 py-2 rounded-lg font-bold transition-all text-xs flex items-center justify-center gap-2 ${
            compareStocks.length > 0
              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg shadow-green-500/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/30'
          }`}
        >
          {compareStocks.length > 0 ? (
            <>
              <span>✅</span>
              <span>Comparing {compareStocks.length}</span>
            </>
          ) : (
            <>
              <span>➕</span>
              <span>Enable Compare</span>
            </>
          )}
        </button>
        {compareStocks.length > 0 && (
          <p className="text-xs text-slate-400 mt-2 text-center">
            {compareStocks.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
