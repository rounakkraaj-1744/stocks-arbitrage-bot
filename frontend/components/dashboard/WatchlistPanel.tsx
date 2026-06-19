import React from 'react';
import { Search, Plus } from 'lucide-react';
import { type ArbitrageData } from '@/lib/types';

interface WatchlistPanelProps {
  data: ArbitrageData[];
  selectedStock: string;
  onSelect: (symbol: string) => void;
}

export function WatchlistPanel({ data, selectedStock, onSelect }: WatchlistPanelProps) {
  return (
    <div className="w-[300px] bg-[#111827] border border-[#1e293b] rounded-xl flex flex-col overflow-hidden">
      <div className="p-3 border-b border-[#1e293b] flex items-center justify-between">
        <span className="text-white font-medium text-sm">Watchlist</span>
        <button className="text-slate-400 hover:text-white transition-colors">
          <Plus size={16} />
        </button>
      </div>
      
      <div className="p-3 border-b border-[#1e293b] bg-[#0b1120]">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search stocks" 
            className="w-full bg-[#1e293b] text-sm text-slate-200 placeholder-slate-500 rounded-md py-1.5 pl-8 pr-3 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {data.map((item) => (
            <button
              key={item.symbol}
              onClick={() => onSelect(item.symbol)}
              className={`flex items-center justify-between px-4 py-3 border-b border-[#1e293b]/50 transition-colors ${
                selectedStock === item.symbol 
                  ? 'bg-blue-600/10 border-l-2 border-l-blue-500' 
                  : 'hover:bg-[#1e293b]/30 border-l-2 border-l-transparent'
              }`}
            >
              <span className={`text-sm font-medium ${selectedStock === item.symbol ? 'text-white' : 'text-slate-300'}`}>
                {item.symbol}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-300">₹{item.spot_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className={`text-sm font-medium w-12 text-right ${
                  item.spread_percentage >= 1.0 ? 'text-emerald-500' :
                  item.spread_percentage <= 0.0 ? 'text-red-500' : 'text-emerald-400'
                }`}>
                  {item.spread_percentage.toFixed(2)}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-3 border-t border-[#1e293b] text-center">
        <button className="text-xs text-slate-400 hover:text-white transition-colors w-full py-1">
          View all ({data.length})
        </button>
      </div>
    </div>
  );
}
