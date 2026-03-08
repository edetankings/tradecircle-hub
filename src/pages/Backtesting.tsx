import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Play, TrendingUp, TrendingDown, BarChart3, Target, Shield, Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "NZDUSD", "USDCHF", "EURJPY", "GBPJPY", "XAUUSD"];
const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"];

interface BacktestResult {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  netProfit: number;
  avgWin: number;
  avgLoss: number;
  sharpeRatio: number;
  equityCurve: { trade: number; balance: number }[];
  monthlyReturns: { month: string; return_: number }[];
}

export default function Backtesting() {
  const [strategyName, setStrategyName] = useState("");
  const [pair, setPair] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("H1");
  const [riskPerTrade, setRiskPerTrade] = useState("2");
  const [stopLoss, setStopLoss] = useState("30");
  const [takeProfit, setTakeProfit] = useState("60");
  const [initialBalance, setInitialBalance] = useState("10000");
  const [numTrades, setNumTrades] = useState("100");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const runBacktest = async () => {
    setRunning(true);
    setResult(null);

    // Simulate backtesting with statistical model based on parameters
    await new Promise((r) => setTimeout(r, 1500));

    const sl = parseFloat(stopLoss);
    const tp = parseFloat(takeProfit);
    const risk = parseFloat(riskPerTrade) / 100;
    const balance = parseFloat(initialBalance);
    const trades = parseInt(numTrades);
    const rr = tp / sl;

    // Statistical simulation based on RR ratio
    // Base win rate inversely proportional to RR (realistic)
    const baseWinRate = Math.min(0.7, Math.max(0.3, 0.55 - (rr - 1) * 0.08));
    // Add some randomness
    const actualWinRate = baseWinRate + (Math.random() - 0.5) * 0.1;

    let currentBalance = balance;
    let peak = balance;
    let maxDD = 0;
    const equityCurve: { trade: number; balance: number }[] = [{ trade: 0, balance }];
    let wins = 0;
    let losses = 0;
    let totalWinAmount = 0;
    let totalLossAmount = 0;
    const returns: number[] = [];

    for (let i = 0; i < trades; i++) {
      const riskAmount = currentBalance * risk;
      const isWin = Math.random() < actualWinRate;

      if (isWin) {
        const profit = riskAmount * rr * (0.8 + Math.random() * 0.4);
        currentBalance += profit;
        totalWinAmount += profit;
        wins++;
        returns.push(profit / balance);
      } else {
        const loss = riskAmount * (0.7 + Math.random() * 0.6);
        currentBalance -= loss;
        totalLossAmount += loss;
        losses++;
        returns.push(-loss / balance);
      }

      if (currentBalance > peak) peak = currentBalance;
      const dd = ((peak - currentBalance) / peak) * 100;
      if (dd > maxDD) maxDD = dd;

      equityCurve.push({ trade: i + 1, balance: Math.round(currentBalance) });
    }

    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? Infinity : 0;
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length);
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

    // Monthly returns (simulated)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyReturns = months.map((month) => ({
      month,
      return_: (Math.random() - 0.45) * risk * 100 * 20,
    }));

    setResult({
      totalTrades: trades,
      wins,
      losses,
      winRate: (wins / trades) * 100,
      profitFactor,
      maxDrawdown: maxDD,
      netProfit: currentBalance - balance,
      avgWin: wins > 0 ? totalWinAmount / wins : 0,
      avgLoss: losses > 0 ? totalLossAmount / losses : 0,
      sharpeRatio,
      equityCurve,
      monthlyReturns,
    });

    setRunning(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card px-3 py-2 text-xs">
          <p className="text-muted-foreground">Trade #{label}</p>
          <p className="text-foreground font-semibold">${payload[0].value?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Backtesting Engine</h1>
        <p className="text-muted-foreground text-sm mt-1">Test your strategy with simulated historical data.</p>
      </motion.div>

      {/* Strategy Configuration */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Strategy Parameters</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Strategy Name</label>
            <Input placeholder="My Strategy" value={strategyName} onChange={(e) => setStrategyName(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Pair</label>
            <Select value={pair} onValueChange={setPair}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {PAIRS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Timeframe</label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {TIMEFRAMES.map((tf) => <SelectItem key={tf} value={tf}>{tf}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Risk per Trade (%)</label>
            <Input type="number" value={riskPerTrade} onChange={(e) => setRiskPerTrade(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Stop Loss (pips)</label>
            <Input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Take Profit (pips)</label>
            <Input type="number" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Initial Balance ($)</label>
            <Input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="bg-secondary border-border" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Number of Trades</label>
            <Input type="number" value={numTrades} onChange={(e) => setNumTrades(e.target.value)} className="bg-secondary border-border" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button onClick={runBacktest} disabled={running} className="gap-2">
            {running ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? "Running..." : "Run Backtest"}
          </Button>
          {result && (
            <Button variant="outline" onClick={() => setResult(null)} className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          )}
        </div>
      </motion.div>

      {/* Results */}
      {result && (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {[
              { label: "Total Trades", value: result.totalTrades, icon: BarChart3, color: "text-primary" },
              { label: "Win Rate", value: `${result.winRate.toFixed(1)}%`, icon: Target, color: result.winRate >= 50 ? "text-profit" : "text-loss" },
              { label: "Profit Factor", value: result.profitFactor === Infinity ? "∞" : result.profitFactor.toFixed(2), icon: TrendingUp, color: result.profitFactor >= 1 ? "text-profit" : "text-loss" },
              { label: "Max Drawdown", value: `${result.maxDrawdown.toFixed(1)}%`, icon: Shield, color: "text-loss" },
              { label: "Net Profit", value: `$${result.netProfit.toFixed(2)}`, icon: result.netProfit >= 0 ? TrendingUp : TrendingDown, color: result.netProfit >= 0 ? "text-profit" : "text-loss" },
              { label: "Avg Win", value: `$${result.avgWin.toFixed(2)}`, icon: TrendingUp, color: "text-profit" },
              { label: "Avg Loss", value: `$${result.avgLoss.toFixed(2)}`, icon: TrendingDown, color: "text-loss" },
              { label: "Sharpe Ratio", value: result.sharpeRatio.toFixed(2), icon: Zap, color: result.sharpeRatio >= 1 ? "text-profit" : "text-loss" },
              { label: "Wins", value: result.wins, icon: TrendingUp, color: "text-profit" },
              { label: "Losses", value: result.losses, icon: TrendingDown, color: "text-loss" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="stat-card">
                <div className="flex items-center gap-1.5 mb-2">
                  <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                </div>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Equity Curve */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Equity Curve — {strategyName || "Untitled"} ({pair} {timeframe})
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={result.equityCurve}>
                <defs>
                  <linearGradient id="btGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={result.netProfit >= 0 ? "#00C896" : "#FF4D4F"} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={result.netProfit >= 0 ? "#00C896" : "#FF4D4F"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="trade" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="balance" stroke={result.netProfit >= 0 ? "#00C896" : "#FF4D4F"} strokeWidth={2} fill="url(#btGrad)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Monthly Returns */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Returns (%)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={result.monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={({ active, payload, label }: any) => active && payload?.length ? (
                  <div className="glass-card px-3 py-2 text-xs">
                    <p className="text-muted-foreground">{label}</p>
                    <p className="text-foreground font-semibold">{payload[0].value?.toFixed(2)}%</p>
                  </div>
                ) : null} />
                <Bar dataKey="return_" radius={[6, 6, 0, 0]}>
                  {result.monthlyReturns.map((e, i) => <Cell key={i} fill={e.return_ >= 0 ? "#00C896" : "#FF4D4F"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}
