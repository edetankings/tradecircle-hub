import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, BarChart3, Target, Shield, Award,
  AlertTriangle, Wallet, Activity,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/StatCard";
import { useTrades } from "@/hooks/useTrades";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import AccountSelector, { SelectedAccount } from "@/components/AccountSelector";
import { useManualAccounts } from "@/hooks/useManualAccounts";
import { useMTAccounts } from "@/hooks/useMTAccounts";

const formatAccountMoney = (value: number, currency: string, maximumFractionDigits = 2) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : undefined, {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(value);

const ChartTooltip = ({ active, payload, label, currency = "USD" }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs border border-border">
        <p className="text-muted-foreground">{label}</p>
        <p className="text-foreground font-semibold">{formatAccountMoney(Number(payload[0].value), currency)}</p>
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

  const accountCurrency = selectedManual?.account_currency || "USD";

  const metrics = useMemo(() => {
    const t = trades;
    const wins = t.filter((tr) => tr.profit_loss > 0);
    const losses = t.filter((tr) => tr.profit_loss < 0);
    const totalPL = t.reduce((s, tr) => s + tr.profit_loss, 0);
    const grossProfit = wins.reduce((s, tr) => s + tr.profit_loss, 0);
    const grossLoss = Math.abs(losses.reduce((s, tr) => s + tr.profit_loss, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const winRate = t.length > 0 ? (wins.length / t.length) * 100 : 0;

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
    const currentDD = peak > 0 ? ((peak - balance) / peak) * 100 : 0;

    const best = t.length > 0 ? t.reduce((max, tr) => (tr.profit_loss > max.profit_loss ? tr : max), t[0]) : null;
    const worst = t.length > 0 ? t.reduce((min, tr) => (tr.profit_loss < min.profit_loss ? tr : min), t[0]) : null;

    return {
      totalTrades: t.length, wins: wins.length, losses: losses.length,
      winRate, totalPL, profitFactor, maxDD, currentDD,
      best, worst, grossProfit, grossLoss, balance,
    };
  }, [trades, selectedManual]);

  const startBalance = selectedManual ? Number(selectedManual.account_balance) : 10000;
  const accountBalance = selectedManual
    ? startBalance + metrics.totalPL
    : profile?.myfxbook_connected && profile?.myfxbook_balance != null && !selectedAccount
      ? Number(profile.myfxbook_balance)
      : metrics.totalPL;

  const accountEquity = selectedManual
    ? Number(selectedManual.account_equity) + metrics.totalPL
    : accountBalance;

  // Equity curve - line chart
  const equityCurveData = useMemo(() => {
    if (trades.length === 0) return [];
    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    let bal = startBalance;
    const byDate: Record<string, number> = {};
    sorted.forEach((t) => { byDate[t.date] = (byDate[t.date] || 0) + t.profit_loss; });
    return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).map(([date, pnl]) => {
      bal += pnl;
      return { date: format(new Date(date), "MMM d"), equity: Math.round(bal) };
    });
  }, [trades, startBalance]);

  // Daily P/L - bar chart
  const dailyPnLData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => { map[t.date] = (map[t.date] || 0) + t.profit_loss; });
    return Object.entries(map)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([date, pnl]) => ({ day: format(new Date(date), "MMM d"), pnl: Math.round(pnl * 100) / 100 }));
  }, [trades]);

  const winLossData = [
    { name: "Wins", value: metrics.wins },
    { name: "Losses", value: metrics.losses },
  ];

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
  const PROFIT = "hsl(var(--profit))";
  const LOSS = "hsl(var(--loss))";

  return (
    <div className="space-y-6">
      {/* Top: Header + Account Selector */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {accountName || `Welcome, ${displayName} 👋`}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{accountSubtext}</p>
        </div>
        <AccountSelector selectedAccount={selectedAccount} onSelectAccount={setSelectedAccount} />
      </motion.div>

      {/* 4 main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="dashboard-stats">
        <StatCard title="Balance" value={formatAccountMoney(accountBalance, accountCurrency, 0)} icon={DollarSign} positive={accountBalance >= 0} delay={0.05} />
        <StatCard title="Equity" value={formatAccountMoney(accountEquity, accountCurrency, 0)} icon={Wallet} positive={accountEquity >= 0} delay={0.1} />
        <StatCard title="Win Rate" value={`${m.winRate.toFixed(1)}%`} icon={Target} change={`${m.wins}W / ${m.losses}L`} positive={m.winRate >= 50} delay={0.15} />
        <StatCard title="Total Trades" value={m.totalTrades} icon={BarChart3} delay={0.2} />
      </div>

      {trades.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl">
          <Activity className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No trades yet. Add your first trade or sync an account to see analytics!</p>
        </div>
      ) : (
        <>
          {/* 3 charts: Equity Curve | Win vs Loss | Daily P/L */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            {/* Equity Curve - Line */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="glass-card p-5 rounded-2xl shadow-sm lg:col-span-3"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Equity Curve</h3>
                <span className="text-xs text-muted-foreground">Account growth</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={equityCurveData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={PROFIT} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={PROFIT} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 100", "dataMax + 100"]} />
                  <Tooltip content={<ChartTooltip currency={accountCurrency} />} />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="url(#lineGrad)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: PROFIT }}
                    animationDuration={1400}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Win vs Loss - Doughnut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card p-5 rounded-2xl shadow-sm lg:col-span-3 xl:col-span-1.5 flex flex-col"
              style={{ gridColumn: undefined }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Win vs Loss</h3>
                <span className="text-xs text-muted-foreground">{m.totalTrades} trades</span>
              </div>
              <div className="relative flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={1200}
                      stroke="none"
                    >
                      <Cell fill={PROFIT} />
                      <Cell fill={LOSS} />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-foreground">{m.winRate.toFixed(0)}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Win Rate</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-profit" /><span className="text-xs text-muted-foreground">Wins ({m.wins})</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-loss" /><span className="text-xs text-muted-foreground">Losses ({m.losses})</span></div>
              </div>
            </motion.div>
          </div>

          {/* Daily P/L - Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="glass-card p-5 rounded-2xl shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Daily Profit / Loss</h3>
              <span className="text-xs text-muted-foreground">Last {dailyPnLData.length} active days</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyPnLData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                  content={({ active, payload, label }: any) => {
                    if (active && payload?.length) {
                      const v = payload[0].value;
                      return (
                        <div className="glass-card px-3 py-2 text-xs border border-border">
                          <p className="text-muted-foreground">{label}</p>
                          <p className={`font-semibold ${v >= 0 ? "text-profit" : "text-loss"}`}>
                            {v >= 0 ? "+" : ""}{formatAccountMoney(Number(v), accountCurrency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="pnl" radius={[8, 8, 0, 0]} animationDuration={1200}>
                  {dailyPnLData.map((e, i) => (
                    <Cell key={i} fill={e.pnl >= 0 ? PROFIT : LOSS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Profit Factor" value={m.profitFactor === Infinity ? "∞" : m.profitFactor.toFixed(2)} icon={TrendingUp} positive={m.profitFactor >= 1} delay={0.4} />
            <StatCard title="Drawdown" value={`${m.currentDD.toFixed(1)}%`} icon={AlertTriangle} change={`Max: ${m.maxDD.toFixed(1)}%`} positive={m.currentDD < 10} delay={0.45} />
            <StatCard title="Best Trade" value={m.best ? formatAccountMoney(m.best.profit_loss, accountCurrency) : "-"} icon={Award} change={m.best?.pair || ""} positive delay={0.5} />
            <StatCard title="Worst Trade" value={m.worst ? formatAccountMoney(m.worst.profit_loss, accountCurrency) : "-"} icon={Shield} change={m.worst?.pair || ""} positive={false} delay={0.55} />
          </div>
        </>
      )}
    </div>
  );
}
