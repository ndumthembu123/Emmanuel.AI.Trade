/**
 * SuperTrend TP/SL Level Calculation
 */

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SuperTrendLevels {
  tp1: number;
  tp2: number;
  tp3: number;
  sl: number;
}

const calculateATR = (candles: Candle[], period: number = 14): number => {
  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }
  let atr = tr.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < tr.length; i++) {
    atr = (atr * (period - 1) + tr[i]) / period;
  }
  return atr;
};

export const generateSuperTrendLevels = (candles: Candle[]): SuperTrendLevels => {
  if (candles.length < 15) {
    return { tp1: 0, tp2: 0, tp3: 0, sl: 0 };
  }

  const atr = calculateATR(candles, 10);
  const current = candles[candles.length - 1];
  const hl2 = (current.high + current.low) / 2;
  const multiplier = 3;

  const upperBand = hl2 + multiplier * atr;
  const lowerBand = hl2 - multiplier * atr;
  const isUptrend = current.close > lowerBand;

  let tp1, tp2, tp3, sl;

  if (isUptrend) {
    const riskRatio = (upperBand - current.close) / current.close;
    tp1 = parseFloat((current.close + current.close * riskRatio).toFixed(2));
    tp2 = parseFloat((current.close + current.close * riskRatio * 2).toFixed(2));
    tp3 = parseFloat((current.close + current.close * riskRatio * 3).toFixed(2));
    sl = parseFloat(lowerBand.toFixed(2));
  } else {
    const riskRatio = (current.close - lowerBand) / current.close;
    tp1 = parseFloat((current.close - current.close * riskRatio).toFixed(2));
    tp2 = parseFloat((current.close - current.close * riskRatio * 2).toFixed(2));
    tp3 = parseFloat((current.close - current.close * riskRatio * 3).toFixed(2));
    sl = parseFloat(upperBand.toFixed(2));
  }

  return { tp1, tp2, tp3, sl };
};
