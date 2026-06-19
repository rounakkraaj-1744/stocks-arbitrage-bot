import { type ChartDataPoint, type Trade } from './types';

export interface BacktestConfig {
    initialCapital: number;
    commission: number;
    slippage: number;
    strategy: 'spread_threshold' | 'mean_reversion' | 'momentum' | 'custom';

    spreadThreshold?: number;
    meanReversionPeriod?: number;
    momentumPeriod?: number;
    stopLoss?: number;
    takeProfit?: number;

    enableMonteCarlo?: boolean;
    monteCarloRuns?: number;
    enableWalkForward?: boolean;
    walkForwardPeriods?: number;
}

export interface EnhancedBacktestResult {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;

    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    sortinoRatio: number;
    calmarRatio: number;

    maxDrawdown: number;
    maxDrawdownPercent: number;
    averageDrawdown: number;
    maxConsecutiveWins: number;
    maxConsecutiveLosses: number;

    // Trade analysis
    averageWin: number;
    averageLoss: number;
    largestWin: number;
    largestLoss: number;
    expectancy: number;

    equityCurve: EquityPoint[];
    drawdownCurve: DrawdownPoint[];
    trades: Trade[];

    tradeDistribution: TradeDistribution;
    winStreakDistribution: number[];
    lossStreakDistribution: number[];
    monteCarloResults?: MonteCarloResult[];
    walkForwardResults?: WalkForwardResult[];
    optimizationResults?: OptimizationResult[];
}

export interface EquityPoint {
    timestamp: number;
    equity: number;
    drawdown: number;
}

export interface DrawdownPoint {
    timestamp: number;
    drawdown: number;
    drawdownPercent: number;
}

export interface TradeDistribution {
    bins: number[];
    frequencies: number[];
}

export interface MonteCarloResult {
    run: number;
    finalEquity: number;
    maxDrawdown: number;
    sharpeRatio: number;
}

export interface WalkForwardResult {
    period: number;
    startDate: number;
    endDate: number;
    netProfit: number;
    winRate: number;
    sharpeRatio: number;
    optimalParams: any;
}

export interface OptimizationResult {
    params: any;
    netProfit: number;
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    score: number;
}

export class EnhancedBacktestEngine {
    private config: BacktestConfig;
    private data: ChartDataPoint[];

    constructor(data: ChartDataPoint[], config: BacktestConfig) {
        this.data = data;
        this.config = config;
    }

    run(): EnhancedBacktestResult {
        const trades = this.executeTrades();
        const equityCurve = this.calculateEquityCurve(trades);
        const drawdownCurve = this.calculateDrawdownCurve(equityCurve);
        const tradeDistribution = this.calculateTradeDistribution(trades);
        const { winStreaks, lossStreaks } = this.calculateStreaks(trades);

        const result: EnhancedBacktestResult = {
            ...this.calculateMetrics(trades, equityCurve, drawdownCurve),
            equityCurve,
            drawdownCurve,
            trades,
            tradeDistribution,
            winStreakDistribution: winStreaks,
            lossStreakDistribution: lossStreaks,
        };

        if (this.config.enableMonteCarlo) {
            result.monteCarloResults = this.runMonteCarlo(trades);
        }

        if (this.config.enableWalkForward) {
            result.walkForwardResults = this.runWalkForward();
        }

        return result;
    }

    private executeTrades(): Trade[] {
        const trades: Trade[] = [];
        let position: 'long' | 'short' | null = null;
        let entryPrice = 0;
        let entryTime = 0;

        for (let i = 1; i < this.data.length; i++) {
            const current = this.data[i];
            const previous = this.data[i - 1];

            const signal = this.getSignal(current!, previous!, i);

            if (signal === 'buy' && position === null) {
                position = 'long';
                entryPrice = current!.spread;
                entryTime = current!.timestamp;
            }
            else if (signal === 'sell' && position === 'long') {
                const exitPrice = current!.spread;
                const profit = this.calculateProfit(entryPrice, exitPrice, 'long');

                trades.push({
                    entryTime,
                    exitTime: current!.timestamp,
                    entryPrice,
                    exitPrice,
                    type: 'long',
                    profit,
                    profitPercent: (profit / entryPrice) * 100,
                });

                position = null;
            }
        }

        return trades;
    }

