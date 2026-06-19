"use client";

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useWebSocket } from '@/hooks/useWebSocket';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { WatchlistPanel } from '@/components/dashboard/WatchlistPanel';
import { TradingChart } from '@/components/charts/TradingChart';
import { SignalDetailsPanel } from '@/components/dashboard/SignalDetailsPanel';
import { LiveOpportunitiesTable } from '@/components/dashboard/LiveOpportunitiesTable';

import { PaperTradeModal } from '@/components/modals/PaperTradeModal';
import { PortfolioDashboard } from '@/components/modals/PortfolioDashboard';
import { SentimentDashboard } from '@/components/modals/SentimentDashboard';

export default function Home() {
  const { status, currentData, chartData } = useWebSocket();
  const [selectedStock, setSelectedStock] = useState("RELIANCE");

  // Modal states
  const [showPaperTrade, setShowPaperTrade] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const allStocks = Object.values(currentData);
  const selectedData = currentData[selectedStock];
  const selectedChartData = chartData[selectedStock] || [];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "SYMBOL,SPOT,FUTURES,SPREAD,ROI\n"
      + allStocks.map(e => `${e.symbol},${e.spot_price},${e.futures_price},${e.spread_percentage},${e.roi_percentage}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "arbitrage_opportunities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMenuClick = (id: string) => {
    if (id === 'portfolio') setShowPortfolio(true);
    if (id === 'ai') setShowAnalytics(true);
    if (id === 'dashboard') {
      setShowPortfolio(false);
      setShowAnalytics(false);
      setShowPaperTrade(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'bg-slate-800 text-white' }} />
      
      <DashboardLayout onMenuClick={handleMenuClick}>
        {/* Top Stats Cards */}
        <StatsRow 
          opportunities={allStocks} 
          totalMonitored={allStocks.length || 15} 
        />

        {/* Middle 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6">
          <WatchlistPanel 
            data={allStocks}
            selectedStock={selectedStock}
            onSelect={setSelectedStock}
          />

          <TradingChart 
            data={selectedChartData}
            symbol={selectedStock}
          />

          {selectedData ? (
            <SignalDetailsPanel 
              stock={selectedData}
              onAction={() => setShowPaperTrade(true)}
            />
          ) : (
            <div className="w-[300px] bg-[#111827] border border-[#1e293b] rounded-xl flex items-center justify-center text-slate-500 text-sm">
              Select a stock to view details
            </div>
          )}
        </div>

        {/* Bottom Table */}
        <LiveOpportunitiesTable 
          data={allStocks} 
          onExport={handleExport}
        />

      </DashboardLayout>

      {/* Modals */}
      {showPaperTrade && selectedData && (
        <PaperTradeModal 
          stock={selectedData}
          onClose={() => setShowPaperTrade(false)}
        />
      )}

      {showPortfolio && (
        <PortfolioDashboard
          onClose={() => setShowPortfolio(false)}
        />
      )}

      {showAnalytics && selectedData && (
        <SentimentDashboard
          selectedStock={selectedStock}
          historicalSpreads={selectedChartData.map(d => d.spread)}
          onClose={() => setShowAnalytics(false)}
        />
      )}
    </>
  );
}
