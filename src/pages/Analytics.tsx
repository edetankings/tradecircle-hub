import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from "recharts";
import { useTrades } from "@/hooks/useTrades";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, startOfWeek, startOfMonth, parseISO } from "date-fns";
import {
  TrendingUp, TrendingDown, Target, BarChart3, Shield, Zap, Award, AlertTriangle,
} from "lucide-react";

const COLORS = ["#5B8CFF", "#00C896", "#FF4D4F", "#FFBB28", "#8B5CF6", "#EC4899"];

export default function Analytics() {
  const { data: trades = [], isLoading } = useTrades();
  const [period, setPeriod] = useState("all");

  const filteredTrades = useMemo(() => {
    if (period === "all") return trades;
    const now = new Date();
    if (period === "week") {
      const ws = startOfWeek(now, { weekStartsOn: 1 });
      return trades.filter((t) => new Date(t.date) >= ws);
    }
    if (period === "month") {
      const ms = startOfMonth(now);
      return trades.filter((t) => new Date(t.date) >= ms);
    }
    return trades;
  }, [trades, period]);

  // Core metrics
  const metrics = useMemo(() => {
    const t = filteredTrades;
    if (t.length === 0) return null;

    const wins = t.filter((tr) => tr.profit_loss > 0);
    const losses = t.filter((tr) => tr.profit_loss < 0);
    const winRate = (wins.length / t.length) * 100;
    const totalPL = t.reduce((s, tr) => s + tr.profit_loss, 0);
    const grossProfit = wins.reduce((s, tr) => s + tr.profit_loss, 0);
    const grossLoss = Math.abs(losses.reduce((s, tr) => s + tr.profit_loss, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Average RR
    const rrs = t.map((tr) => {
      const risk = Math.abs(tr.entry_price - tr.stop_loss);
      const reward = Math.abs(tr.exit_price - tr.entry_price);
      return risk > 0 ? reward / risk : 0;
    });
    const avgRR = rrs.reduce((a, b) => a + b, 0) / rrs.length;

    // Max drawdown
    let peak = 10000;
    let maxDD = 0;
    let balance = 10000;
    const sorted = [...t].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((tr) => {
      balance += tr.profit_loss;
      if (balance > peak) peak = balance;
      const dd = ((peak - balance) / peak) * 100;
      if (dd > maxDD) maxDD = dd;
    });

    // Best & worst
    const best = t.reduce((max, tr) => (tr.profit_loss > max.profit_loss ? tr : max), t[0]);
    const worst = t.reduce((min, tr) => (tr.profit_loss < min.profit_loss ? tr : min), t[0]);

    // Avg win / loss
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;

    // Consecutive wins/losses
    let maxConsWins = 0, maxConsLosses = 0, consW = 0, consL = 0;
    sorted.forEach((tr) => {
      if (tr.profit_loss > 0) { consW++; consL = 0; maxConsWins = Math.max(maxConsWins, consW); }
      else if (tr.profit_loss < 0) { consL++; consW = 0; maxConsLosses = Math.max(maxConsLosses, consL); }
      else { consW = 0; consL = 0; }
    });

    return {
      totalTrades: t.length, winRate, totalPL, profitFactor, avgRR, maxDD, best, worst,
      avgWin, avgLoss, grossProfit, grossLoss, wins: wins.length, losses: losses.length,
      maxConsWins, maxConsLosses,
    };
  }, [filteredTrades]);

  // Charts data
  const profitByPair = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach((t) => { map[t.pair] = (map[t.pair] || 0) + t.profit_loss; });
    return Object.entries(map).map(([pair, profit]) => ({ pair, profit: Math.round(profit * 100) / 100 }));
  }, [filteredTrades]);

  const profitByStrategy = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach((t) => { if (t.strategy) map[t.strategy] = (map[t.strategy] || 0) + t.profit_loss; });
    return Object.entries(map).map(([strategy, profit]) => ({ strategy, profit: Math.round(profit * 100) / 100 }));
  }, [filteredTrades]);

  const weeklyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach((t) => {
      const ws = format(startOfWeek(new Date(t.date), { weekStartsOn: 1 }), "MMM d");
      map[ws] = (map[ws] || 0) + t.profit_loss;
    });
    return Object.entries(map).map(([week, profit]) => ({ week, profit: Math.round(profit * 100) / 100 }));
  }, [filteredTrades]);

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTrades.forEach((t) => {
      const m = format(new Date(t.date), "MMM yyyy");
      map[m] = (map[m] || 0) + t.profit_loss;
    });
    return Object.entries(map).map(([month, profit]) => ({ month, profit: Math.round(profit * 100) / 100 }));
  }, [filteredTrades]);

  const equityCurve = useMemo(() => {
    const sorted = [...filteredTrades].sort((a, b) => a.date.localeCompare(b.date));
    let balance = 10000;
    const byDate: Record<string, number> = {};
    sorted.forEach((t) => { byDate[t.date] = (byDate[t.date] || 0) + t.profit_loss; });
    return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, pnl]) => {
      balance += pnl;
      return { date: format(new Date(date), "MMM d"), balance: Math.round(balance) };
    });
  }, [filteredTrades]);

  const dayPerf = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const map: Record<string, { total: number; count: number }> = {};
    days.forEach((d) => (map[d] = { total: 0, count: 0 }));
    filteredTrades.forEach((t) => {
      const dIdx = new Date(t.date).getDay();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = dayNames[dIdx];
      if (map[day]) { map[day].total += t.profit_loss; map[day].count++; }
    });
    return days.map((d) => ({ day: d, profit: Math.round(map[d].total * 100) / 100, trades: map[d].count }));
  }, [filteredTrades]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card px-3 py-2 text-xs">
          <p className="text-muted-foreground">{label}</p>
          <p className="text-foreground font-semibold">${payload[0].value?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading...</div></div>;
  }

  if (trades.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Performance Analytics</h1>
        </motion.div>
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">Add trades to see your analytics.</p>
        </div>
      </div>
    );
  }

  const m = metrics!;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Performance Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Deep dive into your trading performance.</p>
        </div>
        <Tabs value={period} onValueChange={setPeriod} className="w-auto">
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { label: "Total Trades", value: m.totalTrades, icon: BarChart3, color: "text-primary" },
          { label: "Win Rate", value: `${m.winRate.toFixed(1)}%`, icon: Target, color: m.winRate >= 50 ? "text-profit" : "text-loss" },
          { label: "Profit Factor", value: m.profitFactor === Infinity ? "∞" : m.profitFactor.toFixed(2), icon: TrendingUp, color: m.profitFactor >= 1 ? "text-profit" : "text-loss" },
          { label: "Avg R:R", value: `${m.avgRR.toFixed(2)}:1`, icon: Zap, color: "text-primary" },
          { label: "Max Drawdown", value: `${m.maxDD.toFixed(1)}%`, icon: AlertTriangle, color: "text-loss" },
          { label: "Total P/L", value: `$${m.totalPL.toFixed(2)}`, icon: m.totalPL >= 0 ? TrendingUp : TrendingDown, color: m.totalPL >= 0 ? "text-profit" : "text-loss" },
          { label: "Avg Win", value: `$${m.avgWin.toFixed(2)}`, icon: Award, color: "text-profit" },
          { label: "Avg Loss", value: `-$${m.avgLoss.toFixed(2)}`, icon: Shield, color: "text-loss" },
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

      {/* Best/Worst Trades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-profit mb-3 flex items-center gap-2"><Award className="w-4 h-4" /> Best Trade</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Pair</span><span className="text-foreground font-medium">{m.best.pair}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">P/L</span><span className="text-profit font-bold">+${m.best.profit_loss.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{m.best.date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">{m.best.type}</span></div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-loss mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Worst Trade</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Pair</span><span className="text-foreground font-medium">{m.worst.pair}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">P/L</span><span className="text-loss font-bold">${m.worst.profit_loss.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{m.worst.date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">{m.worst.type}</span></div>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Gross Profit", value: `$${m.grossProfit.toFixed(2)}`, color: "text-profit" },
          { label: "Gross Loss", value: `-$${m.grossLoss.toFixed(2)}`, color: "text-loss" },
          { label: "Max Cons. Wins", value: m.maxConsWins, color: "text-profit" },
          { label: "Max Cons. Losses", value: m.maxConsLosses, color: "text-loss" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.03 }} className="stat-card">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Equity Curve */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Equity Curve</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={equityCurve}>
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5B8CFF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#5B8CFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="balance" stroke="#5B8CFF" strokeWidth={2} fill="url(#eqGrad)" animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                {monthlyData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? "#00C896" : "#FF4D4F"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                {weeklyData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? "#00C896" : "#FF4D4F"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Profit by Pair */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Profit by Pair</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={profitByPair}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="pair" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                {profitByPair.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? "#00C896" : "#FF4D4F"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Strategy Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Profit by Strategy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={profitByStrategy.filter((s) => s.profit > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="profit" animationDuration={1200}>
                {profitByStrategy.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {profitByStrategy.map((s, i) => (
              <div key={s.strategy} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {s.strategy}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Day of Week */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-foreground mb-4">Performance by Day of Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dayPerf}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" radius={[6, 6, 0, 0]}>
                {dayPerf.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? "#00C896" : "#FF4D4F"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
