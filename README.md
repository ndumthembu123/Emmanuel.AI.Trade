# Emmanuel.AI.Trade - Deriv Boom/Crash Pre-Spike Predictor

> **Advanced AI-Powered Trading Signal Generator for Deriv Synthetic Markets**

## 🎯 Overview

Emmanuel.AI.Trade is a web-based application that predicts **Boom and Crash price spikes 5 seconds BEFORE they happen** using advanced AI indicator fusion and real-time analysis of Deriv synthetic indices.

The system analyzes 1-minute candles from 6 different Boom/Crash variants (300, 500, 1000) and generates **clear BUY/SELL signals** with audio alerts when pre-spike indicators converge.

**All technical indicators are hidden from the UI** - only actionable signals are displayed.

---

## ✨ Key Features

### 🚀 Pre-Spike Prediction
- Predicts spikes **5 seconds before they happen**
- Uses multi-factor indicator confluence detection
- AI confidence scoring (0-100%)
- Only signals with 3+ confluences are generated

### 📊 Supported Markets
- **BOOM 300** - Low volatility uptrend
- **BOOM 500** - Medium volatility uptrend  
- **BOOM 1000** - High volatility uptrend
- **CRASH 300** - Low volatility downtrend
- **CRASH 500** - Medium volatility downtrend
- **CRASH 1000** - High volatility downtrend

### 🎵 Audio Alerts
- Automatic sound notification on every signal
- Separate buy/sell alert tones
- ~0.8 volume (configurable)

### 🔍 Hidden Analysis
**Indicators analyzed (but NOT shown)**:
- RSI (14-period) - Momentum
- MACD (12,26,9) - Trend confirmation
- Bollinger Bands (20, 2σ) - Squeeze detection
- ATR (14) - Volatility measurement
- Stochastic (14,3,3) - Momentum confirmation
- EMA (9,21) - Trend direction
- VWAP - Price alignment
- Candle Patterns - Support/resistance

### 💻 Clean UI
- Dark/Elite theme (EliteAlgo-inspired)
- Real-time 1-minute candlestick chart
- Signal markers overlaid on chart
- Market selector for all 6 variants
- Connection status indicator

### 🔗 Real-Time Integration
- WebSocket connection to Deriv public API
- Live candle streaming (no API key required)
- 60-candle rolling buffer
- Auto-reconnection on disconnect

---

## 🏗️ Architecture

### Stack
- **Backend**: Node.js + Express.js + TypeScript
- **Frontend**: React + Next.js + TailwindCSS
- **Database**: PostgreSQL
- **Cache**: Redis
- **API**: Deriv WebSocket (public)
- **Real-Time**: WebSocket

### Data Flow
```
Deriv API (candles)
    ↓
Backend WebSocket receiver
    ↓
Candle buffer (60 max)
    ↓
AI Engine (RSI, MACD, BB, ATR, etc.)
    ↓
Confluence detection (3+ confluences)
    ↓
Signal generation (BUY/SELL only)
    ↓
Frontend WebSocket broadcast
    ↓
UI display + Audio alert
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Redis 6+

### Quick Setup (5 minutes)

```bash
# Clone repository
git clone https://github.com/ndumthembu123/Emmanuel.AI.Trade.git
cd Emmanuel.AI.Trade

# Run setup script
bash setup.sh

# OR manual setup:

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev

# Frontend (new terminal)
cd web
npm install
cp .env.local.example .env.local
npm run dev

# Open http://localhost:3000
```

See [SETUP.md](./SETUP.md) for detailed instructions.

---

## 📈 How It Works

### 1. Real-Time Data Collection
- Deriv API streams live 1-minute candles
- Backend maintains rolling buffer (60 candles max per market)
- All 6 markets monitored simultaneously

### 2. Indicator Analysis
The AI engine calculates:

| Indicator | Period | Purpose |
|-----------|--------|---------|
| RSI | 14 | Detect overbought/oversold |
| MACD | 12,26,9 | Confirm trend + divergence |
| Bollinger Bands | 20, 2σ | Identify squeeze patterns |
| ATR | 14 | Measure volatility expansion |
| Stochastic | 14,3,3 | Secondary momentum |
| EMA | 9,21 | Trend direction |
| VWAP | All | Price alignment |
| Patterns | Latest 1-2 | Wick reversals |

### 3. Confluence Detection
Signals only generate when **3+ indicators align** with:
- AI Score > 60/100
- Strong directional bias
- Recent volatility expansion

### 4. Signal Types
- **BUY Signal**: Expected upward spike (green marker)
- **SELL Signal**: Expected downward spike (red marker)

### 5. User Notification
- Visual alert box with signal details
- Audio notification (configurable)
- Entry price and expected direction shown
- 5-second countdown to expected spike

---

## 📊 Signal Example

```json
{
  "type": "BUY",
  "market": "BOOM300",
  "confidence": 85,
  "aiScore": 75,
  "entryPrice": 1000.5432,
  "predictedDirection": "UP",
  "timeUntilSpike": 5000,
  "indicators": {
    "rsi": 28,
    "macd": 0.0125,
    "bollingerBand": "SQUEEZE",
    "atr": 0.42,
    "momentum": 2.8,
    "vwap": 1000.48,
    "ema9": 1000.52,
    "ema21": 1000.38,
    "stochastic": 18
  },
  "audioAlert": "buy"
}
```

---

## 🎮 Usage

### Select Market
Click any of the 6 market buttons to switch analysis:
- BOOM300 / BOOM500 / BOOM1000
- CRASH300 / CRASH500 / CRASH1000

### Toggle Controls
- **🔊 Volume Button**: Enable/disable audio alerts
- **🔔 Notification Button**: Enable/disable browser notifications
- **Connection Status**: Shows real-time connection state

### Monitor Signals
- Watch for alert boxes to appear
- Audio plays automatically
- Entry price and direction displayed
- 5-second countdown to expected spike

### View Chart
- Real-time 1-minute candlesticks
- Signal markers overlaid
- Price grid with labels
- Time axis at bottom

---

## 🔐 Security

### No Authentication Required
- Deriv API is public (no API key needed)
- Works with demo/live accounts
- No personal data collected

### Local Configuration
- All settings stored locally
- No data sent to external services
- WebSocket-only communication

### Production Deployment
- Use HTTPS/WSS for all connections
- Implement rate limiting
- Add authentication layer if needed
- Monitor backend for abuse

---

## 📱 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🧪 Testing

### Test Signal Generation
```bash
curl -X POST http://localhost:5000/api/signals/test \
  -H "Content-Type: application/json" \
  -d '{"market": "BOOM300", "type": "BUY"}'
