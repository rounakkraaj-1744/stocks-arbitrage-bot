"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <Card className="bg-slate-900/95 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <span>🔮</span>
              Future Spread Prediction - {stock.symbol}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Prediction Method
                </label>
                <select
                  value={predictionMethod}
                  onChange={(e) => setPredictionMethod(e.target.value as any)}
                  className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                >
                  <option value="SMA">Simple Moving Average</option>
                  <option value="EMA">Exponential Moving Average</option>
                  <option value="LINEAR">Linear Regression</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Future Steps (minutes)
                </label>
                <input
                  type="number"
                  value={futureSteps}
                  onChange={(e) => setFutureSteps(Number(e.target.value))}
                  min={1}
                  max={30}
                  className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm font-medium block mb-2">
                  Quantity (Lots)
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-4 py-2 bg-slate-800 text-white border border-slate-600 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>
            </div>

            <button onClick={handleGeneratePrediction}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
            >
              🔮 Generate Prediction
            </button>

            {predictions && predictions.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-orange-400 text-lg">
                    📈 Predicted Spread with Confidence Intervals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PredictionChart
                    historicalData={historicalData}
                    predictions={predictions}
                    height={400}
                  />
                </CardContent>
              </Card>
            )}

            {profitPrediction && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg">
                    💰 Profit/Loss Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">Expected Profit</p>
                      <p className="text-2xl font-bold text-blue-400">
                        ₹{profitPrediction.expectedProfit.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Confidence: {profitPrediction.confidence.toFixed(0)}%
                      </p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">Best Case</p>
                      <p className="text-2xl font-bold text-green-400">
                        ₹{profitPrediction.bestCaseProfit.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Upper Bound (95%)</p>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-lg">
                      <p className="text-slate-400 text-sm mb-1">Worst Case</p>
                      <p className="text-2xl font-bold text-red-400">
                        ₹{profitPrediction.worstCaseProfit.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">Lower Bound (95%)</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-2">AI Recommendation</p>
                        <div className="flex items-center gap-4">
                          <span className={`text-3xl font-bold ${
                            profitPrediction.recommendation === 'BUY' ? 'text-green-400' :
                            profitPrediction.recommendation === 'SELL' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>
                            {profitPrediction.recommendation}
                          </span>
                          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                            profitPrediction.riskLevel === 'LOW' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            profitPrediction.riskLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {profitPrediction.riskLevel} RISK
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-400 text-sm mb-1">Current Price</p>
                        <p className="text-xl font-bold text-white">₹{stock.spot_price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center text-sm text-slate-500">
              Using {historicalData.length} historical data points • Predicting {futureSteps} minutes ahead
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
            >
              Close
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}