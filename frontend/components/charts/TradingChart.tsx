import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
import { type ChartDataPoint } from '@/lib/types';

interface TradingChartProps {
  data: ChartDataPoint[];
  symbol: string;
}

export function TradingChart({ data, symbol }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candleData = useMemo(() => {
    return data.map(d => {
      const open = d.spot * (1 - 0.001);
      const close = d.spot;
      const high = Math.max(open, close) * 1.002;
      const low = Math.min(open, close) * 0.998;
      
      return {
        time: (new Date(d.time).getTime() / 1000) as any,
        open,
        high,
        low,
        close,
      };
    }).sort((a, b) => (a.time as number) - (b.time as number));
  }, [data]);

  const volumeData = useMemo(() => {
    return data.map(d => {
      const isUp = Math.random() > 0.5;
      return {
        time: (new Date(d.time).getTime() / 1000) as any,
        value: Math.random() * 10000 + 5000,
        color: isUp ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
      };
    }).sort((a, b) => (a.time as number) - (b.time as number));
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current)
      return;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#111827' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    chart.timeScale().fitContent();

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(candleData);

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    volumeSeries.setData(volumeData);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candleData, volumeData]);

  return (
    <div className="flex-1 bg-[#111827] border border-[#1e293b] rounded-xl flex flex-col overflow-hidden">
      <div className="p-3 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium text-sm">{symbol} • 1h • NSE</span>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button className="hover:text-white transition-colors">1m</button>
            <button className="hover:text-white transition-colors">5m</button>
            <button className="hover:text-white transition-colors">15m</button>
            <button className="bg-[#1e293b] text-white px-2 py-0.5 rounded">1h</button>
            <button className="hover:text-white transition-colors">D</button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400 text-sm">
          <button className="hover:text-white transition-colors flex items-center gap-1">
            <span className="text-xs">ƒ(x)</span> Indicators
          </button>
        </div>
      </div>
      
      <div className="px-4 py-2 flex items-center gap-6 text-xs border-b border-[#1e293b]/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-slate-400">Spot (NSE)</span>
          <span className="text-blue-500 font-medium">{candleData[candleData.length - 1]?.close.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-slate-400">Futures (NSE)</span>
          <span className="text-orange-500 font-medium">{(candleData[candleData.length - 1]?.close * 1.01).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="flex-1 w-full" ref={chartContainerRef}></div>
    </div>
  );
}