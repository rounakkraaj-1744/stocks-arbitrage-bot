"use client";

import { useEffect, useState } from 'react';
import { ArbitrageData, ChartDataPoint } from '@/lib/types';
import { useLocalStorage, loadFromLocalStorage } from './useLocalStorage';
import { WEBSOCKET_URL, MAX_DATA_POINTS } from '@/lib/constants';

export function useWebSocket() {
  const [status, setStatus] = useState<string>("Connecting...");
  const [currentData, setCurrentData] = useState<{ [key: string]: ArbitrageData }>(() => loadFromLocalStorage('cab_currentData', {}));
  const [chartData, setChartData] = useState<{ [key: string]: ChartDataPoint[] }>(() => loadFromLocalStorage('cab_chartData', {}));

  useLocalStorage('cab_currentData', currentData);
  useLocalStorage('cab_chartData', chartData);

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
          const baseVolatility = 0.003 + (Math.random() * 0.005);
          const trend = (Math.random() - 0.5) * 2;
          const open = lastPoint?.close || parsed.spot_price;
          const priceChange = open * baseVolatility * trend;
          const close = open + priceChange;
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
