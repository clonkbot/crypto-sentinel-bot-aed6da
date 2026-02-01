import React, { useState, useEffect, useCallback } from 'react';

// Types
interface XHandle {
  id: string;
  handle: string;
  displayName: string;
  avatar: string;
  verified: boolean;
}

interface DetectedTicker {
  id: string;
  ticker: string;
  source: string;
  timestamp: Date;
  postContent: string;
  confidence: number;
  virality: number;
  trend: 'up' | 'down' | 'neutral';
  mentions: number;
}

interface Trade {
  id: string;
  ticker: string;
  type: 'buy' | 'sell';
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: Date;
}

interface TradingSettings {
  autoTrade: boolean;
  positionSize: number;
  takeProfit: number;
  stopLoss: number;
  minConfidence: number;
}

// Mock data generators
const generateMockHandles = (): XHandle[] => [
  { id: '1', handle: 'elonmusk', displayName: 'Elon Musk', avatar: '🚀', verified: true },
  { id: '2', handle: 'VitalikButerin', displayName: 'vitalik.eth', avatar: '⟠', verified: true },
  { id: '3', handle: 'caboraXBT', displayName: 'Cabo Ra', avatar: '🐋', verified: true },
  { id: '4', handle: 'CryptoKaleo', displayName: 'Kaleo', avatar: '📊', verified: false },
];

const tickers = ['$BTC', '$ETH', '$SOL', '$DOGE', '$PEPE', '$WIF', '$BONK', '$JUP', '$ARB', '$OP', '$AVAX', '$MATIC'];
const posts = [
  'Just loaded up on more {ticker} 🔥 This is the play.',
  '{ticker} looking incredibly bullish here. NFA but I\'m accumulating.',
  'The {ticker} chart is speaking to me. Breakout imminent.',
  'Everyone sleeping on {ticker} right now. Generational opportunity.',
  '{ticker} about to send it. Mark my words.',
  'Massive whale accumulation on {ticker}. Something brewing.',
];

const generateRandomTicker = (handles: XHandle[]): DetectedTicker => {
  const ticker = tickers[Math.floor(Math.random() * tickers.length)];
  const source = handles[Math.floor(Math.random() * handles.length)];
  const post = posts[Math.floor(Math.random() * posts.length)].replace('{ticker}', ticker);
  
  return {
    id: Math.random().toString(36).substring(7),
    ticker,
    source: source.handle,
    timestamp: new Date(),
    postContent: post,
    confidence: Math.floor(Math.random() * 40) + 60,
    virality: Math.floor(Math.random() * 100),
    trend: ['up', 'down', 'neutral'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'neutral',
    mentions: Math.floor(Math.random() * 50000) + 1000,
  };
};

// Components
const ScanLine: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
    <div 
      className="absolute w-full h-1 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent"
      style={{ animation: 'scan-line 4s linear infinite' }}
    />
  </div>
);

const GlowingBorder: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-xl opacity-20 blur-sm" />
    <div className="relative glass-card rounded-xl">{children}</div>
  </div>
);

const AnimatedGauge: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 100);
    return () => clearTimeout(timer);
  }, [value]);
  
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="56"
            cy="56"
            r="45"
            stroke={`url(#gradient-${label})`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 10px ${color})` }}
          />
          <defs>
            <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-orbitron text-2xl font-bold" style={{ color, textShadow: `0 0 20px ${color}` }}>
            {animatedValue}%
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-2 uppercase tracking-widest">{label}</span>
    </div>
  );
};

const ConfidenceMeter: React.FC<{ confidence: number }> = ({ confidence }) => {
  const [animatedConf, setAnimatedConf] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedConf(confidence), 100);
    return () => clearTimeout(timer);
  }, [confidence]);
  
  const getColor = () => {
    if (confidence >= 80) return '#00ff88';
    if (confidence >= 60) return '#00f0ff';
    if (confidence >= 40) return '#f0f000';
    return '#ff4466';
  };
  
  return (
    <div className="relative">
      <div className="text-center mb-4">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">AI Confidence Score</div>
        <div 
          className="font-orbitron text-6xl font-black transition-all duration-1000"
          style={{ 
            color: getColor(),
            textShadow: `0 0 30px ${getColor()}, 0 0 60px ${getColor()}40`,
            animation: 'flicker 3s infinite'
          }}
        >
          {animatedConf}%
        </div>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${animatedConf}%`,
            background: `linear-gradient(90deg, ${getColor()}80, ${getColor()})`,
            boxShadow: `0 0 20px ${getColor()}, inset 0 0 10px rgba(255,255,255,0.3)`
          }}
        />
      </div>
    </div>
  );
};

