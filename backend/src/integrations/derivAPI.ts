/**
 * Deriv Public API Integration
 * Fetches live 1-minute candle data for Boom/Crash markets
 */

import axios from 'axios';
import { logger } from '../utils/logger';

const DERIV_API_URL = 'wss://ws.derivws.com/websockets/v3';

interface DerivCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  epoch: number;
}

interface DerivMarketConfig {
  symbol: 'BOOM300' | 'BOOM500' | 'BOOM1000' | 'CRASH300' | 'CRASH500' | 'CRASH1000';
  granularity: 60; // 1-minute candles
}

let wsConnection: WebSocket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Initialize WebSocket connection to Deriv API
 */
export const connectDerivAPI = (): Promise<WebSocket> => {
  return new Promise((resolve, reject) => {
    try {
      wsConnection = new WebSocket(DERIV_API_URL);

      wsConnection.onopen = () => {
        logger.info('✅ Connected to Deriv WebSocket API');
        reconnectAttempts = 0;
        
        // Authorize with token (empty for demo/public access)
        const authPayload = {
          authorize: '',
        };
        wsConnection!.send(JSON.stringify(authPayload));
        resolve(wsConnection!);
      };

      wsConnection.onerror = (error) => {
        logger.error('Deriv API WebSocket error', error);
        reject(error);
      };

      wsConnection.onclose = () => {
        logger.warn('Deriv API WebSocket closed');
        wsConnection = null;
        
        // Attempt reconnection
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          setTimeout(() => {
            logger.info(`Reconnecting to Deriv API (attempt ${reconnectAttempts})...`);
            connectDerivAPI();
          }, 3000 * reconnectAttempts);
        }
      };
    } catch (error) {
      logger.error('Failed to initialize Deriv API connection', error);
      reject(error);
    }
  });
};

/**
 * Subscribe to 1-minute candle data for a Boom/Crash market
 */
export const subscribeToBoomCrashCandles = (
  market: 'BOOM300' | 'BOOM500' | 'BOOM1000' | 'CRASH300' | 'CRASH500' | 'CRASH1000',
  onCandle: (candle: DerivCandle) => void,
  onError?: (error: any) => void
): string => {
  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    const error = 'WebSocket not connected';
    logger.error(error);
    onError?.(error);
    throw new Error(error);
  }

  // Convert market name to Deriv symbol
  const symbolMap: { [key: string]: string } = {
    'BOOM300': '1BOOMpv',
    'BOOM500': '1BOOM500v',
    'BOOM1000': '1BOOM1000v',
    'CRASH300': '1CRASHpv',
    'CRASH500': '1CRASH500v',
    'CRASH1000': '1CRASH1000v',
  };

  const symbol = symbolMap[market];
  const subscriptionId = `${market}_${Date.now()}`;

  const subscription = {
    ticks_history: symbol,
    adjust_start_time: 1,
    count: 60, // Fetch last 60 candles
    end: 'latest',
    granularity: 60, // 1-minute
    style: 'candles',
    subscribe: 1
  };

  wsConnection!.onmessage = (event) => {
    try {
      const response = JSON.parse(event.data);

      if (response.error) {
        logger.error(`Deriv API error for ${market}`, response.error);
        onError?.(response.error);
        return;
      }

      if (response.candles) {
        const candles = response.candles.map((c: any) => ({
          open: c.o,
          high: c.h,
          low: c.l,
          close: c.c,
          volume: 0, // Deriv doesn't provide volume in real-time
          epoch: c.epoch
        }));

        // Process each new candle
        candles.forEach((candle: DerivCandle) => {
          onCandle(candle);
        });
      }

      if (response.tick) {
        // Handle real-time tick updates
        const tick = response.tick;
        const lastCandle = {
          open: tick.open,
          high: tick.high || tick.quote,
          low: tick.low || tick.quote,
          close: tick.quote,
          volume: 0,
          epoch: tick.epoch
        };
        onCandle(lastCandle);
      }
    } catch (error) {
      logger.error('Error processing Deriv candle data', error);
      onError?.(error);
    }
  };

  wsConnection!.send(JSON.stringify(subscription));
  logger.info(`Subscribed to ${market} candles`);

  return subscriptionId;
};

/**
 * Subscribe to multiple Boom/Crash markets simultaneously
 */
export const subscribeToMultipleMarkets = (
  markets: Array<'BOOM300' | 'BOOM500' | 'BOOM1000' | 'CRASH300' | 'CRASH500' | 'CRASH1000'>,
  onCandles: (market: string, candle: DerivCandle) => void,
  onError?: (error: any) => void
): string[] => {
  return markets.map(market => {
    return subscribeToBoomCrashCandles(
      market,
      (candle) => onCandles(market, candle),
      onError
    );
  });
};

/**
 * Unsubscribe from market updates
 */
export const unsubscribeFromMarket = (subscriptionId: string): void => {
  if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
    logger.warn('WebSocket not connected for unsubscribe');
    return;
  }

  const unsubscribe = {
    forget: subscriptionId
  };

  wsConnection!.send(JSON.stringify(unsubscribe));
  logger.info(`Unsubscribed from ${subscriptionId}`);
};

/**
 * Close Deriv API connection
 */
export const disconnectDerivAPI = (): void => {
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
    logger.info('Disconnected from Deriv API');
  }
};

/**
 * Get current market price
 */
export const getCurrentPrice = (market: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      reject('WebSocket not connected');
      return;
    }

    const symbolMap: { [key: string]: string } = {
      'BOOM300': '1BOOMpv',
      'BOOM500': '1BOOM500v',
      'BOOM1000': '1BOOM1000v',
      'CRASH300': '1CRASHpv',
      'CRASH500': '1CRASH500v',
      'CRASH1000': '1CRASH1000v',
    };

    const symbol = symbolMap[market];

    const tickRequest = {
      ticks: symbol,
      subscribe: 1
    };

    const handler = (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data);
        if (response.tick && response.tick.quote) {
          wsConnection!.removeEventListener('message', handler);
          resolve(response.tick.quote);
        }
      } catch (error) {
        reject(error);
      }
    };

    wsConnection!.addEventListener('message', handler);
    wsConnection!.send(JSON.stringify(tickRequest));
  });
};

/**
 * Get market status and tradability
 */
export const getMarketStatus = (market: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      reject('WebSocket not connected');
      return;
    }

    const symbolMap: { [key: string]: string } = {
      'BOOM300': '1BOOMpv',
      'BOOM500': '1BOOM500v',
      'BOOM1000': '1BOOM1000v',
      'CRASH300': '1CRASHpv',
      'CRASH500': '1CRASH500v',
      'CRASH1000': '1CRASH1000v',
    };

    const symbol = symbolMap[market];

    const statusRequest = {
      active_symbols: 'brief',
      product_type: 'basic'
    };

    const handler = (event: MessageEvent) => {
      try {
        const response = JSON.parse(event.data);
        if (response.active_symbols) {
          const isActive = response.active_symbols.some((s: any) => s.symbol === symbol);
          wsConnection!.removeEventListener('message', handler);
          resolve(isActive);
        }
      } catch (error) {
        reject(error);
      }
    };

    wsConnection!.addEventListener('message', handler);
    wsConnection!.send(JSON.stringify(statusRequest));
  });
};
