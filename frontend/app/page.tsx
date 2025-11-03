"use client";

import { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLocalStorage, loadFromLocalStorage } from '@/hooks/useLocalStorage';
import { ALL_STOCKS, STORAGE_KEYS } from '@/lib/constants';
import { aggregateData } from '@/lib/utils';
import { Timeframe, ChartMode, Alert, BacktestResult } from '@/lib/types';
import { Header } from '@/components/Header';
import { Summary } from '@/components/Summary';
import { Controls } from '@/components/Controls';
import { StockSelector } from '@/components/StockSelector';
import { StockDetails } from '@/components/StockDetails';
import { StocksTable } from '@/components/StocksTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PriceChart } from '@/components/charts/PriceChart';
import { AlertModal } from '@/components/modals/AlertModal';
import { BacktestModal } from '@/components/modals/BacktestModal';
import { PositionSimulator } from '@/components/modals/PositionSimulator';
import { SpreadChart } from '@/components/charts/SpreadChart';
import { AITradeAssistant } from '@/components/ai/AITradeAssistant';
import { AIChatAssistant } from '@/components/ai/AIChatAssistant';
import { AIPortfolioOptimizer } from '@/components/ai/AIPortfolioOptimizer';
import { PredictionModal } from '@/components/modals/PredictionModal';

