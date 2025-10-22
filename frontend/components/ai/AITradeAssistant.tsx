"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArbitrageData, ChartDataPoint } from '@/lib/types';
import { generateTradeSignal, analyzeMarket, AITradeSignal, AIMarketAnalysis } from '@/lib/ai-client';
import toast from 'react-hot-toast';

interface AITradeAssistantProps {
  stock: ArbitrageData;
  historicalData: ChartDataPoint[];
}

export function AITradeAssistant({ stock, historicalData }: AITradeAssistantProps) {
  const [signal, setSignal] = useState<AITradeSignal | null>(null);
  const [analysis, setAnalysis] = useState<AIMarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateSignal = async () => {
    setLoading(true);
    try {
      const result = await generateTradeSignal(stock, historicalData);
      setSignal(result);
      toast.success('AI signal generated!');
    } catch (error) {
      toast.error('Failed to generate AI signal');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMarket = async () => {
    setLoading(true);
    try {
      const result = await analyzeMarket(stock, historicalData);
      setAnalysis(result);
      toast.success('Market analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze market');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/10 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-400 text-lg flex items-center gap-2">
            <span>🤖</span>
            AI Trade Assistant - {stock.symbol}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <button
              onClick={handleGenerateSignal}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Analyzing...' : '⚡ Generate Signal'}
            </button>
            <button
              onClick={handleAnalyzeMarket}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '🔄 Analyzing...' : '📊 Market Analysis'}
            </button>
          </div>

          {/* AI Trade Signal */}
          {signal && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span>🎯</span>
                  AI Recommendation
                </h3>
                <span className="text-xs text-slate-400">
                  {new Date(signal.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg border ${
                  signal.action === 'BUY' ? 'bg-green-500/10 border-green-500/30' :
                  signal.action === 'SELL' ? 'bg-red-500/10 border-red-500/30' :
                  'bg-yellow-500/10 border-yellow-500/30'
                }`}>
                  <p className="text-slate-400 text-xs mb-1">Action</p>
                  <p className={`text-2xl font-bold ${
                    signal.action === 'BUY' ? 'text-green-400' :
                    signal.action === 'SELL' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {signal.action}
                  </p>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-slate-400 text-xs mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-blue-400">{signal.confidence}%</p>
                </div>

                <div className={`p-3 rounded-lg border ${
                  signal.riskLevel === 'LOW' ? 'bg-green-500/10 border-green-500/30' :
                  signal.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-red-500/10 border-red-500/30'
                }`}>
                  <p className="text-slate-400 text-xs mb-1">Risk Level</p>
                  <p className={`text-xl font-bold ${
                    signal.riskLevel === 'LOW' ? 'text-green-400' :
                    signal.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {signal.riskLevel}
                  </p>
                </div>

                <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <p className="text-slate-400 text-xs mb-1">Target Profit</p>
                  <p className="text-xl font-bold text-emerald-400">₹{signal.targetProfit.toFixed(0)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-white font-semibold text-sm">Key Reasoning:</p>
                <ul className="space-y-1">
                  {signal.reasoning.map((reason, idx) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                      <span className="text-purple-400">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Market Analysis */}
          {analysis && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <span>📈</span>
                  Market Analysis
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  analysis.sentiment === 'BULLISH' ? 'bg-green-500/20 text-green-400' :
                  analysis.sentiment === 'BEARISH' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {analysis.sentiment}
                </span>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>

              {analysis.keyFactors.length > 0 && (
                <div>
                  <p className="text-white font-semibold text-sm mb-2">Key Factors:</p>
                  <ul className="space-y-1">
                    {analysis.keyFactors.map((factor, idx) => (
                      <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
