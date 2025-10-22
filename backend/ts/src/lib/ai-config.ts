export const AI_CONFIG = {
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  MODEL_GROQ: 'llama-3.1-70b-versatile',
  MODEL_GEMINI: 'gemini-1.5-flash',
};

export const AI_PROMPTS = {
  TRADE_SIGNAL: `You are an expert arbitrage trading analyst. Analyze the provided stock data and provide:
1. Trade recommendation (BUY/SELL/HOLD)
2. Confidence score (0-100%)
3. Key reasoning (2-3 bullet points)
4. Risk level (LOW/MEDIUM/HIGH)
5. Target profit estimate

Be concise and actionable. Format as JSON.`,

  MARKET_ANALYSIS: `Analyze this arbitrage opportunity and explain:
1. Why this spread exists
2. Market conditions
3. Expected convergence time
4. Potential risks
Keep it under 100 words.`,

  PORTFOLIO_ADVICE: `As a portfolio manager, suggest optimal allocation strategy for these arbitrage opportunities. Consider risk-adjusted returns.`,
};
