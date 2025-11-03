"use client";

import { useState } from 'react';
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
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50 bg-gradient-to-r from-purple-900/30 to-pink-900/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">AI Trade Assistant</h2>
              <p className="text-sm text-slate-400">Powered by advanced ML algorithms • {stock.symbol}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleGenerateSignal}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">🔄</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  Generate Signal
                </>
              )}
            </button>
            <button
              onClick={handleAnalyzeMarket}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">🔄</span>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>📊</span>
                  Market Analysis
                </>
              )}
            </button>
          </div>

          {/* AI Trade Signal */}
          {signal && (
            <div className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-purple-500/30 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span>🎯</span>
                  AI Recommendation
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(signal.timestamp).toLocaleTimeString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border shadow-lg ${
                  signal.action === 'BUY' ? 'bg-gradient-to-br from-green-500/15 to-green-500/5 border-green-500/30' :
                  signal.action === 'SELL' ? 'bg-gradient-to-br from-red-500/15 to-red-500/5 border-red-500/30' :
                  'bg-gradient-to-br from-yellow-500/15 to-yellow-500/5 border-yellow-500/30'
                }`}>
                  <p className="text-slate-400 text-xs mb-2 font-medium uppercase tracking-wider">Action</p>
                  <p className={`text-3xl font-black ${
                    signal.action === 'BUY' ? 'text-green-400' :
                    signal.action === 'SELL' ? 'text-red-400' :
                    'text-yellow-400'
                  }`}>
                    {signal.action}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-500/15 to-blue-500/5 rounded-xl border border-blue-500/30 shadow-lg">
                  <p className="text-slate-400 text-xs mb-2 font-medium uppercase tracking-wider">Confidence</p>
                  <p className="text-3xl font-black text-blue-400">{signal.confidence}%</p>
                </div>

                <div className={`p-4 rounded-xl border shadow-lg ${
                  signal.riskLevel === 'LOW' ? 'bg-gradient-to-br from-green-500/15 to-green-500/5 border-green-500/30' :
                  signal.riskLevel === 'MEDIUM' ? 'bg-gradient-to-br from-yellow-500/15 to-yellow-500/5 border-yellow-500/30' :
                  'bg-gradient-to-br from-red-500/15 to-red-500/5 border-red-500/30'
                }`}>
                  <p className="text-slate-400 text-xs mb-2 font-medium uppercase tracking-wider">Risk Level</p>
                  <p className={`text-2xl font-black ${
                    signal.riskLevel === 'LOW' ? 'text-green-400' :
                    signal.riskLevel === 'MEDIUM' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {signal.riskLevel}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 rounded-xl border border-emerald-500/30 shadow-lg">
                  <p className="text-slate-400 text-xs mb-2 font-medium uppercase tracking-wider">Target Profit</p>
                  <p className="text-2xl font-black text-emerald-400">₹{signal.targetProfit.toFixed(0)}</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <p className="text-white font-bold text-sm flex items-center gap-2">
                  <span>💡</span>
                  Key Reasoning:
                </p>
                <ul className="space-y-2">
                  {signal.reasoning.map((reason, idx) => (
                    <li key={idx} className="text-slate-300 text-sm flex items-start gap-3">
                      <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>
                      <span className="leading-relaxed">{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Market Analysis */}
          {analysis && (
            <div className="p-5 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-cyan-500/30 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span>📈</span>
                  Market Analysis
                </h3>
                <span className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-lg ${
                  analysis.sentiment === 'BULLISH' ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/40' :
                  analysis.sentiment === 'BEARISH' ? 'bg-gradient-to-r from-red-500/20 to-red-500/20 text-red-400 border border-red-500/40' :
                  'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/40'
                }`}>
                  {analysis.sentiment}
                </span>
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              {analysis.keyFactors.length > 0 && (
                <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <p className="text-white font-bold text-sm flex items-center gap-2">
                    <span>🔍</span>
                    Key Factors:
                  </p>
                  <ul className="space-y-2">
                    {analysis.keyFactors.map((factor, idx) => (
                      <li key={idx} className="text-slate-300 text-sm flex items-start gap-3">
                        <span className="text-cyan-400 mt-0.5 flex-shrink-0">→</span>
                        <span className="leading-relaxed">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!signal && !analysis && !loading && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-4xl">🤖</span>
              </div>
              <p className="text-slate-300 font-semibold text-lg mb-2">AI Ready to Assist</p>
              <p className="text-slate-500 text-sm">Generate signals or analyze market trends using advanced AI</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
