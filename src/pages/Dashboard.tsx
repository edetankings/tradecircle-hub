import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, Target, Shield, Award,
  AlertTriangle, Wallet, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import { useTrades } from "@/hooks/useTrades";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfWeek, startOfMonth, isAfter } from "date-fns";
import AccountSelector, { SelectedAccount } from "@/components/AccountSelector";
import { useManualAccounts } from "@/hooks/useManualAccounts";
import { useMTAccounts } from "@/hooks/useMTAccounts";

const COLORS = ["#00C896", "#FF4D4F"];
const PAIR_COLORS = ["#5B8CFF", "#00C896", "#FF4D4F", "#FFBB28", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs border border-border">
        <p className="text-muted-foreground">{label}</p>
        <p className="text-foreground font-semibold">${payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data: allTrades = [], isLoading } = useTrades();
  const { user } = useAuth();
  const { accounts: manualAccounts } = useManualAccounts();
  const { accounts: mtAccounts } = useMTAccounts();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Trader";
  const [selectedAccount, setSelectedAccount] = useState<SelectedAccount>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile-balance", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("myfxbook_balance,myfxbook_connected")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const trades = useMemo(() => {
    if (!selectedAccount) return allTrades;
    if (selectedAccount.type === "mt") {
      return allTrades.filter((t: any) => t.mt_account_id === selectedAccount.id);
    }
    return allTrades.filter((t: any) => t.manual_account_id === selectedAccount.id);
  }, [allTrades, selectedAccount]);

  const selectedManual = selectedAccount?.type === "manual"
    ? manualAccounts.find((a) => a.id === selectedAccount.id)
    : null;

  const selectedMT = selectedAccount?.type === "mt"
    ? mtAccounts.find((a) => a.id === selectedAccount.id)
    : null;

  // ── Core metrics ──
  const metrics = useMemo(() => {
    const t = trades;
    const wins = t.filter((tr) => tr.profit_loss > 0);
    const losses = t.filter((tr) => tr.profit_loss < 0);
    const totalPL = t.reduce((s, tr) => s + tr.profit_loss, 0);
    const grossProfit = wins.reduce((s, tr) => s + tr.profit_loss, 0);
    const grossLoss = Math.abs(losses.reduce((s, tr) => s + tr.profit_loss, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const winRate = t.length > 0 ? (wins.length / t.length) * 100 : 0;

    // Drawdown
    const startBal = selectedManual ? Number(selectedManual.account_balance) : 10000;
    let peak = startBal;
    let maxDD = 0;
    let balance = startBal;
    const sorted = [...t].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((tr) => {
      balance += tr.profit_loss;
      if (balance > peak) peak = balance;
      const dd = peak > 0 ? ((peak - balance) / peak) * 100 : 0;
      if (dd > maxDD) maxDD = dd;
    });

    // Current drawdown
    const currentDD = peak > 0 ? ((peak - balance) / peak) * 100 : 0;

    // Best & worst
    const best = t.length > 0 ? t.reduce((max, tr) => (tr.profit_loss > max.profit_loss ? tr : max), t[0]) : null;
    const worst = t.length > 0 ? t.reduce((min, tr) => (tr.profit_loss < min.profit_loss ? tr : min), t[0]) : null;

    return {
      totalTrades: t.length, wins: wins.length, losses: losses.length,
      winRate, totalPL, profitFactor, maxDD, currentDD,
      best, worst, grossProfit, grossLoss, balance,
    };
  }, [trades, selectedManual]);

  // Balance & equity
  const startBalance = selectedManual ? Number(selectedManual.account_balance) : 10000;
  const accountBalance = selectedManual
    ? startBalance + metrics.totalPL
    : profile?.myfxbook_connected && profile?.myfxbook_balance != null && !selectedAccount
      ? Number(profile.myfxbook_balance)
      : metrics.totalPL;

  const accountEquity = selectedManual
    ? Number(selectedManual.account_equity) + metrics.totalPL
    : accountBalance;

  // ── Chart data ──
  const equityCurveData = useMemo(() => {
    if (trades.length === 0) return [];
    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    let bal = startBalance;
    const byDate: Record<string, number> = {};
    sorted.forEach((t) => { byDate[t.date] = (byDate[t.date] || 0) + t.profit_loss; });
    return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, pnl]) => {
      bal += pnl;
      return { date: format(new Date(date), "MMM d"), balance: Math.round(bal) };
    });
  }, [trades, startBalance]);

  const weeklyData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      const ws = format(startOfWeek(new Date(t.date), { weekStartsOn: 1 }), "MMM d");
      map[ws] = (map[ws] || 0) + t.profit_loss;
    });
    return Object.entries(map).map(([week, profit]) => ({ week, profit: Math.round(profit * 100) / 100 }));
  }, [trades]);

  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      const m = format(new Date(t.date), "MMM yyyy");
      map[m] = (map[m] || 0) + t.profit_loss;
    });
    return Object.entries(map).map(([month, profit]) => ({ month: month.split(" ")[0], profit: Math.round(profit * 100) / 100 }));
  }, [trades]);

  const pairDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => { map[t.pair] = (map[t.pair] || 0) + 1; });
    return Object.entries(map).map(([pair, count]) => ({ pair, count })).sort((a, b) => b.count - a.count);
  }, [trades]);

  // ── Header info ──
  const accountName = selectedManual
    ? selectedManual.account_name
    : selectedMT
      ? `${selectedMT.account_label} — ${selectedMT.broker_name}`
      : null;

  const accountSubtext = selectedManual
    ? `${selectedManual.broker_name ? selectedManual.broker_name + " · " : ""}${selectedManual.account_currency} · ${selectedManual.account_type}`
    : selectedMT
      ? `${selectedMT.platform} · #${selectedMT.account_number} · ${selectedMT.server_name}`
      : "Here's your trading overview.";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const m = metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {accountName || `Welcome, ${displayName} 👋`}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{accountSubtext}</p>
        </div>
        <AccountSelector selectedAccount={selectedAccount} onSelectAccount={setSelectedAccount} />
      </motion.div>

      {/* Trading Plan */}
      <TradingPlanWidget />

      {/* Stat Cards - 8 widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        <StatCard title="Balance" value={`$${accountBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={DollarSign} positive={accountBalance >= 0} delay={0.03} />
        <StatCard title="Equity" value={`$${accountEquity.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Wallet} positive={accountEquity >= 0} delay={0.06} />
        <StatCard title="Total Trades" value={m.totalTrades} icon={BarChart3} delay={0.09} />
        <StatCard title="Win Rate" value={`${m.winRate.toFixed(1)}%`} icon={Target} change={`${m.wins}W / ${m.losses}L`} positive={m.winRate >= 50} delay={0.12} />
        <StatCard title="Profit Factor" value={m.profitFactor === Infinity ? "∞" : m.profitFactor.toFixed(2)} icon={TrendingUp} positive={m.profitFactor >= 1} delay={0.15} />
        <StatCard title="Drawdown" value={`${m.currentDD.toFixed(1)}%`} icon={AlertTriangle} change={`Max: ${m.maxDD.toFixed(1)}%`} positive={m.currentDD < 10} delay={0.18} />
        <StatCard title="Best Trade" value={m.best ? `$${m.best.profit_loss.toFixed(2)}` : "-"} icon={Award} change={m.best?.pair || ""} positive delay={0.21} />
        <StatCard title="Worst Trade" value={m.worst ? `$${m.worst.profit_loss.toFixed(2)}` : "-"} icon={Shield} change={m.worst?.pair || ""} positive={false} delay={0.24} />
      </div>

      {trades.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No trades yet. Add your first trade or sync an account to see analytics!</p>
        </div>
      ) : (
        <>
          {/* Equity Curve + Trade Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="glass-card p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-foreground mb-4">Equity Curve</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={equityCurveData}>
                  <defs>
                    <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B8CFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5B8CFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 100", "dataMax + 100"]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="balance" stroke="#5B8CFF" strokeWidth={2} fill="url(#eqGrad)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Trade Distribution</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={[{ name: "Wins", value: m.wins }, { name: "Losses", value: m.losses }]} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" animationDuration={1200}>
                    {[0, 1].map((i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-profit" /><span className="text-xs text-muted-foreground">Wins ({m.wins})</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-loss" /><span className="text-xs text-muted-foreground">Losses ({m.losses})</span></div>
              </div>

              {/* Pair breakdown */}
              {pairDistribution.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">By Pair</p>
                  {pairDistribution.slice(0, 5).map((p, i) => (
                    <div key={p.pair} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PAIR_COLORS[i % PAIR_COLORS.length] }} />
                      <span className="text-xs text-foreground flex-1">{p.pair}</span>
                      <span className="text-xs text-muted-foreground">{p.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Weekly + Monthly Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Profit</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="week" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="profit" radius={[6, 6, 0, 0]} animationDuration={1200}>
                    {weeklyData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? "#00C896" : "#FF4D4F"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Profit</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="profit" radius={[6, 6, 0, 0]} animationDuration={1200}>
                    {monthlyData.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? "#00C896" : "#FF4D4F"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Best & Worst Trades */}
          {m.best && m.worst && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }} className="glass-card p-5">
                <h3 className="text-sm font-semibold text-profit mb-3 flex items-center gap-2"><Award className="w-4 h-4" /> Best Trade</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Pair</span><span className="text-foreground font-medium">{m.best.pair}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">P/L</span><span className="text-profit font-bold">+${m.best.profit_loss.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">{m.best.type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{m.best.date}</span></div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48 }} className="glass-card p-5">
                <h3 className="text-sm font-semibold text-loss mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Worst Trade</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Pair</span><span className="text-foreground font-medium">{m.worst.pair}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">P/L</span><span className="text-loss font-bold">${m.worst.profit_loss.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">{m.worst.type}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="text-foreground">{m.worst.date}</span></div>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
