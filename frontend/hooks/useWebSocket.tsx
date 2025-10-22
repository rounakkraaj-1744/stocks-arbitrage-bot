"use client";

import { useEffect, useState } from 'react';
import { ArbitrageData, ChartDataPoint } from '@/lib/types';
import { WEBSOCKET_URL, MAX_DATA_POINTS } from '@/lib/constants';

export function useWebSocket() {
  const [status, setStatus] = useState<string>("Connecting...");
  const [currentData, setCurrentData] = useState<{ [key: string]: ArbitrageData }>({});
  const [chartData, setChartData] = useState<{ [key: string]: ChartDataPoint[] }>({});

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

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
          
          // Generate realistic OHLC data with proper volatility
          // Base volatility: 0.3% to 0.8% per candle
          const baseVolatility = 0.003 + (Math.random() * 0.005); // 0.3% - 0.8%
          const trend = (Math.random() - 0.5) * 2; // -1 to +1
          
          // Use last close as open, or current price if first candle
          const open = lastPoint?.close || parsed.spot_price;
          
          // Calculate close with trend
          const priceChange = open * baseVolatility * trend;
          const close = open + priceChange;
          
          // Generate realistic high and low
          // High and low should extend beyond open/close
          const upperWick = Math.abs(Math.random() * baseVolatility * open);
          const lowerWick = Math.abs(Math.random() * baseVolatility * open);
          
          const high = Math.max(open, close) + upperWick;
          const low = Math.min(open, close) - lowerWick;
          
          const newPoint: ChartDataPoint = {
            time: timeString,
            timestamp: timestamp,
            spot: parsed.spot_price,
            futures: parsed.futures_price,
            spread: parsed.spread_percentage,
            open: open,
            high: high,
            low: low,
            close: close,
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

  return { status, currentData, chartData, setChartData, setCurrentData };
}
