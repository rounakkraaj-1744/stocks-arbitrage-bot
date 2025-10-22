"use client"

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApexOptions } from "apexcharts";
import toast, { Toaster } from 'react-hot-toast';

const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ArbitrageData {
  opportunity: boolean;
  symbol: string;
  spot_price: number;
  futures_price: number;
  spread: number;
  spread_percentage: number;
  action: string;
  details: string;
  lot_size: number;
  gross_profit: number;
  margin_required: number;
  roi_percentage: number;
  spread_trend: string;
  last_update: string;
}

interface ChartDataPoint {
  time: string;
  timestamp: number;
  spot: number;
  futures: number;
  spread: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

interface Alert {
  id: string;
  symbol: string;
  type: 'spread_above' | 'spread_below' | 'price_above' | 'price_below';
  value: number;
  triggered: boolean;
  createdAt: number;
}

interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  type: 'buy' | 'sell';
  spotPrice: number;
  futuresPrice: number;
  quantity: number;
  spread: number;
  pnl: number;
}

interface BacktestResult {
  totalTrades: number;
  profitableTrades: number;
  totalPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  trades: Trade[];
}

type Timeframe = '1m' | '5m' | '15m' | '1h';
type ChartMode = 'line' | 'candlestick';

const MAX_DATA_POINTS = 200;

const ALL_STOCKS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
  "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT",
  "AXISBANK", "HINDUNILVR", "ASIANPAINT", "MARUTI", "BAJFINANCE"
];

const STORAGE_KEYS = {
  CHART_DATA: "nse_arbitrage_chart_data",
  CURRENT_DATA: "nse_arbitrage_current_data",
  SELECTED_STOCK: "nse_arbitrage_selected_stock",
  ALERTS: "nse_arbitrage_alerts",
  TIMEFRAME: "nse_arbitrage_timeframe",
  CHART_MODE: "nse_arbitrage_chart_mode",
  COMPARE_STOCKS: "nse_arbitrage_compare_stocks",
};

const TIMEFRAME_INTERVALS = {
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
  '1h': 3600000,
};

