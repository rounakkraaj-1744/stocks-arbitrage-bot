import React from 'react';
import { Menu, Bell } from 'lucide-react';

export function TopBar() {
  return (
    <div className="h-16 bg-[#0b1120] border-b border-[#1e293b] flex items-center justify-between px-6 sticky top-0 z-10 ml-64">
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Dashboard</h1>
          <p className="text-slate-400 text-xs">Real-time NSE Arbitrage Opportunities</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-slate-300 text-xs font-medium">Market Status: <span className="text-emerald-500 font-bold">LIVE</span></span>
        </div>
        
        <span className="text-slate-400 text-xs">15:03:14 IST</span>
        
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <Bell size={20} />
          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold border border-[#0b1120]">
            3
          </div>
        </button>

        <div className="w-8 h-8 rounded-full bg-[#1e293b] flex items-center justify-center text-slate-300 text-sm font-bold border border-[#334155] cursor-pointer hover:border-slate-400 transition-colors">
          N
        </div>
      </div>
    </div>
  );
}
