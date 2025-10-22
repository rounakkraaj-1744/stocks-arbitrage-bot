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

  // Prevent mismatch on SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {stocks.slice(0, 10).map((stock, i) => (
            <div
              key={stock}
              className="h-10 bg-slate-800 rounded-lg animate-pulse"
              style={{ minWidth: 68 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold">
          {compareStocks.length > 0 ? 'Select up to 3 stocks to compare' : 'Select Stock'}
        </h3>
        {compareStocks.length > 0 && (
          <div className="flex gap-2">
            {compareStocks.map((stock) => (
              <span key={stock} className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs">
                {stock}
              </span>
            ))}
          </div>
        )}
      </div>
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
              className={`px-3 py-2 rounded-lg font-medium transition-all relative text-sm
                ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105"
                    : isComparing
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                    : isOpportunity
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:scale-105"
                    : hasData
                    ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700"
                    : "bg-slate-800/30 text-slate-500 hover:bg-slate-800/50 border border-slate-700/50"
                }`}
            >
              {stock}
              {!hasData && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              )}
              {isOpportunity && hasData && !isSelected && !isComparing && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              )}
              {hasChartData && (
                <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              )}
              {stockAlerts.length > 0 && (
                <span className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 text-white rounded-full text-[10px] flex items-center justify-center">
                  {stockAlerts.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
