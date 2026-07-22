/**
 * Main server with Deriv integration and signal processing
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { initializeDatabase } from './utils/database';
import { initializeRedis } from './utils/redis';
import { logger } from './utils/logger';
import signalsRouter from './routes/signals';
import { connectDerivAPI, subscribeToMultipleMarkets, disconnectDerivAPI } from './integrations/derivAPI';
import { processCandleData, handleSignalWebSocket } from './routes/signals';

dotenv.config();

const app: Express = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 5000;
const MARKETS = ['BOOM300', 'BOOM500', 'BOOM1000', 'CRASH300', 'CRASH500', 'CRASH1000'];

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8081', 'http://localhost:19000'],
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: process.env.APP_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
    markets: MARKETS
  });
});

app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend API working' });
});

// Signal routes
app.use('/api/signals', signalsRouter);

// WebSocket for real-time signals
wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.action === 'subscribe') {
        const market = data.market;
        if (MARKETS.includes(market)) {
          handleSignalWebSocket(ws, market);
          ws.send(JSON.stringify({
            type: 'SUBSCRIBED',
            market,
            message: `Subscribed to ${market} signals`
          }));
        }
      }

      if (data.action === 'unsubscribe') {
        ws.send(JSON.stringify({
          type: 'UNSUBSCRIBED',
          market: data.market
        }));
      }
    } catch (error) {
      logger.error('WebSocket message error', error);
    }
  });

  ws.on('close', () => {
    logger.info('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    logger.error('WebSocket error', error);
  });
});

// 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Request error', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('✅ Database initialized');

    // Initialize Redis
    await initializeRedis();
    logger.info('✅ Redis initialized');

    // Connect to Deriv API
    try {
      await connectDerivAPI();
      logger.info('✅ Connected to Deriv API');

      // Subscribe to all markets
      MARKETS.forEach(market => {
        subscribeToMultipleMarkets(
          [market as any],
          async (mkt, candle) => {
            // Process candle and generate signals
            const signal = await processCandleData(mkt, candle);

            // Broadcast signal to connected clients
            if (signal && signal.shouldAlert) {
              wss.clients.forEach((client) => {
                if (client.readyState === 1) { // WebSocket.OPEN
                  client.send(JSON.stringify({
                    type: 'SIGNAL',
                    market: mkt,
                    signal: signal,
                    audioAlert: signal.audioAlert
                  }));
                }
              });

              logger.info(`🚨 SIGNAL GENERATED: ${mkt} ${signal.type}`, {
                confidence: signal.confidence,
                aiScore: signal.aiScore
              });
            }
          },
          (error) => {
            logger.error(`Error subscribing to ${market}`, error);
          }
        );
      });

      logger.info(`✅ Subscribed to ${MARKETS.length} markets`);
    } catch (error) {
      logger.warn('Failed to connect to Deriv API - running in demo mode', error);
    }

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 Emmanuel.AI.Trade Backend running on http://localhost:${PORT}`);
      logger.info(`📊 Monitoring ${MARKETS.length} markets: ${MARKETS.join(', ')}`);
      logger.info(`🔊 Real-time signals via WebSocket`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  disconnectDerivAPI();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

startServer();

export default app;
