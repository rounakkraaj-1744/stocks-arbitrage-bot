import React from 'react';
import { Download, Filter } from 'lucide-react';
import { type ArbitrageData } from '@/lib/types';

interface LiveOpportunitiesTableProps {
  data: ArbitrageData[];
  onExport?: () => void;
}

export function LiveOpportunitiesTable({ data, onExport }: LiveOpportunitiesTableProps) {
  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-xl flex flex-col mt-6 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-[#1e293b]">
        <h3 className="text-white font-medium">Live Arbitrage Opportunities</h3>
        <div className="flex items-center gap-4">
          <select className="bg-[#1e293b] border border-[#334155] text-slate-300 text-sm rounded-md px-3 py-1.5 outline-none focus:border-blue-500">
            <option>All Strategies</option>
            <option>Cash & Carry</option>
            <option>Reverse Arbitrage</option>
          </select>
          <button className="text-slate-400 hover:text-white transition-colors">
            <Filter size={18} />
          </button>
          <button 
            onClick={onExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#0b1120] border-b border-[#1e293b]">
              <th className="px-4 py-3 text-slate-400 text-xs font-medium w-12 text-center">#</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium">SYMBOL</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">SPOT (NSE)</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">FUTURES (NSE)</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">SPREAD %</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-center">TREND</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">LOT SIZE</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">POTENTIAL PROFIT / LOT</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">ROI %</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-center">SIGNAL</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-center">STATUS</th>
              <th className="px-4 py-3 text-slate-400 text-xs font-medium text-right">UPDATED</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.symbol} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors">
                <td className="px-4 py-3 text-slate-500 text-sm text-center">{idx + 1}</td>
                <td className="px-4 py-3 text-slate-200 text-sm font-medium">{item.symbol}</td>
                <td className="px-4 py-3 text-slate-300 text-sm text-right">₹{item.spot_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-slate-300 text-sm text-right">₹{item.futures_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                <td className={`px-4 py-3 text-sm font-medium text-right ${
                  item.spread_percentage >= 1.0 ? 'text-emerald-500' :
                  item.spread_percentage <= 0.0 ? 'text-red-500' : 'text-emerald-400'
                }`}>
                  {item.spread_percentage.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-center">
                  <div className={`w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent mx-auto ${
                    item.spread_trend === 'WIDENING' 
                      ? 'border-b-[6px] border-b-emerald-500' 
                      : 'border-t-[6px] border-t-red-500'
                  }`}></div>
                </td>
                <td className="px-4 py-3 text-slate-300 text-sm text-right">{item.lot_size}</td>
                <td className="px-4 py-3 text-emerald-500 text-sm font-medium text-right">₹{item.gross_profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                <td className="px-4 py-3 text-emerald-500 text-sm font-medium text-right">{item.roi_percentage.toFixed(2)}%</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-slate-300 text-xs">{item.action === 'BUY' ? 'BUY SPOT / SELL FUTURES' : item.action === 'SELL' ? 'SELL SPOT / BUY FUTURES' : 'HOLD'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-[10px] px-2 py-1 rounded border ${
                    item.opportunity 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>
                    {item.opportunity ? 'Opportunity' : 'Normal'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs text-right">
                  {new Date(item.last_update).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
