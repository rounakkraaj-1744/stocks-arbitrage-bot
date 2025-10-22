"use client";

import { ArbitrageData } from '@/lib/types';
import { getTrendIcon, getTrendColor } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StocksTableProps {
  stocks: string[];
  currentData: { [key: string]: ArbitrageData };
  onSelectStock: (stock: string) => void;
}

export function StocksTable({ stocks, currentData, onSelectStock }: StocksTableProps) {
  const receivedStocks = Object.keys(currentData).length;
  
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <span>📋</span>
          All Stocks Overview ({receivedStocks}/{stocks.length} loaded)
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
                      onClick={() => onSelectStock(stock)}
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
                    onClick={() => onSelectStock(stock)}
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
  );
}
