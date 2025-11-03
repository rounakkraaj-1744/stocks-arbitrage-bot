export interface ArbitrageData {
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

export interface ChartDataPoint {
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

export interface AITradeSignal {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  targetProfit: number;
  timestamp: number;
}

export interface AIMarketAnalysis {
  summary: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  keyFactors: string[];
  timestamp: number;
}

export interface PortfolioOptimization {
  allocations: { symbol: string; amount: number; percentage: number }[];
  reasoning: string;
  expectedReturn: number;
}

export interface PredictionResult {
    timestamp: number;
    predictedSpread: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
}