    private getSignal(current: ChartDataPoint, previous: ChartDataPoint, index: number): 'buy' | 'sell' | 'hold' {
        switch (this.config.strategy) {
            case 'spread_threshold':
                return this.spreadThresholdSignal(current, previous);
            case 'mean_reversion':
                return this.meanReversionSignal(index);
            case 'momentum':
                return this.momentumSignal(index);
            default:
                return 'hold';
        }
    }

    private spreadThresholdSignal(current: ChartDataPoint, previous: ChartDataPoint): 'buy' | 'sell' | 'hold' {
        const threshold = this.config.spreadThreshold || 0.5;

        if (current.spread > threshold && previous.spread <= threshold)
            return 'buy';
        else if (current.spread < threshold && previous.spread >= threshold)
            return 'sell';

        return 'hold';
    }

    private meanReversionSignal(index: number): 'buy' | 'sell' | 'hold' {
        const period = this.config.meanReversionPeriod || 20;
        if (index < period) return 'hold';

        const recentData = this.data.slice(index - period, index);
        const mean = recentData.reduce((sum, d) => sum + d.spread, 0) / period;
        const stdDev = Math.sqrt(
            recentData.reduce((sum, d) => sum + Math.pow(d.spread - mean, 2), 0) / period
        );

        const current = this.data[index];
        const zScore = (current!.spread - mean) / stdDev;

        if (zScore > 2)
            return 'sell';
        if (zScore < -2)
            return 'buy';

        return 'hold';
    }

    private momentumSignal(index: number): 'buy' | 'sell' | 'hold' {
        const period = this.config.momentumPeriod || 10;
        if (index < period) return 'hold';

        const current = this.data[index];
        const previous = this.data[index - period];
        const momentum = ((current!.spread - previous!.spread) / previous!.spread) * 100;

        if (momentum > 1)
            return 'buy';
        if (momentum < -1)
            return 'sell';

        return 'hold';
    }

    private calculateProfit(entry: number, exit: number, type: 'long' | 'short'): number {
        const rawProfit = type === 'long' ? exit - entry : entry - exit;
        const commission = (entry + exit) * this.config.commission / 100;
        const slippage = (entry + exit) * this.config.slippage / 100;

        return rawProfit - commission - slippage;
    }

    private calculateEquityCurve(trades: Trade[]): EquityPoint[] {
        const curve: EquityPoint[] = [];
        let equity = this.config.initialCapital;
        let peak = equity;

        curve.push({ timestamp: this.data[0]!.timestamp, equity, drawdown: 0 });

        trades.forEach((trade) => {
            equity += trade.profit;
            peak = Math.max(peak, equity);
            const drawdown = peak - equity;

            curve.push({
                timestamp: trade.exitTime,
                equity,
                drawdown,
            });
        });

        return curve;
    }

    private calculateDrawdownCurve(equityCurve: EquityPoint[]): DrawdownPoint[] {
        return equityCurve.map(point => ({
            timestamp: point.timestamp,
            drawdown: point.drawdown,
            drawdownPercent: (point.drawdown / (point.equity + point.drawdown)) * 100,
        }));
    }

