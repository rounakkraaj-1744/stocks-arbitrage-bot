import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Signal, 
  Briefcase, 
  History, 
  Bot, 
  PieChart, 
  Bell, 
  Star, 
  FileText, 
  Settings, 
  HelpCircle,
  LogOut
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { id: 'scanner', label: 'Market Scanner', icon: Search },
  { id: 'signals', label: 'Arbitrage Signals', icon: Signal },
  { id: 'strategies', label: 'Strategies', icon: Briefcase },
  { id: 'backtesting', label: 'Backtesting', icon: History },
  { id: 'ai', label: 'AI Assistant', icon: Bot, badge: 'BETA' },
  { id: 'portfolio', label: 'Portfolio', icon: PieChart },
  { id: 'alerts', label: 'Alerts', icon: Bell },
];

const BOTTOM_MENU = [
  { id: 'watchlist', label: 'Watchlist', icon: Star },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help & Docs', icon: HelpCircle },
];

export function Sidebar({ onMenuClick }: { onMenuClick?: (id: string) => void }) {
  return (
    <div className="w-64 h-screen bg-[#0b1120] border-r border-[#1e293b] flex flex-col fixed left-0 top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm tracking-wide leading-tight">NSE ARBITRAGE</span>
            <span className="text-blue-500 text-[10px] tracking-widest font-semibold">TERMINAL</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
        {MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuClick?.(item.id)}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-colors ${
              item.active 
                ? 'bg-blue-600/10 text-blue-500' 
                : 'text-slate-400 hover:bg-[#1e293b]/50 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={item.active ? 'text-blue-500' : 'text-slate-500'} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[9px] font-bold bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <div className="my-4 border-t border-[#1e293b] w-full"></div>

        {BOTTOM_MENU.map((item) => (
          <button
            key={item.id}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:bg-[#1e293b]/50 hover:text-slate-200 transition-colors"
          >
            <item.icon size={18} className="text-slate-500" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Status Area */}
      <div className="p-4 border-t border-[#1e293b] bg-[#080d1a]">
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-slate-400 text-xs font-medium block mb-1">Market Hours</span>
            <span className="text-slate-300 text-xs">09:15 AM - 03:30 PM IST</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs font-medium block mb-1">Time to Close</span>
            <span className="text-emerald-500 text-xl font-mono tracking-wider font-semibold">00:26:45</span>
          </div>
          
          <button className="flex items-center gap-2 text-slate-400 hover:text-white mt-2 transition-colors">
            <LogOut size={16} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
