"use client";

import { useState } from 'react';
import { ArbitrageData, ChartDataPoint, PredictionResult, ProfitPrediction } from '@/lib/types';
import { predictWithSMA, 
  predictWithEMA, 
  predictWithLinearRegression,
  predictProfitLoss 
} from '@/lib/prediction';
import toast from 'react-hot-toast';
import { PredictionChart } from '../charts/PredictionChart';

interface PredictionModalProps {
  stock: ArbitrageData;
  historicalData: ChartDataPoint[];
  onClose: () => void;
}

export function PredictionModal({ stock, historicalData, onClose }: PredictionModalProps) {
  const [predictionMethod, setPredictionMethod] = useState<'SMA' | 'EMA' | 'LINEAR'>('EMA');
  const [futureSteps, setFutureSteps] = useState(5);
  const [quantity, setQuantity] = useState(1);
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
  const [profitPrediction, setProfitPrediction] = useState<ProfitPrediction | null>(null);

  const handleGeneratePrediction = () => {
    if (historicalData.length < 5) {
      toast.error('Not enough historical data for prediction');
      return;
    }

    let result: PredictionResult[] = [];

    switch (predictionMethod) {
      case 'SMA':
        result = predictWithSMA(historicalData, 5, futureSteps);
        break;
      case 'EMA':
        result = predictWithEMA(historicalData, 0.3, futureSteps);
        break;
      case 'LINEAR':
        result = predictWithLinearRegression(historicalData, futureSteps);
        break;
    }

    setPredictions(result);

    if (result.length > 0) {
      const profitResult = predictProfitLoss(stock.spot_price, result, quantity, 0.5);
      setProfitPrediction(profitResult);
      toast.success('Prediction generated successfully!');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-xl overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-7xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                <span className="text-2xl">🔮</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Spread Prediction</h2>
                <p className="text-sm text-slate-400">Future forecast for {stock.symbol}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            
            {/* Configuration */}
            <div className="mb-6 p-5 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
                <h3 className="text-white font-bold text-lg">Prediction Configuration</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    <span className="flex items-center gap-2">
                      <span>🎯</span> Prediction Algorithm
                    </span>
                  </label>
                  <select
                    value={predictionMethod}
                    onChange={(e) => setPredictionMethod(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white border border-slate-600/50 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all font-medium"
                  >
                    <option value="SMA">Simple Moving Average</option>
                    <option value="EMA">Exponential Moving Average (Recommended)</option>
                    <option value="LINEAR">Linear Regression</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {predictionMethod === 'EMA' && 'Weights recent data more heavily'}
                    {predictionMethod === 'SMA' && 'Equal weight to all data points'}
                    {predictionMethod === 'LINEAR' && 'Fits trend line to data'}
                  </p>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    <span className="flex items-center gap-2">
                      <span>⏰</span> Forecast Horizon
                    </span>
                  </label>
                  <input
                    type="number"
                    value={futureSteps}
                    onChange={(e) => setFutureSteps(Number(e.target.value))}
                    min={1}
                    max={30}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white border border-slate-600/50 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-1">{futureSteps} minute{futureSteps > 1 ? 's' : ''} ahead</p>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium block mb-2">
                    <span className="flex items-center gap-2">
                      <span>📦</span> Trading Quantity
                    </span>
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full px-4 py-2.5 bg-slate-900/80 text-white border border-slate-600/50 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all font-medium"
                  />
                  <p className="text-xs text-slate-500 mt-1">Lot size: {stock.lot_size}</p>
                </div>
              </div>

              <button 
                onClick={handleGeneratePrediction}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2"
              >
                <span className="text-lg">🔮</span>
                Generate AI Prediction
              </button>
            </div>

            {/* Prediction Chart */}
            {predictions && predictions.length > 0 && (
              <div className="mb-6 bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden shadow-lg">
                <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                      <span className="text-lg">📈</span>
                    </div>
                    <h3 className="text-white font-bold text-lg">Predicted Spread with Confidence Intervals</h3>
                  </div>
                </div>
                <div className="p-6">
                  <PredictionChart
                    historicalData={historicalData}
                    predictions={predictions}
                    height={400}
                  />
                </div>
              </div>
            )}

            {/* Profit/Loss Forecast */}
            {profitPrediction && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                        <span className="text-lg">💰</span>
                      </div>
                      <h3 className="text-white font-bold text-lg">Profit/Loss Forecast</h3>
                      <span className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 rounded-full text-xs text-slate-300 font-semibold">
                        {profitPrediction.confidence.toFixed(0)}% Confidence
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      
                      <div className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-400 text-sm font-medium">Expected Profit</p>
                          <span className="text-xl">💵</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-400">
                          ₹{profitPrediction.expectedProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Most likely outcome
                        </p>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-400 text-sm font-medium">Best Case</p>
                          <span className="text-xl">🚀</span>
                        </div>
                        <p className="text-3xl font-bold text-green-400">
                          +₹{profitPrediction.bestCaseProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Upper bound (95% CI)
                        </p>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-slate-400 text-sm font-medium">Worst Case</p>
                          <span className="text-xl">⚠️</span>
                        </div>
                        <p className="text-3xl font-bold text-red-400">
                          ₹{profitPrediction.worstCaseProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Lower bound (95% CI)
                        </p>
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div className="p-5 bg-gradient-to-br from-slate-900/80 to-slate-900/50 rounded-xl border border-slate-700/50 shadow-inner">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-slate-400 text-sm mb-2 font-medium">AI Recommendation</p>
                            <div className="flex items-center gap-3">
                              <span className={`text-4xl font-black ${
                                profitPrediction.recommendation === 'BUY' ? 'text-green-400' :
                                profitPrediction.recommendation === 'SELL' ? 'text-red-400' :
                                'text-yellow-400'
                              }`}>
                                {profitPrediction.recommendation}
                              </span>
                              <div>
                                <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${
                                  profitPrediction.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400 border border-green-500/40' :
                                  profitPrediction.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' :
                                  'bg-red-500/20 text-red-400 border border-red-500/40'
                                }`}>
                                  {profitPrediction.riskLevel} RISK
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-sm mb-1 font-medium">Current Spot Price</p>
                          <p className="text-2xl font-bold text-white">₹{stock.spot_price.toFixed(2)}</p>
                          <p className="text-xs text-slate-500 mt-1">Live market price</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <span>
                        <span className="text-slate-500">Data Points:</span> 
                        <span className="ml-1 text-blue-400 font-semibold">{historicalData.length}</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>
                        <span className="text-slate-500">Forecast:</span> 
                        <span className="ml-1 text-purple-400 font-semibold">{futureSteps} min ahead</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span>
                        <span className="text-slate-500">Method:</span> 
                        <span className="ml-1 text-orange-400 font-semibold">{predictionMethod}</span>
                      </span>
                    </div>
                    <span className="text-slate-500 italic">
                      Predictions are estimates and not guaranteed
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!predictions && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                  <span className="text-4xl">🔮</span>
                </div>
                <p className="text-slate-300 font-semibold text-lg mb-2">Ready to Predict</p>
                <p className="text-slate-500 text-sm">Configure parameters above and generate your forecast</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
