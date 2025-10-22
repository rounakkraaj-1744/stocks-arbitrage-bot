import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_CONFIG, AI_PROMPTS } from '../lib/ai-config';
import { type ArbitrageData, type ChartDataPoint, type AITradeSignal, type AIMarketAnalysis, type PortfolioOptimization } from '../lib/types';

const groq = new Groq({
    apiKey: AI_CONFIG.GROQ_API_KEY,
});

const genAI = new GoogleGenerativeAI(AI_CONFIG.GEMINI_API_KEY);

export class AIService {
    static async generateTradeSignal(
        stock: ArbitrageData,
        historicalData: ChartDataPoint[]
    ): Promise<AITradeSignal> {
        try {
            const recentData = historicalData.slice(-10);
            const avgSpread = recentData.reduce((sum, d) => sum + d.spread, 0) / recentData.length;
            const spreadTrend = recentData.length > 1
                ? recentData[recentData.length - 1]!.spread - recentData[0]!.spread
                : 0;

            const prompt = `${AI_PROMPTS.TRADE_SIGNAL}

Stock Data:
Symbol: ${stock.symbol}
Current Spot Price: ₹${stock.spot_price}
Current Futures Price: ₹${stock.futures_price}
Spread: ${stock.spread_percentage}%
Spread Trend: ${stock.spread_trend}
Average Spread (10 periods): ${avgSpread.toFixed(2)}%
Spread Change: ${spreadTrend.toFixed(2)}%
Lot Size: ${stock.lot_size}
Estimated Profit: ₹${stock.gross_profit}
ROI: ${stock.roi_percentage}%

Respond ONLY with valid JSON in this exact format:
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": 85,
  "reasoning": ["reason 1", "reason 2", "reason 3"],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "targetProfit": 1500.50
}`;

            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert arbitrage trading analyst. Always respond with valid JSON only.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                model: AI_CONFIG.MODEL_GROQ,
                temperature: 0.3,
                max_tokens: 500,
            });

            const response = completion.choices[0]?.message?.content || '{}';

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
                action: 'HOLD',
                confidence: 50,
                reasoning: ['Unable to analyze'],
                riskLevel: 'HIGH',
                targetProfit: 0,
            };

            return {
                ...parsed,
                timestamp: Date.now(),
            };
        } catch (error) {
            console.error('AI Trade Signal Error:', error);
            throw new Error('Failed to generate AI trade signal');
        }
    }

    static async analyzeMarket(
        stock: ArbitrageData,
        historicalData: ChartDataPoint[]
    ): Promise<AIMarketAnalysis> {
        try {
            const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL_GEMINI });

            const prompt = `${AI_PROMPTS.MARKET_ANALYSIS}

Stock: ${stock.symbol}
Spread: ${stock.spread_percentage}%
Trend: ${stock.spread_trend}
Action: ${stock.action}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            const sentiment = text.toLowerCase().includes('bullish') ? 'BULLISH'
                : text.toLowerCase().includes('bearish') ? 'BEARISH'
                    : 'NEUTRAL';

            return {
                summary: text,
                sentiment,
                keyFactors: text.split('.').filter(s => s.trim().length > 0).slice(0, 3),
                timestamp: Date.now(),
            };
        } catch (error) {
            console.error('AI Market Analysis Error:', error);
            throw new Error('Failed to analyze market');
        }
    }

    static async chatWithAI(
        userMessage: string,
        context: {
            currentData: { [key: string]: ArbitrageData };
            selectedStock?: string;
        }
    ): Promise<string> {
        try {
            const model = genAI.getGenerativeModel({ model: AI_CONFIG.MODEL_GEMINI });

            const contextInfo = context.selectedStock && context.currentData[context.selectedStock]
                ? `Current viewing: ${context.selectedStock}
Spread: ${context.currentData[context.selectedStock]?.spread_percentage}%
Price: ₹${context.currentData[context.selectedStock]?.spot_price}`
                : 'No stock selected';

            const prompt = `You are an expert arbitrage trading assistant. Help the user with their query.

Context:
${contextInfo}

Active opportunities: ${Object.values(context.currentData).filter(d => d.opportunity).length}

User question: ${userMessage}

Provide a helpful, concise response (max 150 words).`;

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('AI Chat Error:', error);
            throw new Error('Failed to process chat');
        }
    }

    static async optimizePortfolio(
        opportunities: ArbitrageData[],
        totalCapital: number
    ): Promise<PortfolioOptimization> {
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a portfolio optimization expert. Respond with valid JSON only.',
                    },
                    {
                        role: 'user',
                        content: `${AI_PROMPTS.PORTFOLIO_ADVICE}

Available Capital: ₹${totalCapital}
Opportunities:
${opportunities.map(o => `${o.symbol}: Spread ${o.spread_percentage}%, ROI ${o.roi_percentage}%, Risk: ${o.spread_trend}`).join('\n')}

Respond with JSON:
{
  "allocations": [{"symbol": "TCS", "percentage": 30}],
  "reasoning": "explanation",
  "expectedReturn": 5.5
}`,
                    },
                ],
                model: AI_CONFIG.MODEL_GROQ,
                temperature: 0.5,
                max_tokens: 800,
            });

            const response = completion.choices[0]?.message?.content || '{}';
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {
                allocations: [],
                reasoning: 'Unable to optimize',
                expectedReturn: 0,
            };

            const allocations = parsed.allocations.map((a: any) => ({
                symbol: a.symbol,
                percentage: a.percentage,
                amount: (totalCapital * a.percentage) / 100,
            }));

            return {
                allocations,
                reasoning: parsed.reasoning,
                expectedReturn: parsed.expectedReturn,
            };
        } catch (error) {
            console.error('Portfolio Optimization Error:', error);
            throw new Error('Failed to optimize portfolio');
        }
    }
}
