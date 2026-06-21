/**
 * UT Bot Alerts Signal Generation Logic
 * Based on indicator by adriiiiaan/QuantNomad
 */

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface UTSignal {
  type: 'BUY' | 'SELL' | null;
  entry: number;
  strength: number;
}

const calculateATR = (candles: Candle[], period: number = 14): number[] => {
  const tr: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }
  const atr: number[] = [];
  let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
  atr.push(sum / period);
  for (let i = period; i < tr.length; i++) {
    sum = sum - tr[i - period] + tr[i];
    atr.push(sum / period);
  }
  return atr;
};

const calculateHeikinAshi = (candles: Candle[]): Candle[] => {
  const ha: Candle[] = [];
  for (let i = 0; i < candles.length; i++) {
    const close = (candles[i].open + candles[i].high + candles[i].low + candles[i].close) / 4;
    const open = i === 0 ? candles[i].open : (ha[i - 1].open + ha[i - 1].close) / 2;
    const high = Math.max(candles[i].high, open, close);
    const low = Math.min(candles[i].low, open, close);
    ha.push({ open, high, low, close, volume: candles[i].volume });
  }
  return ha;
};

export const generateUTBotSignal = (candles: Candle[]): UTSignal => {
  if (candles.length < 20) {
    return { type: null, entry: 0, strength: 0 };
  }

  const atr = calculateATR(candles, 10);
  const ha = calculateHeikinAshi(candles);
  const current = ha[ha.length - 1];
  const previous = ha[ha.length - 2];
  const currentATR = atr[atr.length - 1];
  const prevATR = atr[atr.length - 2];

  let signal: UTSignal = { type: null, entry: 0, strength: 0 };
  let confluence = 0;

  // Heikin Ashi color change
  if (current.close > current.open && previous.close < previous.open) {
    signal.type = 'BUY';
    signal.entry = current.low;
    confluence++;
  } else if (current.close < current.open && previous.close > previous.open) {
    signal.type = 'SELL';
    signal.entry = current.high;
    confluence++;
  }

  // ATR expansion
  if (signal.type && currentATR > prevATR) {
    confluence++;
  }

  // Volume confirmation
  if (signal.type && candles[candles.length - 1].volume > candles[candles.length - 2].volume) {
    confluence++;
  }

  signal.strength = Math.min(confluence, 3);
  return signal;
};
