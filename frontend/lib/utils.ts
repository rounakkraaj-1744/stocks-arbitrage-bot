import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChartDataPoint, Timeframe } from './types';
import { TIMEFRAME_INTERVALS } from './constants';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function aggregateData(data: ChartDataPoint[], interval: Timeframe): ChartDataPoint[] {
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
}

function aggregateBucket(bucket: ChartDataPoint[]): ChartDataPoint {
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
}

export function getTrendIcon(trend: string): string {
  if (trend === "rising") return "▲";
  if (trend === "falling") return "▼";
  return "─";
}

export function getTrendColor(trend: string): string {
  if (trend === "rising") return "text-green-400";
  if (trend === "falling") return "text-red-400";
  return "text-yellow-400";
}

export function formatCurrency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
