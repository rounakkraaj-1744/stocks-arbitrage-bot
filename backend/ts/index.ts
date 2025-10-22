import express, {type NextFunction, type Request, type Response} from 'express';
import cors from 'cors';
import aiRoutes from './src/routes/ai.routes.ts';
import { errorHandler } from './src/middlewares/errorHandler.ts';
import { logger } from './src/utils/logger.ts';
import dotenv from "dotenv"
dotenv.config()

const app = express();
const port = process.env.PORT || 8080

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req:Request, res:Response, next:NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/api/ai', aiRoutes);

app.get('/health', (req:Request, res:Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use((req:Request, res:Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.use(errorHandler);

app.listen (port, ()=>{
    console.log(`Server started at http://localhost:${port}`)
})