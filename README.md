# Emmanuel.AI.Trade - Advanced Trading Signals Mobile App

Professional trading signals application with UT Bot Alerts entry logic and SuperTrend take-profit management.

## Core Features

- Real-time trading signals (Gold, NAS100, US30, S&P500)
- UT Bot Alerts logic for Buy/Sell entries with star ratings
- SuperTrend-powered take-profit levels and trailing stops
- License system with IP/device binding
- Mobile (React Native) + Web (Next.js PWA)
- Dark-mode premium UI (EliteAlgo-inspired)
- Push & email alerts
- WebSocket real-time updates

## Quick Start

```bash
git clone https://github.com/ndumthembu123/Emmanuel.AI.Trade.git
cd Emmanuel.AI.Trade
npm run setup
npm run dev:backend
npm run dev:web
npm run dev:mobile
```

## Directory Structure

```
.
├── backend/          # Node.js + Express API
├── mobile/           # React Native (Expo)
├── web/              # Next.js PWA
└── docs/             # Documentation
```

## License System

1. Admin generates passkeys
2. Users activate with email + passkey
3. IP/device binding on first activation
4. One-time use per device

## Supported Markets

- Gold/USD
- NAS100 (NS1000)
- US30
- S&P500

## Timeframes

- 15m
- 30m

## License

PROPRIETARY - Emmanuel.AI.Trade © 2026
