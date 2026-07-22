# Emmanuel.AI.Trade - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/emmanuel_db

# Redis
REDIS_URL=redis://localhost:6379

# Deriv API (public, no key needed)
DERIV_API_URL=wss://ws.derivws.com/websockets/v3
EOF

# Create PostgreSQL database
createdb emmanuel_db

# Start backend
npm run dev
```

**Backend runs on:** `http://localhost:5000`
**WebSocket:** `ws://localhost:5000`

### 2. Frontend Setup

```bash
cd web
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_WS_URL=ws://localhost:5000
EOF

# Start frontend
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

---

## 📊 Architecture

```
User → Frontend (React/Next.js)
         ↓
      WebSocket Connection
         ↓
Backend (Node.js/Express)
         ↓
    ┌────┴─────┬──────────┬──────────┐
    ↓          ↓          ↓          ↓
  Deriv API  PostgreSQL  Redis    Signal Engine
    |          |          |          |
    └────┬─────┴──────────┴──────────┘
         ↓
   Real-Time Signals
   (BUY/SELL only)
```

---

## 🔄 Signal Generation Flow

1. **Deriv API** streams 1-minute candles
2. **Backend** receives candle data for all 6 markets
3. **AI Engine** analyzes:
   - RSI (14-period)
   - MACD (12,26,9)
   - Bollinger Bands (20, 2σ)
   - ATR (14)
   - Stochastic (14,3,3)
   - EMA (9,21)
   - VWAP
   - Candle Patterns
4. **Confluence Detection**: If 3+ indicators align + AI score > 60 → Signal generated
5. **WebSocket Broadcast** to frontend
6. **Audio Alert** plays (buy.mp3 / sell.mp3)
7. **Signal Display** shows only BUY or SELL (no indicators shown)

---

## 🎵 Audio Files

Place these in `web/public/sounds/`:

### buy.mp3
- Upward tone (high pitch)
- 1-2 seconds
- ~0.8 volume

### sell.mp3  
- Downward tone (low pitch)
- 1-2 seconds
- ~0.8 volume

You can use online tools to generate:
- https://www.bfxr.net/ (retro sound effects)
- https://www.zapsplat.com/ (free sound effects)

---

## 📈 Supported Markets

| Market | Type | Volatility | Best For |
|--------|------|-----------|----------|
| BOOM300 | Uptrend synthetic | Low-Medium | Quiet periods |
| BOOM500 | Uptrend synthetic | Medium | Standard |
| BOOM1000 | Uptrend synthetic | High | Aggressive |
| CRASH300 | Downtrend synthetic | Low-Medium | Quiet periods |
| CRASH500 | Downtrend synthetic | Medium | Standard |
| CRASH1000 | Downtrend synthetic | High | Aggressive |

---

## 🔑 API Endpoints

### Get Latest Signals
```bash
GET /api/signals/latest
```

Response:
```json
{
  "success": true,
  "count": 5,
  "signals": [
    {
      "symbol": "BOOM300",
      "signal_type": "BUY",
      "entry_price": 100.5432,
      "strength": 85,
      "created_at": "2026-07-22T19:45:23Z"
    }
  ]
}
```

### Get Market-Specific Signals
```bash
GET /api/signals/market/BOOM300
```

### Get Statistics
```bash
GET /api/signals/stats
```

### Test Signal (Development)
```bash
POST /api/signals/test
Content-Type: application/json

