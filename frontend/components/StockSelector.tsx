"use client";

import { useEffect, useState } from 'react';
import { ArbitrageData, ChartDataPoint, Alert } from '@/lib/types';
import toast from 'react-hot-toast';

interface StockSelectorProps {
  stocks: string[];
  selectedStock: string;
  setSelectedStock: (stock: string) => void;
  currentData: { [key: string]: ArbitrageData };
  chartData: { [key: string]: ChartDataPoint[] };
  alerts: Alert[];
  compareStocks: string[];
  toggleCompareStock: (stock: string) => void;
}

export function StockSelector({
  stocks,
  selectedStock,
  setSelectedStock,
  currentData,
  chartData,
  alerts,
  compareStocks,
  toggleCompareStock,
}: StockSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading skeleton
  if (!mounted) {
    return (
      <div className="mb-6">
        <div className="mb-4 h-6 w-48 bg-slate-800/50 rounded animate-pulse"></div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {stocks.slice(0, 10).map((stock) => (
            <div
              key={stock}
              className="h-12 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-lg animate-pulse border border-slate-700/50"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <h3 className="text-white font-bold text-lg">
            {compareStocks.length > 0 
              ? 'Select Stocks to Compare (Max 3)' 
              : 'Stock Selection'}
          </h3>
        </div>
        {compareStocks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium">Comparing:</span>
            <div className="flex gap-2">
              {compareStocks.map((stock) => (
                <span 
                  key={stock} 
                  className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full text-xs font-bold shadow-lg"
                >
                  {stock}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stock Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {stocks.map((stock) => {
          const data = currentData[stock];
          const isOpportunity = data?.opportunity;
          const hasData = !!data;
          const hasChartData = chartData[stock] && chartData[stock].length > 0;
          const stockAlerts = alerts.filter(a => a.symbol === stock && !a.triggered);
          const isComparing = compareStocks.includes(stock);
          const isSelected = selectedStock === stock && compareStocks.length === 0;

          return (
            <button
              key={stock}
              onClick={() => {
                if (compareStocks.length > 0) {
                  if (compareStocks.includes(stock)) {
                    toggleCompareStock(stock);
                  } else if (compareStocks.length >= 3) {
                    toast.error("Maximum 3 stocks can be compared");
                  } else {
                    toggleCompareStock(stock);
                  }
                } else {
                  setSelectedStock(stock);
                }
              }}
              className={`relative px-4 py-3 rounded-xl font-bold transition-all text-sm shadow-lg ${
                isSelected
                  ? "bg-gradient-to-r from-orange-600 to-red-600 text-white scale-110 shadow-orange-500/30 z-10"
                  : isComparing
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white scale-105 shadow-blue-500/30"
                  : isOpportunity
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-105 shadow-green-500/20"
                  : hasData
                  ? "bg-gradient-to-br from-slate-800/80 to-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600/50"
                  : "bg-gradient-to-br from-slate-800/50 to-slate-800/30 text-slate-500 hover:bg-slate-800/70 border border-slate-700/30"
              }`}
            >
              {stock}
              
              {/* Loading Indicator */}
              {!hasData && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></span>
              )}
              
              {/* Opportunity Indicator */}
              {isOpportunity && hasData && !isSelected && !isComparing && (
                <span className="absolute -top-1 -right-1">
                  <span className="absolute w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                  <span className="relative w-3 h-3 bg-red-500 rounded-full block shadow-lg shadow-red-500/50"></span>
                </span>
              )}
              
              {/* Chart Data Indicator */}
              {hasChartData && (
                <span className="absolute bottom-1 right-1 w-2 h-2 bg-blue-400 rounded-full shadow-sm"></span>
              )}
              
              {/* Alert Count Badge */}
              {stockAlerts.length > 0 && (
                <span className="absolute -top-2 -left-2 w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border border-blue-400/50">
                  {stockAlerts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded"></span>
          <span className="text-slate-400">Opportunity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gradient-to-r from-orange-600 to-red-600 rounded"></span>
          <span className="text-slate-400">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded"></span>
          <span className="text-slate-400">Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
          <span className="text-slate-400">Loading</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span className="text-slate-400">Has Chart Data</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full text-[10px] font-black flex items-center justify-center">
            #
          </span>
          <span className="text-slate-400">Active Alerts</span>
        </div>
      </div>
    </div>
  );
}
