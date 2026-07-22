'use client';

import React, { useState } from 'react';
import BoomCrashSignalDisplay from '@/components/BoomCrashSignalDisplay';
import BoomCrashChart from '@/components/BoomCrashChart';
import { Radio, Volume2, Bell } from 'lucide-react';

type Market = 'BOOM300' | 'BOOM500' | 'BOOM1000' | 'CRASH300' | 'CRASH500' | 'CRASH1000';

const MARKETS: Market[] = ['BOOM300', 'BOOM500', 'BOOM1000', 'CRASH300', 'CRASH500', 'CRASH1000'];
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

export default function Home() {
  const [selectedMarket, setSelectedMarket] = useState<Market>('BOOM300');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const isBoom = selectedMarket.includes('BOOM');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-700/50 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-start md:items-center gap-4">
            {/* Logo & Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                Emmanuel.AI.Trade
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Deriv Boom/Crash Pre-Spike Predictor | AI-Powered Analysis
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700 text-sm">
                <Radio size={16} className={isBoom ? 'text-blue-400' : 'text-red-400'} />
                <span className="text-slate-300">
                  {isBoom ? '📈 Live Boom' : '📉 Live Crash'}
                </span>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition border ${
                  soundEnabled
                    ? 'bg-slate-700 border-slate-600 text-slate-200'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title="Toggle Sound Alerts"
              >
                <Volume2 size={18} />
              </button>

              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`p-2 rounded-lg transition border ${
                  notificationsEnabled
                    ? 'bg-slate-700 border-slate-600 text-slate-200'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
                title="Toggle Notifications"
              >
                <Bell size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Market Selector */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            📊 Select Market
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {MARKETS.map((mkt) => (
              <button
                key={mkt}
                onClick={() => setSelectedMarket(mkt)}
                className={`p-3 rounded-lg font-semibold transition border-2 text-sm md:text-base ${
                  selectedMarket === mkt
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {mkt}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Signal Display (Left - 2 cols on desktop) */}
          <div className="lg:col-span-2">
            <div className="h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-2xl">
              <BoomCrashSignalDisplay market={selectedMarket} wsUrl={WS_URL} />
            </div>
          </div>

          {/* Sidebar Info (Right) */}
          <div className="space-y-4">
            {/* Market Stats Card */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-4 shadow-lg">
              <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="text-lg">ℹ️</span> Market Info
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Market Type</p>
                  <p className="font-semibold text-white text-lg">
                    {isBoom ? '📈 Boom' : '📉 Crash'}
                  </p>
                </div>
                <hr className="border-slate-700" />
                <div>
                  <p className="text-slate-400 text-xs mb-1">Timeframe</p>
                  <p className="font-semibold text-white">1 Minute</p>
                </div>
                <hr className="border-slate-700" />
                <div>
                  <p className="text-slate-400 text-xs mb-1">Analysis Engine</p>
                  <p className="font-semibold text-cyan-400">AI Confluence Detector</p>
                </div>
                <hr className="border-slate-700" />
                <div>
                  <p className="text-slate-400 text-xs mb-1">Feed Source</p>
                  <p className="font-semibold text-white">Deriv Public API</p>
                </div>
              </div>
            </div>

            {/* Signal Legend */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-4 shadow-lg">
              <h3 className="font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span className="text-lg">📍</span> Signal Legend
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-xs">▲</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-semibold">BUY Signal</p>
                    <p className="text-slate-500 text-xs">Price expected to go UP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                    <span className="text-xs">▼</span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-semibold">SELL Signal</p>
                    <p className="text-slate-500 text-xs">Price expected to go DOWN</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-blue-900/20 rounded-lg border border-blue-500/30 p-4">
              <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <span className="text-lg">⚡</span> Features
              </h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Predicts spikes 5s BEFORE they happen</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Audio alerts on every signal</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span>AI confidence score (0-100%)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span>All indicators hidden from view</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-400">✓</span>
                  <span>Real-time 1-minute candles</span>
                </li>
              </ul>
            </div>

            {/* Tips */}
            <div className="bg-amber-900/20 rounded-lg border border-amber-500/30 p-4">
              <h3 className="font-semibold text-amber-400 mb-3">💡 Pro Tips</h3>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• Watch for green/red candles forming</li>
                <li>• Higher confidence = stronger move</li>
                <li>• Act within the 5s window</li>
                <li>• Trade during active hours</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-8">
          <BoomCrashChart
            market={selectedMarket}
            candles={[]}
            signals={[]}
            height={350}
            wsUrl={WS_URL}
          />
        </div>

        {/* How It Works */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl mb-2">🔍</div>
            <h4 className="font-semibold text-slate-200 mb-2">Scan</h4>
            <p className="text-xs text-slate-400">
              AI analyzes RSI, MACD, Bollinger Bands, ATR, VWAP, and Stochastic indicators in real-time.
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-semibold text-slate-200 mb-2">Detect</h4>
            <p className="text-xs text-slate-400">
              When 3+ indicators converge with high confidence, a pre-spike signal is generated.
            </p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg border border-slate-700 p-4">
            <div className="text-2xl mb-2">🔊</div>
            <h4 className="font-semibold text-slate-200 mb-2">Alert</h4>
            <p className="text-xs text-slate-400">
              Audio notification plays and signal appears on screen with entry price and direction.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-2">📞 Support</p>
              <p className="text-xs text-slate-500">
                For technical issues, please contact support@emmanuel.ai
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300 mb-2">⚠️ Disclaimer</p>
              <p className="text-xs text-slate-500">
                Trading involves risk. Past performance is not indicative of future results.
              </p>
            </div>
          </div>
          <div className="text-center border-t border-slate-700/50 pt-4">
            <p className="text-xs text-slate-600">
              Emmanuel.AI.Trade © 2026 | Real-time Deriv Market Analysis | v1.0.0
            </p>
          </div>
        </div>
      </footer>

      {/* Audio Elements for Alerts */}
      <audio id="buy-alert" preload="auto" />
      <audio id="sell-alert" preload="auto" />
    </div>
  );
}