export default function Home() {
  const [status, setStatus] = useState<string>("Connecting...");
  const [currentData, setCurrentData] = useState<{ [key: string]: ArbitrageData }>({});
  const [chartData, setChartData] = useState<{ [key: string]: ChartDataPoint[] }>({});
  const [selectedStock, setSelectedStock] = useState<string>("RELIANCE");
  const [threshold, setThreshold] = useState<number>(0.5);
  const [filterOpportunities, setFilterOpportunities] = useState<boolean>(false);
  const [fullscreenChart, setFullscreenChart] = useState<"price" | "spread" | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [chartMode, setChartMode] = useState<ChartMode>('line');
  const [compareStocks, setCompareStocks] = useState<string[]>([]);
  const [showPositionSimulator, setShowPositionSimulator] = useState(false);
  const [showBacktest, setShowBacktest] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const savedChartData = localStorage.getItem(STORAGE_KEYS.CHART_DATA);
      const savedCurrentData = localStorage.getItem(STORAGE_KEYS.CURRENT_DATA);
      const savedSelectedStock = localStorage.getItem(STORAGE_KEYS.SELECTED_STOCK);
      const savedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS);
      const savedTimeframe = localStorage.getItem(STORAGE_KEYS.TIMEFRAME);
      const savedChartMode = localStorage.getItem(STORAGE_KEYS.CHART_MODE);
      const savedCompareStocks = localStorage.getItem(STORAGE_KEYS.COMPARE_STOCKS);

      if (savedChartData) setChartData(JSON.parse(savedChartData));
      if (savedCurrentData) setCurrentData(JSON.parse(savedCurrentData));
      if (savedSelectedStock) setSelectedStock(savedSelectedStock);
      if (savedAlerts) setAlerts(JSON.parse(savedAlerts));
      if (savedTimeframe) setTimeframe(savedTimeframe as Timeframe);
      if (savedChartMode) setChartMode(savedChartMode as ChartMode);
      if (savedCompareStocks) setCompareStocks(JSON.parse(savedCompareStocks));
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHART_DATA, JSON.stringify(chartData));
    } catch (error) {
      console.error("Error saving chart data:", error);
    }
  }, [chartData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_DATA, JSON.stringify(currentData));
    } catch (error) {
      console.error("Error saving current data:", error);
    }
  }, [currentData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_STOCK, selectedStock);
    } catch (error) {
      console.error("Error saving selected stock:", error);
    }
  }, [selectedStock]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    } catch (error) {
      console.error("Error saving alerts:", error);
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMEFRAME, timeframe);
    } catch (error) {
      console.error("Error saving timeframe:", error);
    }
  }, [timeframe]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHART_MODE, chartMode);
    } catch (error) {
      console.error("Error saving chart mode:", error);
    }
  }, [chartMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPARE_STOCKS, JSON.stringify(compareStocks));
    } catch (error) {
      console.error("Error saving compare stocks:", error);
    }
  }, [compareStocks]);

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setThreshold(value);
    } else if (e.target.value === "") {
      setThreshold(0);
    }
  };

  const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEYS.CHART_DATA);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_DATA);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_STOCK);
    setChartData({});
    setCurrentData({});
    toast.success("History cleared successfully");
  };

  // Alert checking logic
  useEffect(() => {
    if (alerts.length === 0) return;

    alerts.forEach((alert) => {
      const data = currentData[alert.symbol];
      if (!data || alert.triggered) return;

      let shouldTrigger = false;
      let message = "";

      switch (alert.type) {
        case 'spread_above':
          if (data.spread_percentage >= alert.value) {
            shouldTrigger = true;
            message = `🚨 ${alert.symbol}: Spread is ${data.spread_percentage.toFixed(2)}% (above ${alert.value}%)`;
          }
          break;
        case 'spread_below':
          if (data.spread_percentage <= alert.value) {
            shouldTrigger = true;
            message = `🚨 ${alert.symbol}: Spread is ${data.spread_percentage.toFixed(2)}% (below ${alert.value}%)`;
          }
          break;
        case 'price_above':
          if (data.spot_price >= alert.value) {
            shouldTrigger = true;
            message = `🚨 ${alert.symbol}: Price is ₹${data.spot_price.toFixed(2)} (above ₹${alert.value})`;
          }
          break;
        case 'price_below':
          if (data.spot_price <= alert.value) {
            shouldTrigger = true;
            message = `🚨 ${alert.symbol}: Price is ₹${data.spot_price.toFixed(2)} (below ₹${alert.value})`;
          }
          break;
      }

      if (shouldTrigger) {
        toast.success(message, {
          duration: 10000,
          icon: '🔔',
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #22c55e',
          },
        });

        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id ? { ...a, triggered: true } : a
          )
        );
      }
    });
  }, [currentData, alerts]);

  // WebSocket connection with OHLC simulation
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3030/ws");

    ws.onopen = () => {
      setStatus("Connected");
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const parsed: ArbitrageData = JSON.parse(event.data);

        setCurrentData((prev) => ({
          ...prev,
          [parsed.symbol]: parsed,
        }));

        const timestamp = Date.now();
        const timeString = new Date().toLocaleTimeString();

        setChartData((prev) => {
          const stockData = prev[parsed.symbol] || [];
          const lastPoint = stockData[stockData.length - 1];
          
          // Simulate OHLC if not provided
          const volatility = 0.002; // 0.2% random variation
          const randomChange = (Math.random() - 0.5) * 2 * volatility;
          
          const newPoint: ChartDataPoint = {
            time: timeString,
            timestamp: timestamp,
            spot: parsed.spot_price,
            futures: parsed.futures_price,
            spread: parsed.spread_percentage,
            open: lastPoint?.close || parsed.spot_price,
            high: parsed.spot_price * (1 + Math.abs(randomChange)),
            low: parsed.spot_price * (1 - Math.abs(randomChange)),
            close: parsed.spot_price,
          };

          const updated = [...stockData, newPoint];
          return {
            ...prev,
            [parsed.symbol]: updated.length > MAX_DATA_POINTS ? updated.slice(-MAX_DATA_POINTS) : updated,
          };
        });
      } catch (e) {
        console.error("Error parsing message:", e);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("Error");
    };

    ws.onclose = () => {
      setStatus("Disconnected");
      console.log("WebSocket disconnected");
    };

    return () => ws.close();
  }, []);

  // Aggregate data based on timeframe
  const aggregateData = (data: ChartDataPoint[], interval: Timeframe): ChartDataPoint[] => {
    if (interval === '1m' || data.length === 0) return data;

    const intervalMs = TIMEFRAME_INTERVALS[interval];
    const aggregated: ChartDataPoint[] = [];
    let currentBucket: ChartDataPoint[] = [];
    let bucketStartTime = data[0].timestamp;

    data.forEach((point) => {
      if (point.timestamp - bucketStartTime < intervalMs) {
        currentBucket.push(point);
      } else {
        if (currentBucket.length > 0) {
          aggregated.push(aggregateBucket(currentBucket));
        }
        currentBucket = [point];
        bucketStartTime = point.timestamp;
      }
    });

    if (currentBucket.length > 0) {
      aggregated.push(aggregateBucket(currentBucket));
    }

    return aggregated;
  };

  const aggregateBucket = (bucket: ChartDataPoint[]): ChartDataPoint => {
    const avgSpot = bucket.reduce((sum, p) => sum + p.spot, 0) / bucket.length;
    const avgFutures = bucket.reduce((sum, p) => sum + p.futures, 0) / bucket.length;
    const avgSpread = bucket.reduce((sum, p) => sum + p.spread, 0) / bucket.length;

    return {
      time: bucket[bucket.length - 1].time,
      timestamp: bucket[bucket.length - 1].timestamp,
      spot: avgSpot,
      futures: avgFutures,
      spread: avgSpread,
      open: bucket[0].open || bucket[0].spot,
      high: Math.max(...bucket.map(p => p.high || p.spot)),
      low: Math.min(...bucket.map(p => p.low || p.spot)),
      close: bucket[bucket.length - 1].close || bucket[bucket.length - 1].spot,
    };
  };

  // Backtest simulation
  const runBacktest = (
    symbol: string,
    startDate: Date,
    endDate: Date,
    buyThreshold: number,
    sellThreshold: number,
    capital: number
  ): BacktestResult => {
    const data = chartData[symbol] || [];
    const filteredData = data.filter(
      (d) => d.timestamp >= startDate.getTime() && d.timestamp <= endDate.getTime()
    );

    let position: 'none' | 'long' = 'none';
    let entryPrice = 0;
    let entrySpread = 0;
    const trades: Trade[] = [];
    let currentCapital = capital;

    filteredData.forEach((point, index) => {
      if (position === 'none' && point.spread >= buyThreshold) {
        // Enter long position
        position = 'long';
        entryPrice = point.spot;
        entrySpread = point.spread;
      } else if (position === 'long' && (point.spread <= sellThreshold || index === filteredData.length - 1)) {
        // Exit position
        const pnl = (point.spot - entryPrice) * 100; // Assume 100 shares per trade
        currentCapital += pnl;
        
        trades.push({
          id: `trade-${Date.now()}-${Math.random()}`,
          timestamp: point.timestamp,
          symbol,
          type: pnl > 0 ? 'buy' : 'sell',
          spotPrice: point.spot,
          futuresPrice: point.futures,
          quantity: 100,
          spread: point.spread,
          pnl,
        });
        
        position = 'none';
      }
    });

    const profitableTrades = trades.filter((t) => t.pnl > 0).length;
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
    
    // Calculate max drawdown
    let peak = capital;
    let maxDrawdown = 0;
    let runningCapital = capital;
    
    trades.forEach((trade) => {
      runningCapital += trade.pnl;
      if (runningCapital > peak) peak = runningCapital;
      const drawdown = ((peak - runningCapital) / peak) * 100;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    const winRate = trades.length > 0 ? (profitableTrades / trades.length) * 100 : 0;
    
    // Simple Sharpe ratio calculation (annualized)
    const returns = trades.map((t) => (t.pnl / capital) * 100);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / (returns.length || 1);
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length || 1)
    );
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    return {
      totalTrades: trades.length,
      profitableTrades,
      totalPnL,
      maxDrawdown,
      sharpeRatio,
      winRate,
      trades,
    };
  };

  // Compare stocks toggle
  const toggleCompareStock = (stock: string) => {
    setCompareStocks((prev) => {
      if (prev.includes(stock)) {
        return prev.filter((s) => s !== stock);
      } else if (prev.length < 3) {
        return [...prev, stock];
      } else {
        toast.error("Maximum 3 stocks can be compared");
        return prev;
      }
    });
  };

  const stocks = ALL_STOCKS;
  const receivedStocks = Object.keys(currentData).sort();

  const filteredStocks = filterOpportunities
    ? stocks.filter((s) => currentData[s]?.opportunity)
    : stocks;

  const selectedData = currentData[selectedStock];
  const rawChartData = chartData[selectedStock] || [];
  const selectedChartData = useMemo(
    () => aggregateData(rawChartData, timeframe),
    [rawChartData, timeframe]
  );

  // Compare mode chart data
  const compareChartData = useMemo(() => {
    if (compareStocks.length === 0) return null;
    
    return compareStocks.map((stock) => ({
      name: stock,
      data: aggregateData(chartData[stock] || [], timeframe),
    }));
  }, [compareStocks, chartData, timeframe]);

  const totalOpportunities = receivedStocks.filter((s) => currentData[s]?.opportunity).length;
  const avgSpread =
    receivedStocks.length > 0
      ? receivedStocks.reduce((sum, s) => sum + (currentData[s]?.spread_percentage || 0), 0) / receivedStocks.length
      : 0;
  const totalPotentialProfit = receivedStocks.reduce(
    (sum, s) => sum + (currentData[s]?.opportunity ? currentData[s].gross_profit : 0),
    0
  );
  const bestOpportunity = receivedStocks.reduce((best, s) => {
    const data = currentData[s];
    if (!data?.opportunity) return best;
    if (!best || Math.abs(data.spread_percentage) > Math.abs(currentData[best]?.spread_percentage || 0)) {
      return s;
    }
    return best;
  }, "" as string);

  const getTrendIcon = (trend: string) => {
    if (trend === "rising") return "▲";
    if (trend === "falling") return "▼";
    return "─";
  };

  const getTrendColor = (trend: string) => {
    if (trend === "rising") return "text-green-400";
    if (trend === "falling") return "text-red-400";
    return "text-yellow-400";
  };

  // Alert Management Functions
  const addAlert = (symbol: string, type: Alert['type'], value: number) => {
    const newAlert: Alert = {
      id: `${Date.now()}-${Math.random()}`,
      symbol,
      type,
      value,
      triggered: false,
      createdAt: Date.now(),
    };
    setAlerts((prev) => [...prev, newAlert]);
    toast.success(`Alert created for ${symbol}`);
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("Alert deleted");
  };

  const resetAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, triggered: false } : a))
    );
    toast.success("Alert reset");
  };

  // Chart series for candlestick mode
  const candlestickSeries = useMemo(() => {
    if (chartMode !== 'candlestick') return null;
    
    return [{
      name: 'OHLC',
      data: selectedChartData.map((point) => ({
        x: new Date(point.timestamp),
        y: [
          point.open || point.spot,
          point.high || point.spot,
          point.low || point.spot,
          point.close || point.spot,
        ],
      })),
    }];
  }, [selectedChartData, chartMode]);

  // Chart series for line mode
  const priceChartSeries = useMemo(() => {
    if (compareStocks.length > 0 && compareChartData) {
      return compareChartData.map((stock) => ({
        name: `${stock.name} Spread`,
        data: stock.data.map((point) => point.spread),
      }));
    }

    return [
      {
        name: "Spot Price",
        data: selectedChartData.map((point) => point.spot),
      },
      {
        name: "Futures Price",
        data: selectedChartData.map((point) => point.futures),
      },
    ];
  }, [selectedChartData, compareStocks, compareChartData]);

  const spreadChartSeries = [{
    name: "Spread %",
    data: selectedChartData.map((point) => point.spread),
  }];

  const categories = selectedChartData.map((point) => point.time);

  const candlestickOptions: ApexOptions = {
    chart: {
      type: "candlestick",
      zoom: { enabled: true },
      toolbar: { show: true },
      background: "transparent",
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: { colors: "#64748b" },
      },
    },
    yaxis: {
      title: { text: "Price (₹)", style: { color: "#64748b" } },
      labels: {
        style: { colors: ["#64748b"] },
        formatter: (val) => `₹${val?.toFixed(2) || 'N/A'}`,
      },
      tooltip: { enabled: true },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#22c55e',
          downward: '#ef4444',
        },
      },
    },
    grid: { borderColor: "#334155" },
    tooltip: {
      theme: "dark",
      custom: function({ seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        if (!data) return '';
        
        const o = data.y[0];
        const h = data.y[1];
        const l = data.y[2];
        const c = data.y[3];
        
        return `
          <div class="p-3 bg-slate-900 border border-slate-700 rounded">
            <div class="text-white font-semibold mb-2">OHLC Data</div>
            <div class="text-slate-300 text-sm space-y-1">
              <div>Open: <span class="text-blue-400">₹${o?.toFixed(2)}</span></div>
              <div>High: <span class="text-green-400">₹${h?.toFixed(2)}</span></div>
              <div>Low: <span class="text-red-400">₹${l?.toFixed(2)}</span></div>
              <div>Close: <span class="text-orange-400">₹${c?.toFixed(2)}</span></div>
            </div>
          </div>
        `;
      },
    },
  };

  const priceChartOptions: ApexOptions = {
    chart: {
      type: "line",
      zoom: { enabled: true, type: "x" },
      toolbar: { show: true },
      background: "transparent",
    },
    stroke: { width: 2, curve: "smooth" },
    colors: compareStocks.length > 0 
      ? ["#60a5fa", "#a78bfa", "#fb923c"] 
      : ["#60a5fa", "#a78bfa"],
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { sizeOffset: 6 } },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "dark",
      y: {
        formatter: (val) => {
          if (val == null || isNaN(val)) return "N/A";
          return compareStocks.length > 0 ? `${val.toFixed(2)}%` : `₹${val.toFixed(2)}`;
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        style: { colors: "#64748b", fontSize: "11px" },
      },
      axisBorder: { show: true, color: "#334155" },
      axisTicks: { show: true, color: "#334155" },
    },
    yaxis: {
      title: { 
        text: compareStocks.length > 0 ? "Spread %" : "Price (₹)", 
        style: { color: "#64748b" } 
      },
      labels: {
        style: { colors: ["#64748b"] },
        formatter: (val) => {
          if (val == null || isNaN(val)) return "N/A";
          return compareStocks.length > 0 ? `${val.toFixed(2)}%` : `₹${val.toFixed(2)}`;
        },
      },
    },
    legend: {
      position: "top",
      labels: { colors: "#64748b" },
    },
    grid: {
      borderColor: "#334155",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
  };

  const spreadChartOptions: ApexOptions = {
    chart: {
      type: "area",
      zoom: { enabled: true, type: "x" },
      toolbar: { show: true },
      background: "transparent",
    },
    stroke: { width: 2, curve: "smooth" },
    colors: ["#fb923c"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { sizeOffset: 6 } },
    tooltip: {
      shared: true,
      intersect: false,
      theme: "dark",
      y: {
        formatter: (val) => {
          if (val == null || isNaN(val)) return "N/A";
          return `${val.toFixed(2)}%`;
        },
      },
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        style: { colors: "#64748b", fontSize: "11px" },
      },
      axisBorder: { show: true, color: "#334155" },
      axisTicks: { show: true, color: "#334155" },
    },
    yaxis: {
      title: { text: "Spread %", style: { color: "#64748b" } },
      labels: {
        style: { colors: ["#64748b"] },
        formatter: (val) => {
          if (val == null || isNaN(val)) return "N/A";
          return `${val.toFixed(2)}%`;
        },
      },
    },
    legend: {
      position: "top",
      labels: { colors: "#64748b" },
    },
    grid: {
      borderColor: "#334155",
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    annotations: {
      yaxis: [
        {
          y: threshold,
          borderColor: "#22c55e",
          strokeDashArray: 5,
          label: {
            borderColor: "#22c55e",
            style: { color: "#fff", background: "#22c55e" },
            text: "Buy Zone",
          },
        },
        {
          y: -threshold,
          borderColor: "#ef4444",
          strokeDashArray: 5,
          label: {
            borderColor: "#ef4444",
            style: { color: "#fff", background: "#ef4444" },
            text: "Sell Zone",
          },
        },
        {
          y: 0,
          borderColor: "#64748b",
          strokeDashArray: 5,
        },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-[1920px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 bg-clip-text text-transparent mb-2">
                NSE Cash-Futures Arbitrage Bot
              </h1>
              <p className="text-slate-400 text-sm md:text-base">
                Real-time monitoring with Yahoo Finance (15-min delayed) • Loaded {receivedStocks.length}/{stocks.length} stocks
                {selectedChartData.length > 0 && (
                  <span className="ml-2 text-green-400">• {selectedChartData.length} data points ({timeframe})</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">
                <div
                  className={`w-2 h-2 rounded-full ${
                    status === "Connected" ? "bg-green-500 animate-pulse shadow-lg shadow-green-500/50" : "bg-red-500"
                  }`}
                />
                <span className="text-slate-300 text-sm font-medium">{status}</span>
              </div>
              {selectedData && (
                <div className="text-slate-400 text-xs bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
                  Updated: {selectedData.last_update}
                </div>
              )}
              <button
                onClick={() => setShowPositionSimulator(true)}
                className="px-3 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 rounded-lg border border-purple-500/30 transition-colors text-xs font-medium flex items-center gap-2"
              >
                💹 Simulator
              </button>
              <button
                onClick={() => setShowBacktest(true)}
                className="px-3 py-2 bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 rounded-lg border border-cyan-500/30 transition-colors text-xs font-medium flex items-center gap-2"
              >
                📈 Backtest
              </button>
              <button
                onClick={() => setShowAlertModal(true)}
                className="px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg border border-blue-500/30 transition-colors text-xs font-medium flex items-center gap-2"
              >
                🔔 Alerts ({alerts.length})
              </button>
              <button
                onClick={clearStoredData}
                className="px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg border border-red-500/30 transition-colors text-xs font-medium"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        </div>

        {/* Summary Dashboard */}
        <div className="mb-6">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Portfolio Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4 rounded-lg border border-green-500/20">
                  <p className="text-slate-400 text-xs mb-1">Active Opportunities</p>
                  <p className="text-3xl font-bold text-green-400">{totalOpportunities}</p>
                  <p className="text-xs text-green-500/60 mt-1">of {receivedStocks.length} stocks</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4 rounded-lg border border-blue-500/20">
                  <p className="text-slate-400 text-xs mb-1">Average Spread</p>
                  <p className="text-3xl font-bold text-blue-400">{avgSpread.toFixed(2)}%</p>
                  <p className="text-xs text-blue-500/60 mt-1">across portfolio</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/5 p-4 rounded-lg border border-orange-500/20">
                  <p className="text-slate-400 text-xs mb-1">Potential Profit</p>
                  <p className="text-3xl font-bold text-orange-400">₹{totalPotentialProfit.toFixed(0)}</p>
                  <p className="text-xs text-orange-500/60 mt-1">gross estimate</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-4 rounded-lg border border-purple-500/20">
                  <p className="text-slate-400 text-xs mb-1">Top Opportunity</p>
                  <p className="text-3xl font-bold text-purple-400">{bestOpportunity || "None"}</p>
                  <p className="text-xs text-purple-500/60 mt-1">highest spread</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold text-sm">Timeframe:</label>
                <div className="flex gap-2">
                  {(['1m', '5m', '15m', '1h'] as Timeframe[]).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                        timeframe === tf
                          ? 'bg-orange-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold text-sm">Chart Mode:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartMode('line')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                      chartMode === 'line'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    📈 Line
                  </button>
                  <button
                    onClick={() => setChartMode('candlestick')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                      chartMode === 'candlestick'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    🕯️ Candle
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold text-sm">Threshold: {threshold}%</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={threshold || ""}
                    onChange={handleThresholdChange}
                    className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm"
                  />
                  <button
                    onClick={() => setThreshold(0.5)}
                    className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <label className="text-white font-semibold text-sm">Compare Mode:</label>
                <button
                  onClick={() => {
                    if (compareStocks.length > 0) {
                      setCompareStocks([]);
                      toast.success("Compare mode disabled");
                    } else {
                      toast.info("Click stocks below to compare (max 3)");
                    }
                  }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    compareStocks.length > 0
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {compareStocks.length > 0 ? `Comparing ${compareStocks.length} stocks` : 'Enable Compare'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Selector with Compare Mode */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">
              {compareStocks.length > 0 ? 'Select up to 3 stocks to compare' : 'Select Stock'}
            </h3>
            {compareStocks.length > 0 && (
              <div className="flex gap-2">
                {compareStocks.map((stock) => (
                  <span key={stock} className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs">
                    {stock}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {filteredStocks.map((stock) => {
              const data = currentData[stock];
              const isOpportunity = data?.opportunity;
              const hasData = !!data;
              const hasChartData = chartData[stock] && chartData[stock].length > 0;
              const stockAlerts = alerts.filter(a => a.symbol === stock && !a.triggered);
              const isComparing = compareStocks.includes(stock);
              const isSelected = selectedStock === stock && compareStocks.length === 0;

              return (
                <button
                  key={stock}
                  onClick={() => {
                    if (compareStocks.length > 0) {
                      toggleCompareStock(stock);
                    } else {
                      setSelectedStock(stock);
                    }
                  }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all relative text-sm ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105"
                      : isComparing
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md"
                      : isOpportunity
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md hover:scale-105"
                      : hasData
                      ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700"
                      : "bg-slate-800/30 text-slate-500 hover:bg-slate-800/50 border border-slate-700/50"
                  }`}
                >
                  {stock}
                  {!hasData && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                  )}
                  {isOpportunity && hasData && !isSelected && !isComparing && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  )}
                  {hasChartData && (
                    <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  )}
                  {stockAlerts.length > 0 && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 text-white rounded-full text-[10px] flex items-center justify-center">
                      {stockAlerts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Stock Details */}
        {selectedData && compareStocks.length === 0 && (
          <div className="mb-8">
            <Card
              className={`${
                selectedData.opportunity
                  ? "border-green-500/50 bg-gradient-to-br from-green-950/40 to-emerald-950/20"
                  : "border-slate-800 bg-slate-900/30"
              } backdrop-blur-sm`}
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center justify-between ${
                    selectedData.opportunity ? "text-green-400" : "text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedData.opportunity ? "🚀" : "⏳"}</span>
                    <div>
                      <div className="text-2xl">{selectedData.symbol}</div>
                      <div className="text-sm font-normal text-slate-400 mt-1">
                        {selectedData.opportunity ? "Arbitrage Opportunity Detected" : "Monitoring..."}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowAlertModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    🔔 Set Alert
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                    <p className="text-slate-400 text-xs mb-2">Spot Price</p>
                    <p className="text-2xl font-bold text-blue-400">₹{selectedData.spot_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                    <p className="text-slate-400 text-xs mb-2">Futures Price</p>
                    <p className="text-2xl font-bold text-purple-400">₹{selectedData.futures_price.toFixed(2)}</p>
                  </div>
                  <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                    <p className="text-slate-400 text-xs mb-2">Spread (₹)</p>
                    <p className="text-2xl font-bold text-orange-400">₹{selectedData.spread.toFixed(2)}</p>
                  </div>
                  <div
                    className={`p-4 rounded-lg border ${
                      selectedData.spread_percentage > 0
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-red-500/10 border-red-500/20"
                    }`}
                  >
                    <p className="text-slate-400 text-xs mb-2">
                      Spread %{" "}
                      <span className={getTrendColor(selectedData.spread_trend)}>
                        {getTrendIcon(selectedData.spread_trend)}
                      </span>
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        selectedData.spread_percentage > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {selectedData.spread_percentage.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                    <p className="text-slate-400 text-xs mb-2">ROI</p>
                    <p className="text-2xl font-bold text-emerald-400">{selectedData.roi_percentage.toFixed(2)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-slate-700/50">
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Lot Size</p>
                    <p className="text-xl font-semibold text-white">{selectedData.lot_size} shares</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Gross Profit</p>
                    <p className="text-xl font-semibold text-green-400">₹{selectedData.gross_profit.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-slate-400 text-sm mb-1">Margin Required</p>
                    <p className="text-xl font-semibold text-yellow-400">₹{selectedData.margin_required.toFixed(0)}</p>
                  </div>
                </div>

                {selectedData.opportunity && (
                  <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 p-4 rounded-lg border border-green-500/30">
                    <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      Recommended Action:
                    </p>
                    <p className="text-white text-lg font-medium mb-2">{selectedData.action}</p>
                    <p className="text-slate-300 text-sm">
                      Expected profit per lot:{" "}
                      <span className="text-green-400 font-semibold">₹{selectedData.gross_profit.toFixed(2)}</span> (
                      {selectedData.roi_percentage.toFixed(2)}% return on margin)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
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
                {chartMode === 'candlestick' && candlestickSeries && compareStocks.length === 0 ? (
                  <ApexCharts 
                    options={candlestickOptions} 
                    series={candlestickSeries} 
                    type="candlestick" 
                    height={400} 
                  />
                ) : (
                  <ApexCharts 
                    options={priceChartOptions} 
                    series={priceChartSeries} 
                    type="line" 
                    height={400} 
                  />
                )}
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
                  <ApexCharts options={spreadChartOptions} series={spreadChartSeries} type="area" height={400} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* All Stocks Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <span>📋</span>
              All Stocks Overview ({receivedStocks.length}/{stocks.length} loaded)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-3 text-slate-400 font-medium">Symbol</th>
                    <th className="p-3 text-slate-400 font-medium">Spot</th>
                    <th className="p-3 text-slate-400 font-medium">Futures</th>
                    <th className="p-3 text-slate-400 font-medium">Spread %</th>
                    <th className="p-3 text-slate-400 font-medium">Trend</th>
                    <th className="p-3 text-slate-400 font-medium">Lot</th>
                    <th className="p-3 text-slate-400 font-medium">Profit</th>
                    <th className="p-3 text-slate-400 font-medium">ROI %</th>
                    <th className="p-3 text-slate-400 font-medium">Action</th>
                    <th className="p-3 text-slate-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {stocks.map((stock) => {
                    const data = currentData[stock];
                    if (!data) {
                      return (
                        <tr
                          key={stock}
                          className="border-b border-slate-800 hover:bg-slate-800/30 cursor-pointer"
                          onClick={() => setSelectedStock(stock)}
                        >
                          <td className="p-3 font-bold text-slate-500">{stock}</td>
                          <td colSpan={9} className="p-3 text-slate-600 text-center italic">
                            <span className="animate-pulse">Fetching data...</span>
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr
                        key={stock}
                        className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedStock(stock)}
                      >
                        <td className="p-3 font-bold text-orange-400">{stock}</td>
                        <td className="p-3 text-slate-300">₹{data.spot_price.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">₹{data.futures_price.toFixed(2)}</td>
                        <td
                          className={`p-3 font-bold ${
                            data.spread_percentage > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {data.spread_percentage.toFixed(2)}%
                        </td>
                        <td className="p-3">
                          <span className={getTrendColor(data.spread_trend)}>{getTrendIcon(data.spread_trend)}</span>
                        </td>
                        <td className="p-3 text-slate-400">{data.lot_size}</td>
                        <td className="p-3 text-green-400 font-semibold">₹{data.gross_profit.toFixed(0)}</td>
                        <td className="p-3 text-emerald-400 font-semibold">{data.roi_percentage.toFixed(2)}%</td>
                        <td className="p-3 text-xs text-slate-400">{data.action}</td>
                        <td className="p-3">
                          {data.opportunity ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium animate-pulse border border-green-500/30">
                              Opportunity
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">Normal</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenChart && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setFullscreenChart(null)}
        >
          <div className="w-full max-w-7xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
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
              {fullscreenChart === "price" ? (
                chartMode === 'candlestick' && candlestickSeries && compareStocks.length === 0 ? (
                  <ApexCharts 
                    options={candlestickOptions} 
                    series={candlestickSeries} 
                    type="candlestick" 
                    height={600} 
                  />
                ) : (
                  <ApexCharts 
                    options={priceChartOptions} 
                    series={priceChartSeries} 
                    type="line" 
                    height={600} 
                  />
                )
              ) : (
                <ApexCharts options={spreadChartOptions} series={spreadChartSeries} type="area" height={600} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert Management Modal */}
      {showAlertModal && (
        <AlertModal
          alerts={alerts}
          selectedStock={selectedStock}
          stocks={stocks}
          onClose={() => setShowAlertModal(false)}
          onCreateAlert={addAlert}
          onDeleteAlert={deleteAlert}
          onResetAlert={resetAlert}
        />
      )}

      {/* Position Simulator Modal */}
      {showPositionSimulator && selectedData && (
        <PositionSimulator
          stock={selectedData}
          onClose={() => setShowPositionSimulator(false)}
        />
      )}

      {/* Backtest Modal */}
      {showBacktest && (
        <BacktestModal
          selectedStock={selectedStock}
          chartData={chartData}
          onClose={() => setShowBacktest(false)}
          onRunBacktest={runBacktest}
          backtestResult={backtestResult}
          setBacktestResult={setBacktestResult}
        />
      )}
    </div>
  );
}

// Component: Alert Modal
function AlertModal({
  alerts,
  selectedStock,
  stocks,
  onClose,
  onCreateAlert,
  onDeleteAlert,
  onResetAlert,
}: {
  alerts: Alert[];
  selectedStock: string;
  stocks: string[];
  onClose: () => void;
  onCreateAlert: (symbol: string, type: Alert['type'], value: number) => void;
  onDeleteAlert: (id: string) => void;
  onResetAlert: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>🔔</span>
                Alert Management
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Create New Alert Form */}
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold mb-3">Create New Alert</h3>
              <AlertForm
                selectedStock={selectedStock}
                onCreateAlert={onCreateAlert}
                stocks={stocks}
              />
            </div>

            {/* Active Alerts List */}
            <div>
              <h3 className="text-white font-semibold mb-3">Active Alerts ({alerts.length})</h3>
              {alerts.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No alerts set. Create one above.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        alert.triggered
                          ? 'bg-green-900/20 border-green-500/30'
                          : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium">
                          {alert.symbol} - {alert.type.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-slate-400 text-sm">
                          Trigger: {alert.type.includes('price') ? `₹${alert.value}` : `${alert.value}%`}
                          {alert.triggered && <span className="ml-2 text-green-400">✓ Triggered</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {alert.triggered && (
                          <button
                            onClick={() => onResetAlert(alert.id)}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component: Alert Form
function AlertForm({
  selectedStock,
  onCreateAlert,
  stocks,
}: {
  selectedStock: string;
  onCreateAlert: (symbol: string, type: Alert['type'], value: number) => void;
  stocks: string[];
}) {
  const [symbol, setSymbol] = useState(selectedStock);
  const [type, setType] = useState<Alert['type']>('spread_above');
  const [value, setValue] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value > 0) {
      onCreateAlert(symbol, type, value);
      setValue(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Stock</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
          >
            {stocks.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">Alert Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Alert['type'])}
            className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
          >
            <option value="spread_above">Spread Above</option>
            <option value="spread_below">Spread Below</option>
            <option value="price_above">Price Above</option>
            <option value="price_below">Price Below</option>
          </select>
        </div>
        <div>
          <label className="text-slate-400 text-xs mb-1 block">
            Value {type.includes('price') ? '(₹)' : '(%)'}
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        Create Alert
      </button>
    </form>
  );
}

// Component: Position Simulator
function PositionSimulator({
  stock,
  onClose,
}: {
  stock: ArbitrageData;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(stock.lot_size);
  const [spotEntry, setSpotEntry] = useState(stock.spot_price);
  const [futuresEntry, setFuturesEntry] = useState(stock.futures_price);
  const [spotExit, setSpotExit] = useState(stock.spot_price * 1.01);
  const [futuresExit, setFuturesExit] = useState(stock.futures_price * 1.01);
  const [fees, setFees] = useState(0.05); // 0.05%

  const calculatePnL = () => {
    const spotPnL = (spotExit - spotEntry) * quantity;
    const futuresPnL = (futuresEntry - futuresExit) * quantity; // Short futures
    const grossPnL = spotPnL + futuresPnL;
    const totalFees = (spotEntry + futuresEntry + spotExit + futuresExit) * quantity * (fees / 100);
    const netPnL = grossPnL - totalFees;
    const margin = (spotEntry * quantity * 0.2) + (futuresEntry * quantity * 0.2); // 20% margin
    const roi = (netPnL / margin) * 100;

    return { spotPnL, futuresPnL, grossPnL, totalFees, netPnL, margin, roi };
  };

  const result = calculatePnL();

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>💹</span>
                Position Simulator - {stock.symbol}
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Form */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Trade Parameters</h3>
                
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Spot Entry</label>
                    <input
                      type="number"
                      step="0.01"
                      value={spotEntry}
                      onChange={(e) => setSpotEntry(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Futures Entry</label>
                    <input
                      type="number"
                      step="0.01"
                      value={futuresEntry}
                      onChange={(e) => setFuturesEntry(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Spot Exit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={spotExit}
                      onChange={(e) => setSpotExit(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm mb-1 block">Futures Exit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={futuresExit}
                      onChange={(e) => setFuturesExit(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Fees (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fees}
                    onChange={(e) => setFees(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold mb-3">Results</h3>
                
                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-slate-400 text-sm">Spot P&L</p>
                    <p className="text-xl font-bold text-blue-400">₹{result.spotPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-slate-400 text-sm">Futures P&L</p>
                    <p className="text-xl font-bold text-purple-400">₹{result.futuresPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-slate-400 text-sm">Gross P&L</p>
                    <p className="text-xl font-bold text-orange-400">₹{result.grossPnL.toFixed(2)}</p>
                  </div>

                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-slate-400 text-sm">Total Fees</p>
                    <p className="text-xl font-bold text-red-400">-₹{result.totalFees.toFixed(2)}</p>
                  </div>

                  <div className={`p-4 rounded-lg border ${
                    result.netPnL >= 0 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <p className="text-slate-400 text-sm mb-1">Net P&L</p>
                    <p className={`text-3xl font-bold ${result.netPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{result.netPnL.toFixed(2)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-slate-400 text-xs">Margin Required</p>
                      <p className="text-lg font-bold text-yellow-400">₹{result.margin.toFixed(0)}</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <p className="text-slate-400 text-xs">ROI</p>
                      <p className="text-lg font-bold text-emerald-400">{result.roi.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component: Backtest Modal
function BacktestModal({
  selectedStock,
  chartData,
  onClose,
  onRunBacktest,
  backtestResult,
  setBacktestResult,
}: {
  selectedStock: string;
  chartData: { [key: string]: ChartDataPoint[] };
  onClose: () => void;
  onRunBacktest: (
    symbol: string,
    startDate: Date,
    endDate: Date,
    buyThreshold: number,
    sellThreshold: number,
    capital: number
  ) => BacktestResult;
  backtestResult: BacktestResult | null;
  setBacktestResult: (result: BacktestResult | null) => void;
}) {
  const [symbol, setSymbol] = useState(selectedStock);
  const [buyThreshold, setBuyThreshold] = useState(0.5);
  const [sellThreshold, setSellThreshold] = useState(0.1);
  const [capital, setCapital] = useState(100000);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const handleRunBacktest = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = onRunBacktest(symbol, start, end, buyThreshold, sellThreshold, capital);
    setBacktestResult(result);
    toast.success("Backtest completed!");
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-5xl my-8" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📈</span>
                Historical Backtest & PnL Analytics
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
              >
                Close
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Backtest Parameters */}
            <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Backtest Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Stock</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  >
                    {Object.keys(chartData).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Buy Threshold (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={buyThreshold}
                    onChange={(e) => setBuyThreshold(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Sell Threshold (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sellThreshold}
                    onChange={(e) => setSellThreshold(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Initial Capital (₹)</label>
                  <input
                    type="number"
                    step="1000"
                    value={capital}
                    onChange={(e) => setCapital(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 text-white rounded-lg border border-slate-600 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleRunBacktest}
                className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Run Backtest
              </button>
            </div>

            {/* Backtest Results */}
            {backtestResult && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-slate-400 text-sm mb-1">Total Trades</p>
                    <p className="text-3xl font-bold text-blue-400">{backtestResult.totalTrades}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-slate-400 text-sm mb-1">Win Rate</p>
                    <p className="text-3xl font-bold text-green-400">{backtestResult.winRate.toFixed(1)}%</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${
                    backtestResult.totalPnL >= 0 
                      ? 'bg-emerald-500/10 border-emerald-500/20' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}>
                    <p className="text-slate-400 text-sm mb-1">Total P&L</p>
                    <p className={`text-3xl font-bold ${
                      backtestResult.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      ₹{backtestResult.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <p className="text-slate-400 text-sm mb-1">Max Drawdown</p>
                    <p className="text-3xl font-bold text-orange-400">{backtestResult.maxDrawdown.toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <p className="text-slate-400 text-sm mb-1">Sharpe Ratio</p>
                    <p className="text-3xl font-bold text-purple-400">{backtestResult.sharpeRatio.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-slate-400 text-sm mb-1">Profitable Trades</p>
                    <p className="text-3xl font-bold text-cyan-400">{backtestResult.profitableTrades}</p>
                  </div>
                </div>

                {/* Trade History */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Trade History</h3>
                  <div className="max-h-96 overflow-y-auto bg-slate-800/30 rounded-lg border border-slate-700">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-slate-800 border-b border-slate-700">
                        <tr>
                          <th className="p-3 text-left text-slate-400 font-medium">Time</th>
                          <th className="p-3 text-left text-slate-400 font-medium">Type</th>
                          <th className="p-3 text-right text-slate-400 font-medium">Spot</th>
                          <th className="p-3 text-right text-slate-400 font-medium">Futures</th>
                          <th className="p-3 text-right text-slate-400 font-medium">Spread</th>
                          <th className="p-3 text-right text-slate-400 font-medium">Qty</th>
                          <th className="p-3 text-right text-slate-400 font-medium">P&L</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backtestResult.trades.map((trade) => (
                          <tr key={trade.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                            <td className="p-3 text-slate-300">{new Date(trade.timestamp).toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-300">₹{trade.spotPrice.toFixed(2)}</td>
                            <td className="p-3 text-right text-slate-300">₹{trade.futuresPrice.toFixed(2)}</td>
                            <td className="p-3 text-right text-slate-300">{trade.spread.toFixed(2)}%</td>
                            <td className="p-3 text-right text-slate-400">{trade.quantity}</td>
                            <td className={`p-3 text-right font-semibold ${
                              trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ₹{trade.pnl.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {!backtestResult && (
              <div className="text-center py-12">
                <p className="text-slate-400">Configure parameters above and click "Run Backtest" to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