const XHandleMonitor: React.FC<{
  handles: XHandle[];
  onAddHandle: (handle: string) => void;
  onRemoveHandle: (id: string) => void;
}> = ({ handles, onAddHandle, onRemoveHandle }) => {
  const [newHandle, setNewHandle] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHandle.trim()) {
      onAddHandle(newHandle.trim().replace('@', ''));
      setNewHandle('');
    }
  };
  
  return (
    <GlowingBorder className="h-full">
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-lg">𝕏</span>
          </div>
          <h2 className="font-orbitron text-sm font-semibold tracking-wider text-cyan-400">HANDLE MONITOR</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="@handle"
              className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-lg text-sm font-semibold hover:from-cyan-500 hover:to-cyan-400 transition-all hover:shadow-lg hover:shadow-cyan-500/25"
            >
              + ADD
            </button>
          </div>
        </form>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {handles.map((handle, i) => (
            <div
              key={handle.id}
              className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-800 hover:border-cyan-500/30 transition-all group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl">
                {handle.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-gray-200 truncate">{handle.displayName}</span>
                  {handle.verified && <span className="text-cyan-400 text-xs">✓</span>}
                </div>
                <div className="text-xs text-gray-500 font-mono">@{handle.handle}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <button
                  onClick={() => onRemoveHandle(handle.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Monitoring</span>
            <span className="text-cyan-400 font-mono">{handles.length} handles</span>
          </div>
        </div>
      </div>
    </GlowingBorder>
  );
};

const TickerFeed: React.FC<{ tickers: DetectedTicker[] }> = ({ tickers: detectedTickers }) => (
  <GlowingBorder className="h-full">
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <span className="text-lg">◎</span>
        </div>
        <h2 className="font-orbitron text-sm font-semibold tracking-wider text-purple-400">LIVE TICKER FEED</h2>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs text-red-400 font-mono">LIVE</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {detectedTickers.slice(0, 10).map((ticker, i) => (
          <div
            key={ticker.id}
            className="p-3 bg-gray-900/30 rounded-lg border border-gray-800 hover:border-purple-500/30 transition-all"
            style={{ 
              animation: i === 0 ? 'pulse-glow 2s ease-in-out' : undefined,
              animationIterationCount: i === 0 ? 1 : undefined
            }}
          >
            <div className="flex items-start gap-3">
              <div className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded border border-yellow-500/30">
                <span className="font-orbitron text-sm font-bold text-yellow-400">{ticker.ticker}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 line-clamp-2">{ticker.postContent}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="font-mono">@{ticker.source}</span>
                  <span>•</span>
                  <span>{ticker.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-orbitron font-bold ${
                  ticker.confidence >= 70 ? 'text-green-400' : ticker.confidence >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {ticker.confidence}%
                </div>
                <div className="text-xs text-gray-500">conf.</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </GlowingBorder>
);

const AnalysisDashboard: React.FC<{ selectedTicker: DetectedTicker | null }> = ({ selectedTicker }) => {
  if (!selectedTicker) {
    return (
      <GlowingBorder className="h-full">
        <div className="p-5 h-full flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
            <span className="text-4xl opacity-30">📊</span>
          </div>
          <p className="text-gray-500 text-center">Select a ticker from the feed<br />to view detailed analysis</p>
        </div>
      </GlowingBorder>
    );
  }
  
  return (
    <GlowingBorder className="h-full">
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
            <h2 className="font-orbitron text-sm font-semibold tracking-wider text-green-400">AI ANALYSIS</h2>
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
            <span className="font-orbitron text-xl font-bold text-yellow-400">{selectedTicker.ticker}</span>
          </div>
        </div>
        
        <div className="mb-6">
          <ConfidenceMeter confidence={selectedTicker.confidence} />
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <AnimatedGauge value={selectedTicker.virality} label="Virality" color="#a855f7" />
          <AnimatedGauge 
            value={selectedTicker.trend === 'up' ? 85 : selectedTicker.trend === 'down' ? 25 : 50} 
            label="Trend" 
            color={selectedTicker.trend === 'up' ? '#00ff88' : selectedTicker.trend === 'down' ? '#ff4466' : '#f0f000'} 
          />
          <AnimatedGauge value={Math.min(100, Math.floor(selectedTicker.mentions / 500))} label="Mentions" color="#00f0ff" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Social Mentions</div>
            <div className="font-orbitron text-2xl font-bold text-cyan-400">
              {selectedTicker.mentions.toLocaleString()}
            </div>
          </div>
          <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trend Direction</div>
            <div className={`font-orbitron text-2xl font-bold flex items-center gap-2 ${
              selectedTicker.trend === 'up' ? 'text-green-400' : selectedTicker.trend === 'down' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {selectedTicker.trend === 'up' ? '↑ BULLISH' : selectedTicker.trend === 'down' ? '↓ BEARISH' : '→ NEUTRAL'}
            </div>
          </div>
        </div>
      </div>
    </GlowingBorder>
  );
};

const TradingPanel: React.FC<{
  settings: TradingSettings;
  onSettingsChange: (settings: TradingSettings) => void;
  trades: Trade[];
  onExecuteTrade: (ticker: string, type: 'buy' | 'sell') => void;
  selectedTicker: DetectedTicker | null;
}> = ({ settings, onSettingsChange, trades, onExecuteTrade, selectedTicker }) => (
  <GlowingBorder className="h-full">
    <div className="p-5 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <span className="text-lg">⚡</span>
        </div>
        <h2 className="font-orbitron text-sm font-semibold tracking-wider text-orange-400">AUTO-TRADING</h2>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg border border-gray-800">
          <span className="text-gray-300">Auto-Trade</span>
          <button
            onClick={() => onSettingsChange({ ...settings, autoTrade: !settings.autoTrade })}
            className={`relative w-14 h-7 rounded-full transition-all ${
              settings.autoTrade 
                ? 'bg-gradient-to-r from-green-600 to-green-500 shadow-lg shadow-green-500/30' 
                : 'bg-gray-700'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
              settings.autoTrade ? 'left-8' : 'left-1'
            }`} />
          </button>
        </div>
        
        <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Position Size</span>
            <span className="font-mono text-cyan-400">${settings.positionSize}</span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={settings.positionSize}
            onChange={(e) => onSettingsChange({ ...settings, positionSize: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Take Profit</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.takeProfit}
                onChange={(e) => onSettingsChange({ ...settings, takeProfit: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent font-mono text-green-400 text-lg focus:outline-none"
              />
              <span className="text-gray-500">%</span>
            </div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-800">
            <div className="text-xs text-gray-500 mb-1">Stop Loss</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.stopLoss}
                onChange={(e) => onSettingsChange({ ...settings, stopLoss: parseInt(e.target.value) || 0 })}
                className="w-full bg-transparent font-mono text-red-400 text-lg focus:outline-none"
              />
              <span className="text-gray-500">%</span>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Min Confidence</span>
            <span className="font-mono text-purple-400">{settings.minConfidence}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="95"
            step="5"
            value={settings.minConfidence}
            onChange={(e) => onSettingsChange({ ...settings, minConfidence: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
      
      {selectedTicker && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onExecuteTrade(selectedTicker.ticker, 'buy')}
            className="py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-lg font-orbitron font-semibold hover:from-green-500 hover:to-green-400 transition-all hover:shadow-lg hover:shadow-green-500/30"
          >
            BUY {selectedTicker.ticker}
          </button>
          <button
            onClick={() => onExecuteTrade(selectedTicker.ticker, 'sell')}
            className="py-3 bg-gradient-to-r from-red-600 to-red-500 rounded-lg font-orbitron font-semibold hover:from-red-500 hover:to-red-400 transition-all hover:shadow-lg hover:shadow-red-500/30"
          >
            SELL {selectedTicker.ticker}
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Active Trades</div>
        <div className="space-y-2">
          {trades.slice(0, 5).map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-2 bg-gray-900/20 rounded border border-gray-800">
              <div className="flex items-center gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded ${trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {trade.type.toUpperCase()}
                </span>
                <span className="font-mono text-sm text-gray-300">{trade.ticker}</span>
              </div>
              <span className={`font-mono text-sm ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trade.pnl >= 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
              </span>
            </div>
          ))}
          {trades.length === 0 && (
            <div className="text-center text-gray-600 py-4 text-sm">No active trades</div>
          )}
        </div>
      </div>
    </div>
  </GlowingBorder>
);

const PerformanceStats: React.FC<{ trades: Trade[] }> = ({ trades }) => {
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <GlowingBorder>
        <div className="p-4 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Win Rate</div>
          <div className="font-orbitron text-3xl font-bold text-cyan-400" style={{ textShadow: '0 0 20px rgba(0, 240, 255, 0.5)' }}>
            {winRate.toFixed(1)}%
          </div>
        </div>
      </GlowingBorder>
      
      <GlowingBorder>
        <div className="p-4 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total P&L</div>
          <div className={`font-orbitron text-3xl font-bold ${totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`} 
               style={{ textShadow: `0 0 20px ${totalPnl >= 0 ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 68, 102, 0.5)'}` }}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </div>
        </div>
      </GlowingBorder>
      
      <GlowingBorder>
        <div className="p-4 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Trades</div>
          <div className="font-orbitron text-3xl font-bold text-purple-400" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
            {trades.length}
          </div>
        </div>
      </GlowingBorder>
      
      <GlowingBorder>
        <div className="p-4 text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tickers Detected</div>
          <div className="font-orbitron text-3xl font-bold text-yellow-400" style={{ textShadow: '0 0 20px rgba(250, 204, 21, 0.5)' }}>
            {new Set(trades.map(t => t.ticker)).size}
          </div>
        </div>
      </GlowingBorder>
    </div>
  );
};

const App: React.FC = () => {
  const [handles, setHandles] = useState<XHandle[]>(generateMockHandles());
  const [detectedTickers, setDetectedTickers] = useState<DetectedTicker[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<DetectedTicker | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState<TradingSettings>({
    autoTrade: false,
    positionSize: 1000,
    takeProfit: 25,
    stopLoss: 10,
    minConfidence: 70,
  });
  
  const addHandle = useCallback((handle: string) => {
    const newHandle: XHandle = {
      id: Math.random().toString(36).substring(7),
      handle,
      displayName: handle,
      avatar: ['🐋', '📊', '🚀', '💎', '🔥'][Math.floor(Math.random() * 5)],
      verified: Math.random() > 0.5,
    };
    setHandles(prev => [...prev, newHandle]);
  }, []);
  
  const removeHandle = useCallback((id: string) => {
    setHandles(prev => prev.filter(h => h.id !== id));
  }, []);
  
  const executeTrade = useCallback((ticker: string, type: 'buy' | 'sell') => {
    const entryPrice = Math.random() * 100 + 10;
    const pnlPercent = (Math.random() - 0.4) * 30;
    const newTrade: Trade = {
      id: Math.random().toString(36).substring(7),
      ticker,
      type,
      amount: settings.positionSize / entryPrice,
      entryPrice,
      currentPrice: entryPrice * (1 + pnlPercent / 100),
      pnl: settings.positionSize * (pnlPercent / 100),
      pnlPercent,
      timestamp: new Date(),
    };
    setTrades(prev => [newTrade, ...prev]);
  }, [settings.positionSize]);
  
  // Simulate new ticker detection
  useEffect(() => {
    if (handles.length === 0) return;
    
    const interval = setInterval(() => {
      const newTicker = generateRandomTicker(handles);
      setDetectedTickers(prev => [newTicker, ...prev.slice(0, 49)]);
      
      // Auto-select the new ticker
      setSelectedTicker(newTicker);
      
      // Auto-trade if enabled and confidence is high enough
      if (settings.autoTrade && newTicker.confidence >= settings.minConfidence) {
        executeTrade(newTicker.ticker, 'buy');
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [handles, settings.autoTrade, settings.minConfidence, executeTrade]);
  
  // Generate initial tickers
  useEffect(() => {
    const initialTickers = Array.from({ length: 5 }, () => generateRandomTicker(handles));
    setDetectedTickers(initialTickers);
    setSelectedTicker(initialTickers[0]);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-950 text-white grid-bg relative overflow-hidden">
      <ScanLine />
      
      {/* Matrix rain overlay */}
      <div className="fixed inset-0 matrix-rain pointer-events-none opacity-30" />
      
      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                  🤖
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-950 animate-pulse" />
              </div>
              <div>
                <h1 className="font-orbitron text-3xl font-black tracking-wider">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">CRYPTO</span>
                  <span className="text-white"> SENTINEL</span>
                </h1>
                <p className="text-gray-500 text-sm tracking-widest">AI-POWERED TRADING INTELLIGENCE</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-lg border border-gray-800">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-gray-400">System Online</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Last Scan</div>
                <div className="font-mono text-cyan-400">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Performance Stats */}
        <div className="mb-6">
          <PerformanceStats trades={trades} />
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 mb-6" style={{ minHeight: '600px' }}>
          {/* X Handle Monitor */}
          <div className="col-span-12 lg:col-span-3">
            <XHandleMonitor
              handles={handles}
              onAddHandle={addHandle}
              onRemoveHandle={removeHandle}
            />
          </div>
          
          {/* Ticker Feed */}
          <div className="col-span-12 lg:col-span-3">
            <TickerFeed tickers={detectedTickers} />
          </div>
          
          {/* Analysis Dashboard */}
          <div className="col-span-12 lg:col-span-3">
            <AnalysisDashboard selectedTicker={selectedTicker} />
          </div>
          
          {/* Trading Panel */}
          <div className="col-span-12 lg:col-span-3">
            <TradingPanel
              settings={settings}
              onSettingsChange={setSettings}
              trades={trades}
              onExecuteTrade={executeTrade}
              selectedTicker={selectedTicker}
            />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center py-6 border-t border-gray-800/50">
          <p className="text-gray-600 text-xs tracking-wider">
            Requested by <span className="text-gray-500">@AlexandraLiam3</span> · Built by <span className="text-gray-500">@clonkbot</span>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;