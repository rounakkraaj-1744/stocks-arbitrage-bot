"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface SentimentDashboardProps {
  onClose: () => void;
  selectedStock?: string;
  historicalSpreads?: number[];
}

export function SentimentDashboard({ onClose, selectedStock = "RELIANCE", historicalSpreads = [] }: SentimentDashboardProps) {
  const [sentiment, setSentiment] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedStock, historicalSpreads]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [sentimentRes, mlRes] = await Promise.all([
        fetch(`http://127.0.0.1:8080/api/ai/sentiment?symbol=${selectedStock}`),
        fetch(`http://127.0.0.1:8080/api/ai/ml-prediction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ spreads: historicalSpreads })
        })
      ]);
      const sentimentData = await sentimentRes.json();
      const mlData = await mlRes.json();

      if (sentimentData.success) setSentiment(sentimentData.data);
      if (mlData.success) setPrediction(mlData.data);
    } catch (error) {
      toast.error("Failed to load advanced analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentColor = (label: string) => {
    if (label === 'Bullish') return 'text-green-400 bg-green-500/20';
    if (label === 'Bearish') return 'text-red-400 bg-red-500/20';
    return 'text-slate-400 bg-slate-500/20';
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'Widening') return 'text-blue-400';
    if (trend === 'Narrowing') return 'text-purple-400';
    return 'text-slate-400';
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl" onClick={onClose}>
      <div className="w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <h2 className="text-xl font-bold text-white">Advanced Analytics & ML - {selectedStock}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-slate-800 rounded-xl"></div>
              <div className="h-32 bg-slate-800 rounded-xl"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sentiment Card */}
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>📰</span> Market Sentiment
                </h3>
                {sentiment ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Current Outlook</span>
                      <span className={`px-3 py-1 rounded-full font-bold text-sm ${getSentimentColor(sentiment.label)}`}>
                        {sentiment.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Confidence Score</span>
                      <span className="text-white font-bold">{sentiment.score.toFixed(2)}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-sm text-slate-300 italic">"{sentiment.summary}"</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Sentiment unavailable.</p>
                )}
              </div>

              {/* ML Predictor Card */}
              <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>🤖</span> ML Spread Predictor
                </h3>
                {prediction ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Forecasted Spread</span>
                      <span className="text-xl font-bold text-white">
                        {prediction.prediction.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Expected Trend</span>
                      <span className={`font-bold ${getTrendColor(prediction.trend)}`}>
                        {prediction.trend}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-sm text-slate-400">
                        Model: Simple Linear Regression
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Trained on {historicalSpreads.length} recent data points.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500">Not enough data to run ML predictor.</p>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
