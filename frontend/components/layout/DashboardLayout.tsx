import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export function DashboardLayout({ children, onMenuClick }: { children: React.ReactNode, onMenuClick?: (id: string) => void }) {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 font-sans selection:bg-blue-500/30">
      <Sidebar onMenuClick={onMenuClick} />
      <div className="flex flex-col min-h-screen">
        <TopBar />
        <main className="ml-64 p-6 flex-1 overflow-x-hidden bg-[#080d1a]">
          {children}
        </main>
      </div>
    </div>
  );
}
