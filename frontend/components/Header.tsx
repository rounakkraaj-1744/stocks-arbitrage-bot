"use client";

import { useState, useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useLocalStorage, loadFromLocalStorage } from '@/hooks/useLocalStorage';
import { ALL_STOCKS, STORAGE_KEYS } from '@/lib/constants';
import { aggregateData } from '@/lib/utils';
import { Timeframe, ChartMode, Alert, BacktestResult } from '@/lib/types';

import Header from '@/components/Header';
import { Summary } from '@/components/Summary';
import { Controls } from '@/components/Controls';
import { StockSelector } from '@/components/StockSelector';
import { StockDetails } from '@/components/StockDetails';
import { StocksTable } from '@/components/StocksTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIChatAssistant } from './ai/AIChatAssistant';
import { AIPortfolioOptimizer } from './ai/AIPortfolioOptimizer';
import { AITradeAssistant } from './ai/AITradeAssistant';
import { PriceChart } from './charts/PriceChart';
import { SpreadChart } from './charts/SpreadChart';
import { AlertModal } from './modals/AlertModal';
import { BacktestModal } from './modals/BacktestModal';
import { PositionSimulator } from './modals/PositionSimulator';

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
  
  // AI States
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showPortfolioOptimizer, setShowPortfolioOptimizer] = useState(false);

  // Persist to localStorage
  useLocalStorage(STORAGE_KEYS.SELECTED_STOCK, selectedStock);
  useLocalStorage(STORAGE_KEYS.TIMEFRAME, timeframe);
  useLocalStorage(STORAGE_KEYS.CHART_MODE, chartMode);
  useLocalStorage(STORAGE_KEYS.COMPARE_STOCKS, compareStocks);
  useLocalStorage(STORAGE_KEYS.ALERTS, alerts);

  // Load initial data from localStorage
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
      <Toaster position="top-right" />
      
      <div className="max-w-[1920px] mx-auto">
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
          onShowAIAssistant={() => setShowAIAssistant(true)}
          onShowAIChat={() => setShowAIChat(true)}
          onShowPortfolioOptimizer={() => setShowPortfolioOptimizer(true)}
          onClearData={() => {
            setChartData({});
            setCurrentData({});
          }}
        />

        <Summary currentData={currentData} receivedStocks={receivedStocks} />

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
          <div className="space-y-6 mb-8">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-orange-400 text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>📈</span>
                    {compareStocks.length > 0 
                      ? `Compare Spreads - ${compareStocks.join(', ')} (${timeframe})`
                      : `${selectedStock} - ${chartMode === 'candlestick' ? 'Candlestick' : 'Price'} (${timeframe})`
                    }
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{selectedChartData.length} pts</span>
                    <button
                      onClick={() => setFullscreenChart("price")}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      Fullscreen
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PriceChart 
                  data={selectedChartData}
                  chartMode={chartMode}
                  compareStocks={compareChartData || undefined}
                />
              </CardContent>
            </Card>

            {compareStocks.length === 0 && (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>📊</span>
                      {selectedStock} - Spread Percentage ({timeframe})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{selectedChartData.length} pts</span>
                      <button
                        onClick={() => setFullscreenChart("spread")}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                          />
                        </svg>
                        Fullscreen
                      </button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SpreadChart data={selectedChartData} threshold={threshold} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <StocksTable 
          stocks={ALL_STOCKS}
          currentData={currentData}
          onSelectStock={setSelectedStock}
        />
      </div>

      {/* Fullscreen Modal */}
      {fullscreenChart && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setFullscreenChart(null)}
        >
          <div className="w-full max-w-7xl h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-700 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {fullscreenChart === "price" ? (
                    <>
                      <span>📈</span>
                      {compareStocks.length > 0 
                        ? `Compare Spreads - ${compareStocks.join(', ')}`
                        : `${selectedStock} - ${chartMode === 'candlestick' ? 'Candlestick' : 'Price'}`
                      } ({timeframe})
                    </>
                  ) : (
                    <>
                      <span>📊</span>
                      {selectedStock} - Spread Percentage ({timeframe})
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setFullscreenChart(null)}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
              <div className="flex-1">
                {fullscreenChart === "price" ? (
                  <PriceChart 
                    data={selectedChartData}
                    chartMode={chartMode}
                    compareStocks={compareChartData || undefined}
                    height={600}
                  />
                ) : (
                  <SpreadChart 
                    data={selectedChartData} 
                    threshold={threshold}
                    height={600}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regular Modals */}
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

      {/* AI Modals */}
      {showAIAssistant && selectedData && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowAIAssistant(false)}>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <AITradeAssistant 
              stock={selectedData}
              historicalData={selectedChartData}
            />
            <button
              onClick={() => setShowAIAssistant(false)}
              className="mt-4 w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showAIChat && (
        <div className="fixed bottom-4 right-4 w-[450px] z-50 shadow-2xl">
          <AIChatAssistant 
            currentData={currentData}
            selectedStock={selectedStock}
          />
          <button
            onClick={() => setShowAIChat(false)}
            className="absolute top-2 right-2 px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs z-10"
          >
            ✕
          </button>
        </div>
      )}

      {showPortfolioOptimizer && (
        <AIPortfolioOptimizer
          opportunities={opportunities}
          onClose={() => setShowPortfolioOptimizer(false)}
        />
      )}
    </div>
  );
}