    private calculateMetrics(trades: Trade[], equityCurve: EquityPoint[], drawdownCurve: DrawdownPoint[]): Partial<EnhancedBacktestResult> {
        const winningTrades = trades.filter(t => t.profit > 0);
        const losingTrades = trades.filter(t => t.profit < 0);

        const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
        const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
        const netProfit = totalProfit - totalLoss;

        const winRate = (winningTrades.length / trades.length) * 100;
        const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit;

        const averageWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
        const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

        const expectancy = (winRate / 100 * averageWin) - ((100 - winRate) / 100 * averageLoss);

        const maxDrawdown = Math.max(...drawdownCurve.map(d => d.drawdown));
        const maxDrawdownPercent = Math.max(...drawdownCurve.map(d => d.drawdownPercent));
        const averageDrawdown = drawdownCurve.reduce((sum, d) => sum + d.drawdown, 0) / drawdownCurve.length;

        const returns = trades.map(t => t.profitPercent);
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const stdDevReturn = Math.sqrt(
            returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
        );
        const sharpeRatio = stdDevReturn > 0 ? avgReturn / stdDevReturn : 0;

        const negativeReturns = returns.filter(r => r < 0);
        const downsideDeviation = negativeReturns.length > 0 ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length) : 0;
        const sortinoRatio = downsideDeviation > 0 ? avgReturn / downsideDeviation : 0;

        const annualizedReturn = (netProfit / this.config.initialCapital) * 100;
        const calmarRatio = maxDrawdownPercent > 0 ? annualizedReturn / maxDrawdownPercent : 0;

        const { maxWins, maxLosses } = this.calculateConsecutive(trades);

