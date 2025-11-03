"use client";

import dynamic from 'next/dynamic';
import { useMemo, useRef } from 'react';
import type { ApexOptions } from 'apexcharts';
import { ChartDataPoint, ChartMode } from '@/lib/types';

const ApexCharts = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PriceChartProps {
  data: ChartDataPoint[];
  chartMode: ChartMode;
  compareStocks?: { name: string; data: ChartDataPoint[] }[];
  height?: number;
}

export function PriceChart({ data, chartMode, compareStocks, height = 400 }: PriceChartProps) {
  const chartRef = useRef<any>(null);

  const lineChartSeries = useMemo(() => {
    if (compareStocks && compareStocks.length > 0) {
      return compareStocks.map((stock) => ({
        name: `${stock.name} Spread`,
        data: stock.data
          .filter(point => {
            return point.timestamp && 
                   typeof point.spread === 'number' && 
                   !isNaN(point.spread) &&
                   isFinite(point.spread);
          })
          .map((point) => ({
            x: point.timestamp,
            y: point.spread,
          })),
      }));
    }

    return [
      {
        name: "Spot Price",
        data: data
          .filter(point => {
            return point.timestamp && 
                   typeof point.spot === 'number' && 
                   !isNaN(point.spot) &&
                   isFinite(point.spot);
          })
          .map((point) => ({
            x: point.timestamp,
            y: point.spot,
          })),
      },
      {
        name: "Futures Price",
        data: data
          .filter(point => {
            return point.timestamp && 
                   typeof point.futures === 'number' && 
                   !isNaN(point.futures) &&
                   isFinite(point.futures);
          })
          .map((point) => ({
            x: point.timestamp,
            y: point.futures,
          })),
      },
    ];
  }, [data, compareStocks]);

  const candlestickSeries = useMemo(() => {
    if (chartMode !== 'candlestick') return null;
    
    const validData = data
      .filter(point => {
        return point.timestamp &&
               point.open != null && 
               point.high != null && 
               point.low != null && 
               point.close != null &&
               !isNaN(point.open) &&
               !isNaN(point.high) &&
               !isNaN(point.low) &&
               !isNaN(point.close) &&
               isFinite(point.open) &&
               isFinite(point.high) &&
               isFinite(point.low) &&
               isFinite(point.close);
      })
      .map((point) => {
        const open = point.open!;
        const high = point.high!;
        const low = point.low!;
        const close = point.close!;
        
        const actualHigh = Math.max(open, high, low, close);
        const actualLow = Math.min(open, high, low, close);
        
        return {
          x: point.timestamp,
          y: [open, actualHigh, actualLow, close],
        };
      });
    
    return [{
      name: 'Price',
      type: 'candlestick',
      data: validData,
    }];
  }, [data, chartMode]);

  const candlestickOptions: ApexOptions = {
    chart: {
      type: "candlestick",
      height: height,
      zoom: { 
        enabled: true,
        type: 'x',
        autoScaleYaxis: false, // ✅ Prevent auto-zoom-out
      },
      toolbar: { 
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      background: "transparent",
      animations: {
        enabled: false, // ✅ Disable animations to prevent jittery zoom
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: { 
          colors: "#64748b",
          fontSize: '11px',
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm',
          minute: 'HH:mm',
        },
      },
      axisBorder: {
        show: true,
        color: '#334155',
      },
      axisTicks: {
        show: true,
        color: '#334155',
      },
    },
    yaxis: {
      title: { 
        text: "Price (₹)", 
        style: { 
          color: "#64748b",
          fontSize: '12px',
          fontWeight: 600,
        } 
      },
      labels: {
        style: { 
          colors: ["#64748b"],
          fontSize: '11px',
        },
        formatter: (val) => {
          if (val == null || isNaN(val) || !isFinite(val)) return 'N/A';
          return `₹${val.toFixed(2)}`;
        },
      },
      tooltip: { 
        enabled: true 
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#16a34a',
          downward: '#dc2626',
        },
        wick: {
          useFillColor: true,
        },
      },
    },
    grid: { 
      show: true,
      borderColor: "#1e293b",
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10,
      },
    },
    tooltip: {
      theme: "dark",
      enabled: true,
      shared: false,
      custom: function({ seriesIndex, dataPointIndex, w }) {
        try {
          const series = w.globals.initialSeries?.[seriesIndex];
          if (!series || !series.data) return '<div class="p-2 bg-slate-900">No data</div>';
          
          const dataPoint = series.data[dataPointIndex];
          if (!dataPoint || !dataPoint.y || !Array.isArray(dataPoint.y) || dataPoint.y.length < 4) {
            return '<div class="p-2 bg-slate-900">No data</div>';
          }
          
          const [o, h, l, c] = dataPoint.y;
          const change = c - o;
          const changePercent = ((change / o) * 100);
          const isPositive = change >= 0;
          
          return `
            <div class="p-4 bg-slate-900 border border-slate-700 rounded-lg shadow-xl min-w-[200px]">
              <div class="text-white font-bold mb-3 text-base border-b border-slate-700 pb-2">
                ${new Date(dataPoint.x).toLocaleString()}
              </div>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-slate-400 text-sm">Open:</span>
                  <span class="text-blue-400 font-semibold">₹${o?.toFixed(2) || 'N/A'}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-400 text-sm">High:</span>
                  <span class="text-emerald-400 font-semibold">₹${h?.toFixed(2) || 'N/A'}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-slate-400 text-sm">Low:</span>
                  <span class="text-red-400 font-semibold">₹${l?.toFixed(2) || 'N/A'}</span>
                </div>
                <div class="flex justify-between items-center border-t border-slate-700 pt-2">
                  <span class="text-slate-400 text-sm">Close:</span>
                  <span class="text-orange-400 font-bold text-base">₹${c?.toFixed(2) || 'N/A'}</span>
                </div>
                <div class="flex justify-between items-center mt-3 p-2 rounded ${
                  isPositive ? 'bg-green-900/20' : 'bg-red-900/20'
                }">
                  <span class="text-slate-400 text-sm">Change:</span>
                  <span class="${isPositive ? 'text-green-400' : 'text-red-400'} font-bold">
                    ${isPositive ? '+' : ''}₹${change.toFixed(2)} (${isPositive ? '+' : ''}${changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          `;
        } catch (error) {
          console.error('Tooltip error:', error);
          return '<div class="p-2 bg-slate-900">Error loading data</div>';
        }
      },
    },
  };

  const lineChartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: height,
      zoom: { 
        enabled: true, 
        type: "x",
        autoScaleYaxis: false,
      },
      toolbar: { 
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      background: "transparent",
      animations: {
        enabled: false,
      },
    },
    stroke: { 
      width: 2, 
      curve: "smooth" 
    },
    colors: compareStocks && compareStocks.length > 0 
      ? ["#60a5fa", "#a78bfa", "#fb923c"] 
      : ["#60a5fa", "#a78bfa"],
    dataLabels: { 
      enabled: false 
    },
    markers: { 
      size: 0,
      strokeWidth: 0,
      hover: { 
        sizeOffset: 6 
      } 
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      theme: "dark",
      x: {
        show: true,
        format: 'dd MMM HH:mm',
      },
      y: {
        formatter: (val) => {
          if (val == null || isNaN(val) || !isFinite(val)) return "N/A";
          return compareStocks && compareStocks.length > 0 ? `${val.toFixed(2)}%` : `₹${val.toFixed(2)}`;
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: { 
          colors: "#64748b", 
          fontSize: "11px" 
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm',
          minute: 'HH:mm',
        },
      },
      axisBorder: { 
        show: true, 
        color: "#334155" 
      },
      axisTicks: { 
        show: true, 
        color: "#334155" 
      },
    },
    yaxis: {
      title: { 
        text: compareStocks && compareStocks.length > 0 ? "Spread %" : "Price (₹)", 
        style: { color: "#64748b" } 
      },
      labels: {
        style: { colors: ["#64748b"] },
        formatter: (val) => {
          if (val == null || isNaN(val) || !isFinite(val)) return "N/A";
          return compareStocks && compareStocks.length > 0 ? `${val.toFixed(2)}%` : `₹${val.toFixed(2)}`;
        },
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: 'center',
      labels: { colors: "#64748b" },
      markers: {
        size: 12,
        strokeWidth: 0,
      },
    },
    grid: {
      borderColor: "#334155",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
  };

  const hasValidLineData = lineChartSeries.some(series => series.data.length > 0);
  const hasValidCandlestickData = candlestickSeries && candlestickSeries[0].data.length > 0;

  if (chartMode === 'candlestick' && (!compareStocks || compareStocks.length === 0)) {
    if (!hasValidCandlestickData) {
      return (
        <div className="flex items-center justify-center h-[400px] text-slate-400">
          <div className="text-center">
            <div className="text-6xl mb-4">🕯️</div>
            <p className="text-lg">Waiting for candlestick data...</p>
            <p className="text-sm text-slate-500 mt-2">OHLC data will appear as market updates arrive</p>
          </div>
        </div>
      );
    }
    
    return (
      <ApexCharts 
        options={candlestickOptions} 
        series={candlestickSeries} 
        type="candlestick" 
        height={height} 
      />
    );
  }

  if (!hasValidLineData) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-400">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg">Waiting for price data...</p>
          <p className="text-sm text-slate-500 mt-2">Charts will appear as market updates arrive</p>
        </div>
      </div>
    );
  }

  return (
    <ApexCharts
      options={lineChartOptions} 
      series={lineChartSeries} 
      type="line" 
      height={height} 
    />
  );
}