```

### Check Backend Health
```bash
curl http://localhost:5000/health
```

### View Recent Signals
```bash
curl http://localhost:5000/api/signals/latest
```

See [SETUP.md](./SETUP.md#-testing) for more testing examples.

---

## 📦 Deployment

### Docker
```bash
docker-compose up
```

### Vercel (Frontend)
```bash
vercel deploy
```

### AWS/DigitalOcean (Backend)
```bash
# Push to your server
git push origin main

# SSH and pull latest
ssh user@server
cd Emmanuel.AI.Trade && git pull

# Restart services
sudo systemctl restart emmanuel-backend
```

See [SETUP.md](./SETUP.md#-production-deployment) for detailed deployment guide.

---

## 🛠️ Development

### Project Structure
```
.
├── backend/
│   ├── src/
│   │   ├── signals/
│   │   │   ├── boomCrashAI.ts       # AI engine
│   │   │   ├── supertrend.ts        # SuperTrend logic
│   │   │   └── utBotAlerts.ts       # UT Bot logic
│   │   ├── integrations/
│   │   │   └── derivAPI.ts          # Deriv WebSocket
│   │   ├── routes/
│   │   │   └── signals.ts           # API endpoints
│   │   ├── utils/
│   │   │   ├── database.ts          # PostgreSQL
│   │   │   ├── redis.ts             # Redis cache
│   │   │   └── logger.ts            # Logging
│   │   └── index.ts                 # Main server
│   ├── package.json
│   └── tsconfig.json
│
├── web/
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx             # Dashboard
│   │   ├── components/
│   │   │   ├── BoomCrashChart.tsx   # Chart component
│   │   │   └── BoomCrashSignalDisplay.tsx
│   │   └── public/
│   │       └── sounds/
│   │           ├── buy.mp3
│   │           └── sell.mp3
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── docs/
├── docker-compose.yml
├── SETUP.md                         # Setup guide
├── .env.example                     # Env template
└── README.md                        # This file
```

### Add New Market
Edit `backend/src/signals/boomCrashAI.ts` and `web/src/app/page.tsx`:

```typescript
// backend/src/signals/boomCrashAI.ts
type Market = 'BOOM300' | 'BOOM500' | 'BOOM1000' | 'NEW_MARKET' | ...

// Update Deriv symbol mapping
const symbolMap: { [key: string]: string } = {
  'NEW_MARKET': '1NEWMARKETv',
  ...
};
```

### Modify Indicator Parameters
Edit `backend/src/signals/boomCrashAI.ts`:

```typescript
// Change RSI period
const rsi = calculateRSI(closes, 16); // was 14

// Change confluence threshold
if (aiScore > 70 && signalStrength >= 4) { // was 60 and 3
```

---

## 📊 Statistics & Performance

### Signal Accuracy Metrics
- Track in PostgreSQL `signals` table
- Analyze with SQL queries
- Export to CSV for backtesting

```sql
SELECT symbol, signal_type, COUNT(*) as count
FROM signals
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY symbol, signal_type;
```

---

## ⚠️ Disclaimer

**IMPORTANT**: This application is for **educational and analysis purposes only**.

- Trading involves significant risk
- Past performance ≠ future results
- Always use proper risk management
- Never trade money you can't afford to lose
- Start with demo accounts
- Backtest signals before live trading

---

## 🤝 Contributing

Found a bug? Have a feature request? 

1. Open an issue: https://github.com/ndumthembu123/Emmanuel.AI.Trade/issues
2. Describe the problem with details
3. Include screenshots if applicable

---

## 📞 Support

- **Documentation**: See [SETUP.md](./SETUP.md)
- **Issues**: https://github.com/ndumthembu123/Emmanuel.AI.Trade/issues
- **Email**: support@emmanuel.ai

---

## 📄 License

**PROPRIETARY** - Emmanuel.AI.Trade © 2026

All rights reserved. Unauthorized copying, distribution, or modification is prohibited.

---

## 🙏 Acknowledgments

- Deriv for public market API
- TradingView for chart inspiration
- Technical analysis community

---

**Built with ❤️ for traders**

Last Updated: July 22, 2026 | Version: 1.0.0