        return {
            totalTrades: trades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            totalProfit,
            totalLoss,
            netProfit,
            winRate,
            profitFactor,
            sharpeRatio,
            sortinoRatio,
            calmarRatio,
            maxDrawdown,
            maxDrawdownPercent,
            averageDrawdown,
            maxConsecutiveWins: maxWins,
            maxConsecutiveLosses: maxLosses,
            averageWin,
            averageLoss,
            largestWin: Math.max(...winningTrades.map(t => t.profit), 0),
            largestLoss: Math.min(...losingTrades.map(t => t.profit), 0),
            expectancy,
        };
    }

    private calculateConsecutive(trades: Trade[]): { maxWins: number; maxLosses: number } {
        let maxWins = 0;
        let maxLosses = 0;
        let currentWins = 0;
        let currentLosses = 0;

        trades.forEach(trade => {
            if (trade.profit > 0) {
                currentWins++;
                currentLosses = 0;
                maxWins = Math.max(maxWins, currentWins);
            }
            else {
                currentLosses++;
                currentWins = 0;
                maxLosses = Math.max(maxLosses, currentLosses);
            }
        });

        return { maxWins, maxLosses };
    }

    private calculateTradeDistribution(trades: Trade[]): TradeDistribution {
        const profits = trades.map(t => t.profit);
        const min = Math.min(...profits);
        const max = Math.max(...profits);
        const binCount = 20;
        const binSize = (max - min) / binCount;

        const bins: number[] = [];
        const frequencies: number[] = Array(binCount).fill(0);

        for (let i = 0; i < binCount; i++) {
            bins.push(min + i * binSize);
        }

        profits.forEach(profit => {
            const binIndex = Math.min(Math.floor((profit - min) / binSize), binCount - 1);
            frequencies[binIndex]!++;
        });

        return { bins, frequencies };
    }

    private calculateStreaks(trades: Trade[]): { winStreaks: number[]; lossStreaks: number[] } {
        const winStreaks: number[] = [];
        const lossStreaks: number[] = [];
        let currentWinStreak = 0;
        let currentLossStreak = 0;

        trades.forEach(trade => {
            if (trade.profit > 0) {
                if (currentLossStreak > 0) {
                    lossStreaks.push(currentLossStreak);
                    currentLossStreak = 0;
                }
                currentWinStreak++;
            }
            else {
                if (currentWinStreak > 0) {
                    winStreaks.push(currentWinStreak);
                    currentWinStreak = 0;
                }
                currentLossStreak++;
            }
        });

        if (currentWinStreak > 0)
            winStreaks.push(currentWinStreak);
        if (currentLossStreak > 0)
            lossStreaks.push(currentLossStreak);

        return { winStreaks, lossStreaks };
    }

    private runMonteCarlo(trades: Trade[]): MonteCarloResult[] {
        const runs = this.config.monteCarloRuns || 1000;
        const results: MonteCarloResult[] = [];

        for (let run = 0; run < runs; run++) {
            const shuffledTrades = [...trades].sort(() => Math.random() - 0.5);
            const equityCurve = this.calculateEquityCurve(shuffledTrades);
            const drawdownCurve = this.calculateDrawdownCurve(equityCurve);

            const finalEquity = equityCurve[equityCurve.length - 1]!.equity;
            const maxDrawdown = Math.max(...drawdownCurve.map(d => d.drawdownPercent));

            const returns = shuffledTrades.map(t => t.profitPercent);
            const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
            const stdDevReturn = Math.sqrt(
                returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
            );
            const sharpeRatio = stdDevReturn > 0 ? avgReturn / stdDevReturn : 0;

            results.push({
                run: run + 1,
                finalEquity,
                maxDrawdown,
                sharpeRatio,
            });
        }

        return results;
    }

    private runWalkForward(): WalkForwardResult[] {
        const periods = this.config.walkForwardPeriods || 5;
        const periodSize = Math.floor(this.data.length / periods);
        const results: WalkForwardResult[] = [];

        for (let i = 0; i < periods; i++) {
            const startIdx = i * periodSize;
            const endIdx = Math.min((i + 1) * periodSize, this.data.length);
            const periodData = this.data.slice(startIdx, endIdx);

            if (periodData.length < 10) continue;

            const optimalParams = this.optimizeParameters(periodData);

            const engine = new EnhancedBacktestEngine(periodData, {
                ...this.config,
                ...optimalParams,
            });
            const periodResult = engine.run();

            results.push({
                period: i + 1,
                startDate: periodData[0]!.timestamp,
                endDate: periodData[periodData.length - 1]!.timestamp,
                netProfit: periodResult.netProfit,
                winRate: periodResult.winRate,
                sharpeRatio: periodResult.sharpeRatio,
                optimalParams,
            });
        }

        return results;
    }

    private optimizeParameters(data: ChartDataPoint[]): any {
        const spreadThresholds = [0.3, 0.5, 0.7, 1.0];
        const stopLosses = [1, 2, 3, 5];
        const takeProfits = [2, 3, 5, 10];

        let bestScore = -Infinity;
        let bestParams = {};

        for (const threshold of spreadThresholds) {
            for (const stopLoss of stopLosses) {
                for (const takeProfit of takeProfits) {
                    const engine = new EnhancedBacktestEngine(data, {
                        ...this.config,
                        spreadThreshold: threshold,
                        stopLoss,
                        takeProfit,
                    });

                    const result = engine.run();

                    const score = result.netProfit * result.sharpeRatio / (result.maxDrawdownPercent + 1);

                    if (score > bestScore) {
                        bestScore = score;
                        bestParams = { spreadThreshold: threshold, stopLoss, takeProfit };
                    }
                }
            }
        }

        return bestParams;
    }

    runOptimization(): OptimizationResult[] {
        const results: OptimizationResult[] = [];

        const spreadThresholds = [0.3, 0.5, 0.7, 1.0, 1.5];
        const stopLosses = [1, 2, 3, 5];
        const takeProfits = [2, 3, 5, 10];

        for (const threshold of spreadThresholds) {
            for (const stopLoss of stopLosses) {
                for (const takeProfit of takeProfits) {
                    const engine = new EnhancedBacktestEngine(this.data, {
                        ...this.config,
                        spreadThreshold: threshold,
                        stopLoss,
                        takeProfit,
                    });

                    const result = engine.run();
                    const score = result.netProfit * result.sharpeRatio / (result.maxDrawdownPercent + 1);

                    results.push({
                        params: { spreadThreshold: threshold, stopLoss, takeProfit },
                        netProfit: result.netProfit,
                        winRate: result.winRate,
                        sharpeRatio: result.sharpeRatio,
                        maxDrawdown: result.maxDrawdownPercent,
                        score,
                    });
                }
            }
        }

        return results.sort((a, b) => b.score - a.score);
    }
}