{
  "market": "BOOM300",
  "type": "BUY"
}
```

---

## 🌐 WebSocket Events

### Client → Server
```json
{
  "action": "subscribe",
  "market": "BOOM300"
}
```

### Server → Client (Signal)
```json
{
  "type": "SIGNAL",
  "market": "BOOM300",
  "signal": {
    "type": "BUY",
    "confidence": 85,
    "aiScore": 75,
    "entryPrice": 100.5432,
    "predictedDirection": "UP",
    "timeUntilSpike": 5000,
    "audioAlert": "buy"
  }
}
```

### Server → Client (Candles)
```json
{
  "type": "CANDLES",
  "market": "BOOM300",
  "data": [
    {
      "open": 100.12,
      "high": 100.45,
      "low": 100.05,
      "close": 100.38,
      "volume": 0,
      "timestamp": 1695033600000
    }
  ]
}
```

---

## 🚨 Signal Confidence Thresholds

| Confidence | Meaning | Strength |
|------------|---------|----------|
| 60-70% | Moderate | 1/3 |
| 70-80% | Strong | 2/3 |
| 80-95% | Very Strong | 3/3 |

**Rule**: Only signals with 3+ indicator confluences generate alerts.

---

## 🔧 Configuration

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/emmanuel_db

# Redis
REDIS_URL=redis://localhost:6379

# Deriv
DERIV_API_URL=wss://ws.derivws.com/websockets/v3
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

---

## 📊 Database Schema

### signals table
```sql
CREATE TABLE signals (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL,
  signal_type VARCHAR(10) NOT NULL,
  entry_price DECIMAL(20, 8),
  tp1_price DECIMAL(20, 8),
  tp2_price DECIMAL(20, 8),
  tp3_price DECIMAL(20, 8),
  sl_price DECIMAL(20, 8),
  strength INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signals_symbol ON signals(symbol, timeframe);
```

---

## 🐳 Docker Deployment

### Build Images
```bash
# Backend
cd backend
docker build -t emmanuel-backend:1.0.0 .

# Frontend
cd web
docker build -t emmanuel-web:1.0.0 .
```

### Docker Compose
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: emmanuel_db
      POSTGRES_PASSWORD: secure_password
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://postgres:secure_password@postgres:5432/emmanuel_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  web:
    build: ./web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_WS_URL: ws://localhost:5000
    depends_on:
      - backend
```

---

## 🧪 Testing

### Test Backend
```bash
cd backend
npm run dev
curl http://localhost:5000/health
```

### Test Signal Generation
```bash
curl -X POST http://localhost:5000/api/signals/test \
  -H "Content-Type: application/json" \
  -d '{"market": "BOOM300", "type": "BUY"}'
```

### Test WebSocket
```bash
websocat ws://localhost:5000
# Subscribe to market
{"action": "subscribe", "market": "BOOM300"}
```

---

## 🚀 Production Deployment

### Recommended Stack
- **Server**: AWS EC2 / DigitalOcean / Linode
- **Database**: AWS RDS PostgreSQL
- **Cache**: AWS ElastiCache Redis
- **Frontend**: Vercel / Netlify
- **Monitoring**: DataDog / New Relic

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod.db.host/emmanuel_db
REDIS_URL=redis://prod.redis.host:6379
PORT=5000
```

### Health Checks
```bash
# Backend health
GET /health

# Database connection
GET /api/signals/latest (should return 200)
```

---

## 📱 Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 🐛 Troubleshooting

### WebSocket Connection Failed
```
Check:
- Backend is running on correct port
- NEXT_PUBLIC_WS_URL matches backend URL
- Firewall allows WebSocket connections
```

### No Signals Generated
```
Check:
- Deriv API connection is active
- Candle buffer has 30+ candles
- AI score > 60 with 3+ confluences
- Check backend logs for errors
```

### Audio Not Playing
```
Check:
- buy.mp3 and sell.mp3 exist in web/public/sounds/
- Browser audio permissions are granted
- Sound is not muted in browser
```

---

## 📝 License

PROPRIETARY - Emmanuel.AI.Trade © 2026

---

## 🤝 Support

For issues or questions:
- GitHub Issues: https://github.com/ndumthembu123/Emmanuel.AI.Trade/issues
- Email: support@emmanuel.ai

---

**Last Updated**: July 22, 2026
**Version**: 1.0.0
