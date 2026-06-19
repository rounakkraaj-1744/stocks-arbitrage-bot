import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma.ts';

const router = Router();

router.get('/wallet', async (req: Request, res: Response) => {
  try {
    let wallet = await prisma.virtualWallet.findFirst();
    if (!wallet) {
      wallet = await prisma.virtualWallet.create({ data: {} });
    }
    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch wallet' });
  }
});

router.post('/trade', async (req: Request, res: Response) => {
  try {
    const { symbol, type, spotPrice, futuresPrice, quantity, spread } = req.body;
  
    const trade = await prisma.trade.create({
      data: {
        symbol,
        type,
        spotPrice,
        futuresPrice,
        quantity,
        spread,
        pnl: 0,
      }
    });

    res.json({ success: true, trade });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to execute trade' });
  }
});

router.get('/trades', async (req: Request, res: Response) => {
  try {
    const trades = await prisma.trade.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json({ success: true, trades });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trades' });
  }
});

router.get('/strategies', async (req: Request, res: Response) => {
  try {
    const strategies = await prisma.strategy.findMany();
    res.json({ success: true, strategies });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch strategies' });
  }
});

router.post('/strategies', async (req: Request, res: Response) => {
  try {
    const { name, configuration } = req.body;
    const strategy = await prisma.strategy.create({
      data: {
        name,
        configuration: JSON.stringify(configuration),
      }
    });
    res.json({ success: true, strategy });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create strategy' });
  }
});

router.get('/portfolio/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await prisma.portfolioMetrics.findMany({
      orderBy: { date: 'asc' }
    });
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch portfolio metrics' });
  }
});

export default router;