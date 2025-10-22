import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.ts';

const router = Router();

// AI Trade Signal
router.post('/trade-signal', AIController.generateTradeSignal);

// Market Analysis
router.post('/market-analysis', AIController.analyzeMarket);

// AI Chat
router.post('/chat', AIController.chat);

// Portfolio Optimization
router.post('/optimize-portfolio', AIController.optimizePortfolio);

export default router;
