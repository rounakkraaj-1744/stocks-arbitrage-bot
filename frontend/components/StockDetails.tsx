"use client";

import { ArbitrageData } from '@/lib/types';
import { getTrendIcon, getTrendColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StockDetailsProps {
  data: ArbitrageData;
  onSetAlert: () => void;
}

export function StockDetails({ data, onSetAlert }: StockDetailsProps) {
  return (
    <div className="mb-8">
      <Card
        className={`${
          data.opportunity
            ? "border-green-500/50 bg-gradient-to-br from-green-950/40 to-emerald-950/20"
            : "border-slate-800 bg-slate-900/30"
        } backdrop-blur-sm`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center justify-between ${
              data.opportunity ? "text-green-400" : "text-slate-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{data.opportunity ? "🚀" : "⏳"}</span>
              <div>
                <div className="text-2xl">{data.symbol}</div>
                <div className="text-sm font-normal text-slate-400 mt-1">
                  {data.opportunity ? "Arbitrage Opportunity Detected" : "Monitoring..."}
                </div>
              </div>
            </div>
            <button
              onClick={onSetAlert}
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
              <p className="text-2xl font-bold text-blue-400">₹{data.spot_price.toFixed(2)}</p>
            </div>
            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
              <p className="text-slate-400 text-xs mb-2">Futures Price</p>
              <p className="text-2xl font-bold text-purple-400">₹{data.futures_price.toFixed(2)}</p>
            </div>
            <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
              <p className="text-slate-400 text-xs mb-2">Spread (₹)</p>
              <p className="text-2xl font-bold text-orange-400">₹{data.spread.toFixed(2)}</p>
            </div>
            <div
              className={`p-4 rounded-lg border ${
                data.spread_percentage > 0
                  ? "bg-green-500/10 border-green-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <p className="text-slate-400 text-xs mb-2">
                Spread %{" "}
                <span className={getTrendColor(data.spread_trend)}>
                  {getTrendIcon(data.spread_trend)}
                </span>
              </p>
              <p
                className={`text-2xl font-bold ${
                  data.spread_percentage > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {data.spread_percentage.toFixed(2)}%
              </p>
            </div>
            <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
              <p className="text-slate-400 text-xs mb-2">ROI</p>
              <p className="text-2xl font-bold text-emerald-400">{data.roi_percentage.toFixed(2)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pt-4 border-t border-slate-700/50">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Lot Size</p>
              <p className="text-xl font-semibold text-white">{data.lot_size} shares</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Gross Profit</p>
              <p className="text-xl font-semibold text-green-400">₹{data.gross_profit.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">Margin Required</p>
              <p className="text-xl font-semibold text-yellow-400">₹{data.margin_required.toFixed(0)}</p>
            </div>
          </div>

          {data.opportunity && (
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/20 p-4 rounded-lg border border-green-500/30">
              <p className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Recommended Action:
              </p>
              <p className="text-white text-lg font-medium mb-2">{data.action}</p>
              <p className="text-slate-300 text-sm">
                Expected profit per lot:{" "}
                <span className="text-green-400 font-semibold">₹{data.gross_profit.toFixed(2)}</span> (
                {data.roi_percentage.toFixed(2)}% return on margin)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
