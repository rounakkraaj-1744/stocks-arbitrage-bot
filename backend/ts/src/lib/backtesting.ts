import { type ChartDataPoint } from './types';

export interface BacktestConfig {
    initialCapital: number;
    threshold: number;
    stopLoss?: number;
    takeProfit?: number;
    commission: number;
    slippage: number;
}

export interface Trade {
    entryTime: number;
    exitTime: number;
    entryPrice: number;
    exitPrice: number;
    spread: number;
    type: 'LONG' | 'SHORT';
    profit: number;
    profitPercent: number;
}

export interface BacktestMetrics {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    finalCapital: number;
    returnPercent: number;
    trades: Trade[];
}

export function runBacktest(data: ChartDataPoint[], config: BacktestConfig): BacktestMetrics {
    const trades: Trade[] = [];
    let capital = config.initialCapital;
    let position: { type: 'LONG' | 'SHORT'; entryPrice: number; entryTime: number; spread: number } | null = null;
    let equity: number[] = [capital];

    for (let i = 1; i < data.length; i++) {
        const current = data[i];
        const prev = data[i - 1];

        if (!position) {
            if (current!.spread > config.threshold) {
                position = {
                    type: 'LONG',
                    entryPrice: current!.spot,
                    entryTime: current!.timestamp,
                    spread: current!.spread,
                };
            }
            else if (current!.spread < -config.threshold) {
                position = {
                    type: 'SHORT',
                    entryPrice: current!.spot,
                    entryTime: current!.timestamp,
                    spread: current!.spread,
                };
            }
        }

        if (position) {
            let shouldExit = false;
            const currentProfit = position.type === 'LONG' ? ((current!.spot - position.entryPrice) / position.entryPrice) * 100 : ((position.entryPrice - current!.spot) / position.entryPrice) * 100;

            if (config.stopLoss && currentProfit < -config.stopLoss) {
                shouldExit = true;
            }

            if (config.takeProfit && currentProfit > config.takeProfit)
                shouldExit = true;

            if (position.type === 'LONG' && current!.spread < 0)
                shouldExit = true;
            else if (position.type === 'SHORT' && current!.spread > 0)
                shouldExit = true;

            if (shouldExit) {
                const grossProfit = (current!.spot - position.entryPrice) * (position.type === 'LONG' ? 1 : -1);
                const commissionCost = (position.entryPrice + current!.spot) * (config.commission / 100);
                const slippageCost = (position.entryPrice + current!.spot) * (config.slippage / 100);
                const netProfit = grossProfit - commissionCost - slippageCost;
                const profitPercent = (netProfit / position.entryPrice) * 100;

                trades.push({
                    entryTime: position.entryTime,
                    exitTime: current!.timestamp,
                    entryPrice: position.entryPrice,
                    exitPrice: current!.spot,
                    spread: position.spread,
                    type: position.type,
                    profit: netProfit,
                    profitPercent,
                });

                capital += netProfit;
                equity.push(capital);
                position = null;
            }
        }
    }

    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit < 0);

    const totalProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    const netProfit = totalProfit - totalLoss;

    const avgWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

    const largestWin = winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.profit)) : 0;
    const largestLoss = losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.profit)) : 0;

    let maxDrawdown = 0;
    let peak = equity[0];
    for (const value of equity) {
        if (value > peak) peak = value;
        const drawdown = ((peak - value) / peak) * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    const returns = equity.slice(1).map((val, i) => (val - equity[i]) / equity[i]);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    return {
        totalTrades: trades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
        totalProfit,
        totalLoss,
        netProfit,
        profitFactor: totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0,
        sharpeRatio,
        maxDrawdown,
        avgWin,
        avgLoss,
        largestWin,
        largestLoss,
        finalCapital: capital,
        returnPercent: ((capital - config.initialCapital) / config.initialCapital) * 100,
        trades,
    };
}