export const ALL_STOCKS = [
  "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK",
  "SBIN", "BHARTIARTL", "ITC", "KOTAKBANK", "LT",
  "AXISBANK", "HINDUNILVR", "ASIANPAINT", "MARUTI", "BAJFINANCE"
];

export const MAX_DATA_POINTS = 200;

export const STORAGE_KEYS = {
  CHART_DATA: "nse_arbitrage_chart_data",
  CURRENT_DATA: "nse_arbitrage_current_data",
  SELECTED_STOCK: "nse_arbitrage_selected_stock",
  ALERTS: "nse_arbitrage_alerts",
  TIMEFRAME: "nse_arbitrage_timeframe",
  CHART_MODE: "nse_arbitrage_chart_mode",
  COMPARE_STOCKS: "nse_arbitrage_compare_stocks",
};

export const TIMEFRAME_INTERVALS = {
  '1m': 60000,
  '5m': 300000,
  '15m': 900000,
  '1h': 3600000,
};

export const WEBSOCKET_URL = "ws://localhost:3030/ws";
