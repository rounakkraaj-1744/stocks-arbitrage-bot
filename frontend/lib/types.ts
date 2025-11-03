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

export interface Alert {
  id: string;
  symbol: string;
  type: 'spread_above' | 'spread_below' | 'price_above' | 'price_below';
  value: number;
  triggered: boolean;
  createdAt: number;
}

export interface Trade {
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

export interface BacktestResult {
  totalTrades: number;
  profitableTrades: number;
  totalPnL: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  trades: Trade[];
}

export interface PredictionResult {
  timestamp: number;
  predictedSpread: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export interface BacktestMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  finalCapital: number;
  returnPercent: number;
  trades: Trade[];
}

export interface BacktestConfig {
  initialCapital: number;
  threshold: number;
  stopLoss?: number;
  takeProfit?: number;
  commission: number;
  slippage: number;
}

export interface ProfitPrediction {
  expectedProfit: number;
  confidence: number;
  bestCaseProfit: number;
  worstCaseProfit: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}


export type Timeframe = '1m' | '5m' | '15m' | '1h';
export type ChartMode = 'line' | 'candlestick';
