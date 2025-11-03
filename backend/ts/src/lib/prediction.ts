import { type ChartDataPoint, type PredictionResult } from './types';

export function predictWithSMA(data: ChartDataPoint[], periods: number = 5, futureSteps: number = 5): PredictionResult[] {
    if (data.length < periods) return [];

    const spreads = data.map(d => d.spread);
    const predictions: PredictionResult[] = [];

    const recentData = spreads.slice(-periods);
    const sma = recentData.reduce((a, b) => a + b, 0) / periods;

    const variance = recentData.reduce((sum, val) =>
        sum + Math.pow(val - sma, 2), 0) / periods;
    const stdDev = Math.sqrt(variance);

    const lastTimestamp = data[data.length - 1]!.timestamp;
    const timeStep = 60000;

    for (let i = 1; i <= futureSteps; i++) {
        predictions.push({
            timestamp: lastTimestamp + (i * timeStep),
            predictedSpread: sma,
            confidence: Math.max(0, 100 - (i * 15)),
            upperBound: sma + (stdDev * 1.96),
            lowerBound: sma - (stdDev * 1.96),
        });
    }

    return predictions;
}

export function predictWithEMA(data: ChartDataPoint[], alpha: number = 0.3, futureSteps: number = 5): PredictionResult[] {
    if (data.length < 2) return [];

    const spreads = data.map(d => d.spread);
    const predictions: PredictionResult[] = [];

    let ema = spreads[0];
    for (let i = 1; i < spreads.length; i++) {
        ema = (alpha * spreads[i]!) + ((1 - alpha) * ema);
    }

    const errors = spreads.map((val, idx) => {
        let emaAtIdx = spreads[0];
        for (let j = 1; j <= idx; j++) {
            emaAtIdx = (alpha * spreads[j]!) + ((1 - alpha) * emaAtIdx);
        }
        return val - emaAtIdx;
    });

    const variance = errors.reduce((sum, e) => sum + e * e, 0) / errors.length;
    const stdDev = Math.sqrt(variance);

    const lastTimestamp = data[data.length - 1]!.timestamp;
    const timeStep = 60000;

    for (let i = 1; i <= futureSteps; i++) {
        predictions.push({
            timestamp: lastTimestamp + (i * timeStep),
            predictedSpread: ema,
            confidence: Math.max(0, 100 - (i * 12)),
            upperBound: ema + (stdDev * 1.96 * Math.sqrt(i)),
            lowerBound: ema - (stdDev * 1.96 * Math.sqrt(i)),
        });
    }
    return predictions;
}

export function predictWithLinearRegression(data: ChartDataPoint[], futureSteps: number = 5): PredictionResult[] {
    if (data.length < 3)
        return [];

    const n = data.length;
    const x = data.map((_, i) => i);
    const y = data.map(d => d.spread);

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i]!, 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const residuals = y.map((yi, i) => yi - (slope * x[i]! + intercept));
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / n;
    const stdError = Math.sqrt(mse);

    const predictions: PredictionResult[] = [];
    const lastTimestamp = data[data.length - 1]!.timestamp;
    const timeStep = 60000;

    for (let i = 1; i <= futureSteps; i++) {
        const futureIndex = n + i - 1;
        const predicted = slope * futureIndex + intercept;
        const marginOfError = 1.96 * stdError * Math.sqrt(1 + 1 / n + Math.pow(futureIndex - sumX / n, 2) / sumX2);

        predictions.push({
            timestamp: lastTimestamp + (i * timeStep),
            predictedSpread: predicted,
            confidence: Math.max(0, 100 - (i * 10)),
            upperBound: predicted + marginOfError,
            lowerBound: predicted - marginOfError,
        });
    }
    return predictions;
}

export interface ProfitPrediction {
    expectedProfit: number;
    confidence: number;
    bestCaseProfit: number;
    worstCaseProfit: number;
    recommendation: 'BUY' | 'SELL' | 'HOLD';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function predictProfitLoss(currentPrice: number, predictions: PredictionResult[], quantity: number = 1, threshold: number = 0.5): ProfitPrediction {
    if (predictions.length === 0) {
        return {
            expectedProfit: 0,
            confidence: 0,
            bestCaseProfit: 0,
            worstCaseProfit: 0,
            recommendation: 'HOLD',
            riskLevel: 'HIGH',
        };
    }

    const avgSpread = predictions.reduce((sum, p) => sum + p.predictedSpread, 0) / predictions.length;
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;

    const bestSpread = Math.max(...predictions.map(p => p.upperBound));
    const worstSpread = Math.min(...predictions.map(p => p.lowerBound));

    const expectedProfit = (currentPrice * avgSpread / 100) * quantity;
    const bestCaseProfit = (currentPrice * bestSpread / 100) * quantity;
    const worstCaseProfit = (currentPrice * worstSpread / 100) * quantity;

    let recommendation: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    if (avgSpread > threshold)
        recommendation = 'BUY';
    else if (avgSpread < -threshold)
        recommendation = 'SELL';

    const spreadVolatility = Math.abs(bestSpread - worstSpread);
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (spreadVolatility > 2)
        riskLevel = 'HIGH';
    else if (spreadVolatility > 1)
        riskLevel = 'MEDIUM';

    return {
        expectedProfit,
        confidence: avgConfidence,
        bestCaseProfit,
        worstCaseProfit,
        recommendation,
        riskLevel,
    };
}