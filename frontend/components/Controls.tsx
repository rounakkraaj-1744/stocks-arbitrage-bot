"use client";

import { Timeframe, ChartMode } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import toast from 'react-hot-toast';

interface ControlsProps {
  timeframe: Timeframe;
  setTimeframe: (tf: Timeframe) => void;
  chartMode: ChartMode;
  setChartMode: (mode: ChartMode) => void;
  threshold: number;
  setThreshold: (val: number) => void;
  compareStocks: string[];
  setCompareStocks: (stocks: string[]) => void;
}

export function Controls({
  timeframe,
  setTimeframe,
  chartMode,
  setChartMode,
  threshold,
  setThreshold,
  compareStocks,
  setCompareStocks,
}: ControlsProps) {
  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setThreshold(value);
    } else if (e.target.value === "") {
      setThreshold(0);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-sm">Timeframe:</label>
            <div className="flex gap-2">
              {(['1m', '5m', '15m', '1h'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    timeframe === tf
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-sm">Chart Mode:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setChartMode('line')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  chartMode === 'line'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                📈 Line
              </button>
              <button
                onClick={() => setChartMode('candlestick')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  chartMode === 'candlestick'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                🕯️ Candle
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-sm">Threshold: {threshold}%</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={threshold || ""}
                onChange={handleThresholdChange}
                className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-sm"
              />
              <button
                onClick={() => setThreshold(0.5)}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-2">
            <label className="text-white font-semibold text-sm">Compare Mode:</label>
            <button
              onClick={() => {
                if (compareStocks.length > 0) {
                  setCompareStocks([]);
                  toast.success("Compare mode disabled");
                } else {
                  toast("Click stocks below to compare (max 3)", {
                    icon: "ℹ️",
                    style: {
                      background: '#1e293b',
                      color: '#fff',
                      border: '1px solid #3b82f6',
                    },
                  });
                }
              }}
              className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                compareStocks.length > 0
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {compareStocks.length > 0 ? `Comparing ${compareStocks.length} stocks` : 'Enable Compare'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
