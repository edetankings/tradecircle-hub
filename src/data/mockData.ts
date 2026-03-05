import { Trade } from "@/types/trade";

export const mockTrades: Trade[] = [
  { id: "1", pair: "EUR/USD", type: "Buy", entryPrice: 1.0850, exitPrice: 1.0920, stopLoss: 1.0800, takeProfit: 1.0950, lotSize: 1.0, profitLoss: 70, date: "2026-03-05", strategy: "Breakout", notes: "Clean breakout above resistance" },
  { id: "2", pair: "GBP/JPY", type: "Sell", entryPrice: 191.50, exitPrice: 190.80, stopLoss: 192.00, takeProfit: 190.00, lotSize: 0.5, profitLoss: 35, date: "2026-03-05", strategy: "Trend Following", notes: "Strong downtrend continuation" },
  { id: "3", pair: "USD/JPY", type: "Buy", entryPrice: 150.20, exitPrice: 149.80, stopLoss: 149.50, takeProfit: 151.00, lotSize: 1.0, profitLoss: -40, date: "2026-03-04", strategy: "Scalping", notes: "Got stopped out" },
  { id: "4", pair: "EUR/USD", type: "Sell", entryPrice: 1.0900, exitPrice: 1.0860, stopLoss: 1.0930, takeProfit: 1.0820, lotSize: 2.0, profitLoss: 80, date: "2026-03-04", strategy: "Breakout", notes: "Perfect entry on retest" },
  { id: "5", pair: "GBP/USD", type: "Buy", entryPrice: 1.2650, exitPrice: 1.2700, stopLoss: 1.2620, takeProfit: 1.2750, lotSize: 1.5, profitLoss: 75, date: "2026-03-03", strategy: "Trend Following", notes: "Followed the trend" },
  { id: "6", pair: "AUD/USD", type: "Sell", entryPrice: 0.6520, exitPrice: 0.6550, stopLoss: 0.6560, takeProfit: 0.6480, lotSize: 1.0, profitLoss: -30, date: "2026-03-03", strategy: "Mean Reversion", notes: "Reversal didn't hold" },
  { id: "7", pair: "USD/CAD", type: "Buy", entryPrice: 1.3580, exitPrice: 1.3640, stopLoss: 1.3550, takeProfit: 1.3650, lotSize: 0.8, profitLoss: 48, date: "2026-03-02", strategy: "Breakout", notes: "News-driven breakout" },
  { id: "8", pair: "EUR/GBP", type: "Sell", entryPrice: 0.8580, exitPrice: 0.8560, stopLoss: 0.8600, takeProfit: 0.8530, lotSize: 1.2, profitLoss: 24, date: "2026-03-01", strategy: "Scalping", notes: "Quick scalp on range" },
  { id: "9", pair: "NZD/USD", type: "Buy", entryPrice: 0.5680, exitPrice: 0.5650, stopLoss: 0.5660, takeProfit: 0.5720, lotSize: 1.0, profitLoss: -30, date: "2026-02-28", strategy: "Trend Following", notes: "False breakout" },
  { id: "10", pair: "EUR/USD", type: "Buy", entryPrice: 1.0780, exitPrice: 1.0830, stopLoss: 1.0750, takeProfit: 1.0850, lotSize: 2.0, profitLoss: 100, date: "2026-02-27", strategy: "Breakout", notes: "Strong momentum" },
  { id: "11", pair: "GBP/JPY", type: "Buy", entryPrice: 190.00, exitPrice: 190.80, stopLoss: 189.50, takeProfit: 191.50, lotSize: 0.5, profitLoss: 40, date: "2026-02-26", strategy: "Trend Following", notes: "Riding the trend" },
  { id: "12", pair: "USD/JPY", type: "Sell", entryPrice: 151.00, exitPrice: 150.40, stopLoss: 151.50, takeProfit: 150.00, lotSize: 1.0, profitLoss: 60, date: "2026-02-25", strategy: "Mean Reversion", notes: "Overbought reversal" },
];

export const equityCurveData = [
  { date: "Feb 20", balance: 10000 },
  { date: "Feb 21", balance: 10120 },
  { date: "Feb 22", balance: 10080 },
  { date: "Feb 23", balance: 10250 },
  { date: "Feb 24", balance: 10310 },
  { date: "Feb 25", balance: 10370 },
  { date: "Feb 26", balance: 10410 },
  { date: "Feb 27", balance: 10510 },
  { date: "Feb 28", balance: 10480 },
  { date: "Mar 1", balance: 10504 },
  { date: "Mar 2", balance: 10552 },
  { date: "Mar 3", balance: 10597 },
  { date: "Mar 4", balance: 10637 },
  { date: "Mar 5", balance: 10742 },
];

export const monthlyProfitData = [
  { month: "Oct", profit: 320 },
  { month: "Nov", profit: -80 },
  { month: "Dec", profit: 450 },
  { month: "Jan", profit: 280 },
  { month: "Feb", profit: 510 },
  { month: "Mar", profit: 232 },
];

export const leaderboardData = [
  { rank: 1, name: "Alex Chen", profit: 4250, winRate: 72, totalTrades: 156, avatar: "AC" },
  { rank: 2, name: "Sarah Kim", profit: 3820, winRate: 68, totalTrades: 142, avatar: "SK" },
  { rank: 3, name: "Mike Ross", profit: 2950, winRate: 65, totalTrades: 198, avatar: "MR" },
  { rank: 4, name: "Lisa Wang", profit: 2100, winRate: 61, totalTrades: 87, avatar: "LW" },
  { rank: 5, name: "You", profit: 742, winRate: 67, totalTrades: 12, avatar: "YO" },
];
