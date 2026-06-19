"use client";

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ALL_STOCKS } from '@/lib/constants';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { WatchlistPanel } from '@/components/dashboard/WatchlistPanel';
import { TradingChart } from '@/components/charts/TradingChart';
import { SignalDetailsPanel } from '@/components/dashboard/SignalDetailsPanel';
import { LiveOpportunitiesTable } from '@/components/dashboard/LiveOpportunitiesTable';
import { PaperTradeModal } from '@/components/modals/PaperTradeModal';
import { PortfolioDashboard } from '@/components/modals/PortfolioDashboard';
import { SentimentDashboard } from '@/components/modals/SentimentDashboard';
import { StrategyBuilder } from '@/components/modals/StrategyBuilder';
import { AlertModal } from '@/components/modals/AlertModal';
import { BacktestModal } from '@/components/modals/BacktestModal';

export default function Home() {
  const { status, currentData, chartData } = useWebSocket();
  const [selectedStock, setSelectedStock] = useState("RELIANCE");
  const [showPaperTrade, setShowPaperTrade] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showBacktest, setShowBacktest] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  const allStocks = Object.values(currentData);
  const selectedData = currentData[selectedStock] || {
    symbol: selectedStock,
    spot_price: 0, futures_price: 0, spread: 0, spread_percentage: 0,
    action: 'HOLD', lot_size: 250, gross_profit: 0, roi_percentage: 0,
    timestamp: new Date().toISOString(), last_update: new Date().toISOString()
  };
  const selectedChartData = chartData[selectedStock] || [];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + "SYMBOL,SPOT,FUTURES,SPREAD,ROI\n" + allStocks.map(e => `${e.symbol},${e.spot_price},${e.futures_price},${e.spread_percentage},${e.roi_percentage}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "arbitrage_opportunities.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMenuClick = (id: string) => {
    if (id === 'portfolio')
      setShowPortfolio(true);
    if (id === 'ai')
      setShowAnalytics(true);
    if (id === 'strategies')
      setShowStrategy(true);
    if (id === 'alerts')
      setShowAlerts(true);
    if (id === 'backtesting')
      setShowBacktest(true);
    if (id === 'dashboard') {
      setShowPortfolio(false);
      setShowAnalytics(false);
      setShowPaperTrade(false);
      setShowStrategy(false);
      setShowAlerts(false);
      setShowBacktest(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'bg-slate-800 text-white' }} />

      <DashboardLayout onMenuClick={handleMenuClick}>
        {!showPortfolio && !showAnalytics && !showStrategy && !showAlerts && !showBacktest ? (
          <>
            <StatsRow opportunities={allStocks} totalMonitored={allStocks.length || 15}/>
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6">
              <WatchlistPanel data={allStocks} selectedStock={selectedStock} onSelect={setSelectedStock} />
              <TradingChart data={selectedChartData} symbol={selectedStock} />
              <SignalDetailsPanel stock={selectedData as any} onAction={() => setShowPaperTrade(true)} />
            </div>
            <LiveOpportunitiesTable data={allStocks} onExport={handleExport} />
          </>
        ) : null}

        {showPortfolio && (
          <PortfolioDashboard onClose={() => setShowPortfolio(false)} />
        )}

        {showAnalytics && selectedData && (
          <SentimentDashboard selectedStock={selectedStock} historicalSpreads={selectedChartData.map(d => d.spread)} onClose={() => setShowAnalytics(false)} />
        )}

        {showStrategy && (
          <StrategyBuilder onClose={() => setShowStrategy(false)} />
        )}

        {showAlerts && (
          <AlertModal alerts={alerts} setAlerts={setAlerts} selectedStock={selectedStock} stocks={ALL_STOCKS} onClose={() => setShowAlerts(false)} />
        )}

        {showBacktest && (
          <BacktestModal selectedStock={selectedStock} chartData={chartData} backtestResult={backtestResult} setBacktestResult={setBacktestResult} onClose={() => setShowBacktest(false)} />
        )}
      </DashboardLayout>

      {showPaperTrade && selectedData && (
        <PaperTradeModal selectedStock={selectedData.symbol} currentSpot={selectedData.spot_price} currentFutures={selectedData.futures_price} onClose={() => setShowPaperTrade(false)} />
      )}
    </>
  );
}