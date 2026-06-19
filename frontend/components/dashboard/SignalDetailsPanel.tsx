import React from 'react';
import { type ArbitrageData } from '@/lib/types';

interface SignalDetailsPanelProps {
  stock: ArbitrageData;
  onAction: () => void;
}

export function SignalDetailsPanel({ stock, onAction }: SignalDetailsPanelProps) {
  return (
    <div className="w-[300px] bg-[#111827] border border-[#1e293b] rounded-xl flex flex-col">
      <div className="p-4 border-b border-[#1e293b]">
        <h3 className="text-white font-medium text-sm mb-4">Signal Details</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Spot Price (NSE)</span>
            <span className="text-slate-200 text-sm font-medium">₹{stock.spot_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Futures Price (NSE)</span>
            <span className="text-slate-200 text-sm font-medium">₹{stock.futures_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Spread</span>
            <div className="text-right">
              <span className="text-emerald-500 text-sm font-medium block">
                ₹{(stock.futures_price - stock.spot_price).toFixed(2)} ({stock.spread_percentage.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">ROI (Annualized)</span>
            <span className="text-emerald-500 text-sm font-medium">{stock.roi_percentage.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Lot Size</span>
            <span className="text-slate-200 text-sm font-medium">{stock.lot_size}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Margin Required</span>
            <span className="text-slate-200 text-sm font-medium">₹{((stock.spot_price + stock.futures_price) * stock.lot_size * 0.15).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Potential Profit / Lot</span>
            <span className="text-emerald-500 text-sm font-medium">₹{stock.gross_profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Signal Strength</span>
            <div className="flex gap-1">
              <div className="w-4 h-1.5 bg-emerald-500 rounded-sm"></div>
              <div className="w-4 h-1.5 bg-emerald-500 rounded-sm"></div>
              <div className="w-4 h-1.5 bg-emerald-500 rounded-sm"></div>
              <div className="w-4 h-1.5 bg-emerald-500/30 rounded-sm"></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Updated At</span>
            <span className="text-slate-300 text-xs">{new Date(stock.last_update).toLocaleTimeString('en-IN')} IST</span>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <h4 className="text-white font-medium text-xs mb-3">Action</h4>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={onAction}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold py-2 rounded transition-colors"
          >
            BUY SPOT (NSE)
          </button>
          <button 
            onClick={onAction}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 rounded transition-colors"
          >
            SELL FUTURES (NSE)
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Strategy</span>
            <span className="bg-[#1e293b] text-slate-300 text-[10px] px-2 py-1 rounded border border-[#334155]">Cash & Carry Arbitrage</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-xs">Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-emerald-500 text-xs font-medium">Opportunity</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
