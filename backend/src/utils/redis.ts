import { createClient } from 'redis';
import { logger } from './logger';

let redisClient: any;

export const initializeRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    redisClient.on('error', (err: any) => logger.error('Redis error', err));
    await redisClient.connect();
    logger.info('✅ Redis connected');
  } catch (error) {
    logger.warn('Redis connection failed (optional)', error);
  }
};

export const getCache = async (key: string): Promise<any> => {
  try {
    if (!redisClient) return null;
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

export const setCache = async (key: string, value: any, ttl = 3600): Promise<void> => {
  try {
    if (!redisClient) return;
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.error('Redis set error', error);
  }
};

export { redisClient };
