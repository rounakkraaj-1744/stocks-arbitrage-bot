import { ArbitrageData, ChartDataPoint } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface AITradeSignal {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    targetProfit: number;
    timestamp: number;
}

export interface AIMarketAnalysis {
    summary: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    keyFactors: string[];
    timestamp: number;
}

export interface PortfolioOptimization {
    allocations: { symbol: string; amount: number; percentage: number }[];
    reasoning: string;
    expectedReturn: number;
}

export async function generateTradeSignal(stock: ArbitrageData, historicalData: ChartDataPoint[]): Promise<AITradeSignal> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/trade-signal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock, historicalData }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate trade signal');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Trade signal error:', error);
        return {
            action: 'HOLD',
            confidence: 0,
            reasoning: ['AI service unavailable - please check backend connection'],
            riskLevel: 'HIGH',
            targetProfit: 0,
            timestamp: Date.now(),
        };
    }
}

export async function analyzeMarket(stock: ArbitrageData, historicalData: ChartDataPoint[]): Promise<AIMarketAnalysis> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/market-analysis`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock, historicalData }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to analyze market');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Market analysis error:', error);
        return {
            summary: 'Market analysis unavailable - please check backend connection',
            sentiment: 'NEUTRAL',
            keyFactors: [],
            timestamp: Date.now(),
        };
    }
}


export async function chatWithAI(message: string, context: {
    currentData: { [key: string]: ArbitrageData };
    selectedStock?: string;
}): Promise<string> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, context }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get chat response');
        }

        const result = await response.json();
        return result.data.response;
    } catch (error) {
        console.error('Chat error:', error);
        return 'Sorry, I encountered an error connecting to the AI service. Please check your backend connection.';
    }
}

export async function optimizePortfolio(opportunities: ArbitrageData[], totalCapital: number): Promise<PortfolioOptimization> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/ai/optimize-portfolio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ opportunities, totalCapital }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to optimize portfolio');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Portfolio optimization error:', error);
        return {
            allocations: [],
            reasoning: 'Optimization service unavailable - please check backend connection',
            expectedReturn: 0,
        };
    }
}

export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
        });
        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
}