export default function Home() {
  const { status, currentData, chartData, setChartData, setCurrentData } = useWebSocket();

  const [selectedStock, setSelectedStock] = useState(() =>
    loadFromLocalStorage(STORAGE_KEYS.SELECTED_STOCK, "RELIANCE")
  );
  const [threshold, setThreshold] = useState(0.5);
  const [filterOpportunities, setFilterOpportunities] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>(() =>
    loadFromLocalStorage(STORAGE_KEYS.TIMEFRAME, '1m')
  );
  const [chartMode, setChartMode] = useState<ChartMode>(() =>
    loadFromLocalStorage(STORAGE_KEYS.CHART_MODE, 'line')
  );
  const [compareStocks, setCompareStocks] = useState<string[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.COMPARE_STOCKS, [])
  );
  const [alerts, setAlerts] = useState<Alert[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.ALERTS, [])
  );

  const [fullscreenChart, setFullscreenChart] = useState<"price" | "spread" | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showPositionSimulator, setShowPositionSimulator] = useState(false);
  const [showBacktest, setShowBacktest] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPortfolioOptimizer, setShowPortfolioOptimizer] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  useLocalStorage(STORAGE_KEYS.SELECTED_STOCK, selectedStock);
  useLocalStorage(STORAGE_KEYS.TIMEFRAME, timeframe);
  useLocalStorage(STORAGE_KEYS.CHART_MODE, chartMode);
  useLocalStorage(STORAGE_KEYS.COMPARE_STOCKS, compareStocks);
  useLocalStorage(STORAGE_KEYS.ALERTS, alerts);

  useEffect(() => {
    const savedChartData = loadFromLocalStorage(STORAGE_KEYS.CHART_DATA, {});
    const savedCurrentData = loadFromLocalStorage(STORAGE_KEYS.CURRENT_DATA, {});

    if (Object.keys(savedChartData).length > 0) setChartData(savedChartData);
    if (Object.keys(savedCurrentData).length > 0) setCurrentData(savedCurrentData);
  }, [setChartData, setCurrentData]);

  const receivedStocks = Object.keys(currentData).sort();
  const filteredStocks = filterOpportunities
    ? ALL_STOCKS.filter((s) => currentData[s]?.opportunity)
    : ALL_STOCKS;

  const selectedData = currentData[selectedStock];
  const rawChartData = chartData[selectedStock] || [];
  const selectedChartData = useMemo(
    () => aggregateData(rawChartData, timeframe),
    [rawChartData, timeframe]
  );

  const compareChartData = useMemo(() => {
    if (compareStocks.length === 0) return null;

    return compareStocks.map((stock) => ({
      name: stock,
      data: aggregateData(chartData[stock] || [], timeframe),
    }));
  }, [compareStocks, chartData, timeframe]);

  const opportunities = useMemo(() =>
    Object.values(currentData).filter(d => d.opportunity),
    [currentData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgb(30 41 59)',
          color: '#fff',
          border: '1px solid rgb(51 65 85)',
        },
      }} />

      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <Header
          status={status}
          selectedData={selectedData}
          dataPointsCount={selectedChartData.length}
          receivedCount={receivedStocks.length}
          totalCount={ALL_STOCKS.length}
          timeframe={timeframe}
          alertsCount={alerts.length}
          onShowAlerts={() => setShowAlertModal(true)}
          onShowSimulator={() => setShowPositionSimulator(true)}
          onShowBacktest={() => setShowBacktest(true)}
          onClearData={() => {
            setChartData({});
            setCurrentData({});
          }}
          onShowAIAssistant={() => setShowAIAssistant(true)}
          onShowAIChat={() => setShowAIChat(true)}
          onShowPortfolioOptimizer={() => setShowPortfolioOptimizer(true)}
          onShowPrediction={() => setShowPredictionModal(true)}
        />

        {/* Summary */}
        <Summary currentData={currentData} receivedStocks={receivedStocks} />

        {/* Controls */}
        <Controls
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          chartMode={chartMode}
          setChartMode={setChartMode}
          threshold={threshold}
          setThreshold={setThreshold}
          compareStocks={compareStocks}
          setCompareStocks={setCompareStocks}
        />

        {/* Stock Selector */}
        <StockSelector
          stocks={filteredStocks}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          currentData={currentData}
          chartData={chartData}
          alerts={alerts}
          compareStocks={compareStocks}
          toggleCompareStock={(stock) => {
            if (compareStocks.includes(stock)) {
              setCompareStocks(compareStocks.filter((s) => s !== stock));
            } else if (compareStocks.length < 3) {
              setCompareStocks([...compareStocks, stock]);
            }
          }}
        />

        {selectedData && compareStocks.length === 0 && (
          <StockDetails
            data={selectedData}
            onSetAlert={() => setShowAlertModal(true)}
          />
        )}

        {selectedChartData.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-900/70 backdrop-blur-xl border border-slate-800/50 shadow-2xl hover:shadow-orange-500/10 transition-shadow duration-300">
              <CardHeader className="border-b border-slate-800/50 bg-slate-900/50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
                      <span className="text-xl">📈</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {compareStocks.length > 0
                          ? `Comparison View`
                          : `${selectedStock} Price Action`
                        }
                      </h3>
                      <p className="text-xs text-slate-400 font-normal">
                        {compareStocks.length > 0
                          ? compareStocks.join(', ')
                          : chartMode === 'candlestick' ? 'OHLC Candlestick Chart' : 'Spot vs Futures Price'
                        } • {timeframe} timeframe
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                      <span className="text-xs text-slate-400">{selectedChartData.length}</span>
                      <span className="text-xs text-slate-500 ml-1">points</span>
                    </div>
                    <button
                      onClick={() => setFullscreenChart("price")}
                      className="group px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Fullscreen</span>
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <PriceChart
                  data={selectedChartData}
                  chartMode={chartMode}
                  compareStocks={compareChartData || undefined}
                />
              </CardContent>
            </Card>

            {/* Spread Chart */}
            {compareStocks.length === 0 && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-900/70 backdrop-blur-xl border border-slate-800/50 shadow-2xl hover:shadow-green-500/10 transition-shadow duration-300">
                <CardHeader className="border-b border-slate-800/50 bg-slate-900/50">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                        <span className="text-xl">📊</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {selectedStock} Arbitrage Spread
                        </h3>
                        <p className="text-xs text-slate-400 font-normal">
                          Cash-Futures spread percentage • {timeframe} timeframe
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                        <span className="text-xs text-slate-400">{selectedChartData.length}</span>
                        <span className="text-xs text-slate-500 ml-1">points</span>
                      </div>
                      <button
                        onClick={() => setFullscreenChart("spread")}
                        className="group px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">Fullscreen</span>
                      </button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <SpreadChart data={selectedChartData} threshold={threshold} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stocks Table */}
        <StocksTable
          stocks={ALL_STOCKS}
          currentData={currentData}
          onSelectStock={setSelectedStock}
        />
      </div>

      {/* Fullscreen Chart Modal */}
      {fullscreenChart && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-xl"
          onClick={() => setFullscreenChart(null)}
        >
          <div className="w-full max-w-[95vw] h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-2xl border border-slate-700/50 flex-1 flex flex-col overflow-hidden shadow-2xl">

              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
                    <span className="text-2xl">{fullscreenChart === "price" ? "📈" : "📊"}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {fullscreenChart === "price" ? (
                        compareStocks.length > 0
                          ? `Compare: ${compareStocks.join(', ')}`
                          : `${selectedStock} - ${chartMode === 'candlestick' ? 'Candlestick' : 'Price Chart'}`
                      ) : (
                        `${selectedStock} - Spread Analysis`
                      )}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {timeframe} timeframe • {selectedChartData.length} data points
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFullscreenChart(null)}
                  className="group px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-medium">Close</span>
                </button>
              </div>

              {/* Chart Content */}
              <div className="flex-1 p-6 overflow-auto">
                {fullscreenChart === "price" ? (
                  <PriceChart
                    data={selectedChartData}
                    chartMode={chartMode}
                    compareStocks={compareChartData || undefined}
                    height={700}
                  />
                ) : (
                  <SpreadChart
                    data={selectedChartData}
                    threshold={threshold}
                    height={700}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAlertModal && (
        <AlertModal
          alerts={alerts}
          selectedStock={selectedStock}
          stocks={ALL_STOCKS}
          onClose={() => setShowAlertModal(false)}
          setAlerts={setAlerts}
        />
      )}

      {showPositionSimulator && selectedData && (
        <PositionSimulator
          stock={selectedData}
          onClose={() => setShowPositionSimulator(false)}
        />
      )}

      {showBacktest && (
        <BacktestModal
          selectedStock={selectedStock}
          chartData={chartData}
          onClose={() => setShowBacktest(false)}
          backtestResult={backtestResult}
          setBacktestResult={setBacktestResult}
        />
      )}

      {showAIAssistant && selectedData && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto"
          onClick={() => setShowAIAssistant(false)}
        >
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <AITradeAssistant
              stock={selectedData}
              historicalData={selectedChartData}
            />
            <button
              onClick={() => setShowAIAssistant(false)}
              className="mt-4 w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-xl transition-all font-medium"
            >
              Close AI Assistant
            </button>
          </div>
        </div>
      )}

      {showAIChat && (
        <AIChatAssistant
          currentData={currentData}
          selectedStock={selectedStock}
          onClose={() => setShowAIChat(false)}
        />
      )}

      {showPortfolioOptimizer && (
        <AIPortfolioOptimizer
          opportunities={opportunities}
          onClose={() => setShowPortfolioOptimizer(false)}
        />
      )}

      {showPredictionModal && selectedData && (
        <PredictionModal
          stock={selectedData}
          historicalData={selectedChartData}
          onClose={() => setShowPredictionModal(false)}
        />
      )}
    </div>
  );
}
