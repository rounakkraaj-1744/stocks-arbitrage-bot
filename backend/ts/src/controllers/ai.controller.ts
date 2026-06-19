import { type Request, type Response, type NextFunction } from 'express';
import { AIService } from '../services/ai.service.ts';
import { type ArbitrageData, type ChartDataPoint } from '../lib/types.ts';

export class AIController {

  static async generateTradeSignal(req: Request, res: Response, next: NextFunction) {
    try {
      const { stock, historicalData } = req.body as {
        stock: ArbitrageData;
        historicalData: ChartDataPoint[];
      };

      if (!stock || !historicalData) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: stock, historicalData',
        });
      }

      const signal = await AIService.generateTradeSignal(stock, historicalData);

      res.json({
        success: true,
        data: signal,
      });
    } catch (error) {
      next(error);
    }
  }

  static async analyzeMarket(req: Request, res: Response, next: NextFunction) {
    try {
      const { stock, historicalData } = req.body as {
        stock: ArbitrageData;
        historicalData: ChartDataPoint[];
      };

      if (!stock || !historicalData) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: stock, historicalData',
        });
      }

      const analysis = await AIService.analyzeMarket(stock, historicalData);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, context } = req.body as {
        message: string;
        context: {
          currentData: { [key: string]: ArbitrageData };
          selectedStock?: string;
        };
      };

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required field: message',
        });
      }

      const response = await AIService.chatWithAI(message, context);

      res.json({
        success: true,
        data: { response },
      });
    } catch (error) {
      next(error);
    }
  }

  static async optimizePortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const { opportunities, totalCapital } = req.body as {
        opportunities: ArbitrageData[];
        totalCapital: number;
      };

      if (!opportunities || !totalCapital) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: opportunities, totalCapital',
        });
      }

      const optimization = await AIService.optimizePortfolio(opportunities, totalCapital);

      res.json({
        success: true,
        data: optimization,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSentiment(req: Request, res: Response, next: NextFunction) {
    try {
      const { symbol } = req.query;
      if (!symbol || typeof symbol !== 'string') {
        return res.status(400).json({ success: false, error: 'Missing symbol' });
      }

      const { fetchNewsSentiment } = await import('../services/sentiment.service.ts');
      const sentiment = await fetchNewsSentiment(symbol);

      res.json({ success: true, data: sentiment });
    } catch (error) {
      next(error);
    }
  }

  static async getMLPrediction(req: Request, res: Response, next: NextFunction) {
    try {
      const { spreads } = req.body as { spreads: number[] };
      if (!spreads || !Array.isArray(spreads)) {
        return res.status(400).json({ success: false, error: 'Missing spreads array' });
      }

      const { predictNextSpread } = await import('../services/ml.service.ts');
      const prediction = predictNextSpread(spreads);

      res.json({ success: true, data: prediction });
    } catch (error) {
      next(error);
    }
  }
}