"use client";

import { ArbitrageData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SummaryProps {
  currentData: { [key: string]: ArbitrageData };
  receivedStocks: string[];
}

export function Summary({ currentData, receivedStocks }: SummaryProps) {
  const totalOpportunities = receivedStocks.filter((s) => currentData[s]?.opportunity).length;
  const avgSpread =
    receivedStocks.length > 0
      ? receivedStocks.reduce((sum, s) => sum + (currentData[s]?.spread_percentage || 0), 0) / receivedStocks.length
      : 0;
  const totalPotentialProfit = receivedStocks.reduce(
    (sum, s) => sum + (currentData[s]?.opportunity ? currentData[s].gross_profit : 0),
    0
  );
  const bestOpportunity = receivedStocks.reduce((best, s) => {
    const data = currentData[s];
    if (!data?.opportunity) return best;
    if (!best || Math.abs(data.spread_percentage) > Math.abs(currentData[best]?.spread_percentage || 0)) {
      return s;
    }
    return best;
  }, "" as string);

  return (
    <div className="mb-6">
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Portfolio Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4 rounded-lg border border-green-500/20">
              <p className="text-slate-400 text-xs mb-1">Active Opportunities</p>
              <p className="text-3xl font-bold text-green-400">{totalOpportunities}</p>
              <p className="text-xs text-green-500/60 mt-1">of {receivedStocks.length} stocks</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4 rounded-lg border border-blue-500/20">
              <p className="text-slate-400 text-xs mb-1">Average Spread</p>
              <p className="text-3xl font-bold text-blue-400">{avgSpread.toFixed(2)}%</p>
              <p className="text-xs text-blue-500/60 mt-1">across portfolio</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/5 p-4 rounded-lg border border-orange-500/20">
              <p className="text-slate-400 text-xs mb-1">Potential Profit</p>
              <p className="text-3xl font-bold text-orange-400">₹{totalPotentialProfit.toFixed(0)}</p>
              <p className="text-xs text-orange-500/60 mt-1">gross estimate</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-4 rounded-lg border border-purple-500/20">
              <p className="text-slate-400 text-xs mb-1">Top Opportunity</p>
              <p className="text-3xl font-bold text-purple-400">{bestOpportunity || "None"}</p>
              <p className="text-xs text-purple-500/60 mt-1">highest spread</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
