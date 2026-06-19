import Parser from 'rss-parser';
import { groq } from './ai.service.ts';

const parser = new Parser();

export async function fetchNewsSentiment(symbol: string) {
  try {
    const feed = await parser.parseURL(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}.NS`);
    
    if (!feed.items || feed.items.length === 0) {
      return { score: 0, label: 'Neutral', summary: 'No recent news found.' };
    }

    const headlines = feed.items.slice(0, 5).map(item => item.title).join('\n');
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a financial sentiment analyzer. Read the following headlines and provide a JSON response with a "score" (-1.0 to 1.0), "label" (Bullish, Bearish, or Neutral), and a brief "summary". Only return JSON.'
        },
        {
          role: 'user',
          content: headlines
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return {
      score: result.score || 0,
      label: result.label || 'Neutral',
      summary: result.summary || 'Sentiment analysis unavailable.'
    };
  }
  catch (error) {
    console.error(`Sentiment analysis failed for ${symbol}:`, error);
    return { score: 0, label: 'Neutral', summary: 'Error fetching sentiment.' };
  }
}