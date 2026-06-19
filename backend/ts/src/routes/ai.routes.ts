import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.ts';

const router = Router();

router.post('/trade-signal', AIController.generateTradeSignal);
router.post('/market-analysis', AIController.analyzeMarket);
router.post('/chat', AIController.chat);
router.post('/optimize-portfolio', AIController.optimizePortfolio);
router.get('/sentiment', AIController.getSentiment);
router.post('/ml-prediction', AIController.getMLPrediction);

export default router;