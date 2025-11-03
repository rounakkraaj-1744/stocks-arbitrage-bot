import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.ts';

const router = Router();

router.post('/trade-signal', AIController.generateTradeSignal);
router.post('/market-analysis', AIController.analyzeMarket);
router.post('/chat', AIController.chat);
router.post('/optimize-portfolio', AIController.optimizePortfolio);

export default router;
