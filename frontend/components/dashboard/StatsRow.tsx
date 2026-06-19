import React from 'react';
import { Wallet, Star, Activity } from 'lucide-react';
import { type ArbitrageData } from '@/lib/types';

interface StatsRowProps {
  opportunities: ArbitrageData[];
  totalMonitored: number;
}

export function StatsRow({ opportunities, totalMonitored }: StatsRowProps) {
  const avgSpread = opportunities.length > 0 
    ? opportunities.reduce((acc, curr) => acc + curr.spread_percentage, 0) / opportunities.length 
    : 0;

  const totalProfit = opportunities.reduce((acc, curr) => acc + curr.gross_profit, 0);
  
  const bestPick = [...opportunities].sort((a, b) => b.roi_percentage - a.roi_percentage)[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      
      {/* Opportunities Card */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
        <span className="text-slate-400 text-xs font-bold tracking-wider mb-2">OPPORTUNITIES</span>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-white text-3xl font-bold">{opportunities.length}</span>
            <p className="text-slate-500 text-[10px] mt-1">of {totalMonitored} stocks monitored</p>
          </div>
          {/* Mock mini chart */}
          <div className="w-16 h-8 opacity-70">
            <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-500" stroke="currentColor" fill="none" strokeWidth="2">
              <path d="M0,25 L20,15 L40,20 L60,5 L80,10 L100,0" />
            </svg>
          </div>
        </div>
      </div>

      {/* Average Spread Card */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
        <span className="text-slate-400 text-xs font-bold tracking-wider mb-2">AVERAGE SPREAD</span>
        <div className="flex items-end justify-between">
          <div>
            <span className="text-emerald-500 text-3xl font-bold">{avgSpread.toFixed(2)}%</span>
            <p className="text-slate-500 text-[10px] mt-1">portfolio-wide average</p>
          </div>
          {/* Mock mini chart */}
          <div className="w-16 h-8 opacity-70">
            <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-500" stroke="currentColor" fill="none" strokeWidth="2">
              <path d="M0,20 L20,25 L40,15 L60,10 L80,15 L100,5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Potential Profit Card */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-xs font-bold tracking-wider">POTENTIAL PROFIT</span>
          <Wallet size={16} className="text-slate-500" />
        </div>
        <div>
          <span className="text-emerald-500 text-3xl font-bold">₹{totalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          <p className="text-slate-500 text-[10px] mt-1">gross estimated return</p>
        </div>
      </div>

      {/* Best Pick Card */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <span className="text-slate-400 text-xs font-bold tracking-wider">BEST PICK</span>
          <Star size={16} className="text-amber-500 fill-amber-500" />
        </div>
        <div>
          <span className="text-white text-2xl font-bold">{bestPick ? bestPick.symbol : '-'}</span>
          <p className="text-slate-400 text-[10px] mt-1">
            {bestPick ? `Spread ${bestPick.spread_percentage.toFixed(2)}% | ROI ${bestPick.roi_percentage.toFixed(2)}%` : 'No opportunities'}
          </p>
        </div>
      </div>

      {/* Market Bias Card */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/50 transition-colors relative overflow-hidden">
        <div className="flex justify-between items-start mb-2 relative z-10">
          <span className="text-slate-400 text-xs font-bold tracking-wider">MARKET BIAS</span>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-white text-2xl font-bold">Neutral</span>
            <p className="text-slate-400 text-[10px] mt-1">Volatility: 0.61%</p>
          </div>
          <Activity size={24} className="text-emerald-500/80 mr-2" />
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl"></div>
      </div>

    </div>
  );
}
