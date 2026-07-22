'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Volume2, TrendingUp, TrendingDown } from 'lucide-react';

interface Signal {
  type: 'BUY' | 'SELL';
  market: string;
  confidence: number;
  aiScore: number;
  entryPrice: number;
  predictedDirection: 'UP' | 'DOWN';
  timeUntilSpike: number;
  audioAlert: 'buy' | 'sell';
  timestamp?: number;
}

interface BoomCrashSignalDisplayProps {
  market: 'BOOM300' | 'BOOM500' | 'BOOM1000' | 'CRASH300' | 'CRASH500' | 'CRASH1000';
  wsUrl?: string;
}

const BoomCrashSignalDisplay: React.FC<BoomCrashSignalDisplayProps> = ({
  market,
  wsUrl = 'ws://localhost:5000'
}) => {
  const [signal, setSignal] = useState<Signal | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Play audio alert
  const playAudioAlert = (alertType: 'buy' | 'sell') => {
    try {
      const audioElement = new Audio(`/sounds/${alertType}.mp3`);
      audioElement.volume = 0.8;
      audioElement.play().catch(err => console.error('Audio play error:', err));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  // Connect to WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log(`✅ Connected to ${market} signals`);
          setIsConnected(true);
          // Subscribe to market
          wsRef.current?.send(
            JSON.stringify({
              action: 'subscribe',
              market
            })
          );
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'SIGNAL' && data.market === market) {
              const newSignal = {
                ...data.signal,
                timestamp: Date.now()
              };

              setSignal(newSignal);
              setShowAlert(true);

              // Play audio alert
              playAudioAlert(data.signal.audioAlert);

              // Auto-hide alert after 10 seconds
              if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
              }
              notificationTimeoutRef.current = setTimeout(() => {
                setShowAlert(false);
              }, 10000);

              console.log('🚨 NEW SIGNAL:', newSignal);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current.onclose = () => {
          console.log('WebSocket disconnected, reconnecting in 5s...');
          setIsConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [market, wsUrl]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4">
      {/* Connection Status */}
      <div className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium text-slate-300">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Market Display */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          {market}
        </h1>
        <p className="text-center text-slate-400 text-sm mt-2">1-Minute Timeframe</p>
      </div>

      {/* Signal Alert */}
      {showAlert && signal && (
        <div
          className={`mb-8 p-6 rounded-2xl border-2 backdrop-blur-xl transform transition-all duration-300 ${
            signal.type === 'BUY'
              ? 'bg-green-900/30 border-green-500/50 shadow-lg shadow-green-500/20'
              : 'bg-red-900/30 border-red-500/50 shadow-lg shadow-red-500/20'
          }`}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className={`mt-1 ${signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
              {signal.type === 'BUY' ? (
                <TrendingUp size={32} className="animate-bounce" />
              ) : (
                <TrendingDown size={32} className="animate-bounce" />
              )}
            </div>

            {/* Signal Details */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`text-2xl font-bold ${
                    signal.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {signal.type} SIGNAL
                </span>
                <Volume2 size={24} className="text-yellow-400 animate-pulse" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Confidence</span>
                  <p className="text-lg font-semibold text-white">
                    {Math.round(signal.confidence)}%
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">AI Score</span>
                  <p className="text-lg font-semibold text-white">
                    {Math.round(signal.aiScore)}/100
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Entry Price</span>
                  <p className="text-lg font-semibold text-white">
                    {signal.entryPrice.toFixed(4)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Expected Direction</span>
                  <p className="text-lg font-semibold text-white">
                    {signal.predictedDirection === 'UP' ? '📈 UP' : '📉 DOWN'}
                  </p>
                </div>
              </div>

              {/* Spike Timer */}
              <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Spike Expected In</p>
                <p className="text-xl font-bold text-yellow-400">
                  {Math.ceil(signal.timeUntilSpike / 1000)}s
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Signal State */}
      {!signal && (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-slate-600 mb-4 opacity-50" />
          <p className="text-slate-400 text-lg">
            Analyzing market...
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Waiting for pre-spike indicators to converge
          </p>
        </div>
      )}

      {/* Recent Signals History */}
      <div className="mt-auto w-full max-w-2xl">
        <h3 className="text-slate-400 text-sm font-semibold mb-3">Latest Signals</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {signal && (
            <div
              className={`p-3 rounded-lg border text-sm ${
                signal.type === 'BUY'
                  ? 'bg-green-900/20 border-green-500/30 text-green-300'
                  : 'bg-red-900/20 border-red-500/30 text-red-300'
              }`}
            >
              <span className="font-semibold">{signal.type}</span>
              {' '} @ {signal.entryPrice.toFixed(4)}
              {' '}
              <span className="text-xs text-slate-400">
                {new Date(signal.timestamp || 0).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default BoomCrashSignalDisplay;
