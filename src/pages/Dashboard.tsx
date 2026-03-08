import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, BarChart3, Target, Calendar, Star,
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
import { format, startOfWeek, isAfter } from "date-fns";
import AccountSelector from "@/components/AccountSelector";

const COLORS = ["#00C896", "#FF4D4F"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-3 py-2 text-xs">
        <p className="text-muted-foreground">{label}</p>
        <p className="text-foreground font-semibold">${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data: allTrades = [], isLoading } = useTrades();
  const { user } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Trader";
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Filter trades by selected MT account
  const trades = useMemo(() => {
    if (!selectedAccountId) return allTrades;
    return allTrades.filter((t: any) => t.mt_account_id === selectedAccountId);
  }, [allTrades, selectedAccountId]);

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const stats = useMemo(() => {
    const wins = trades.filter((t) => t.profit_loss > 0).length;
    const losses = trades.filter((t) => t.profit_loss < 0).length;
    const totalPL = trades.reduce((s, t) => s + t.profit_loss, 0);
    const todayTrades = trades.filter((t) => t.date === today);
    const todayPL = todayTrades.reduce((s, t) => s + t.profit_loss, 0);
    const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;
    const weeklyTrades = trades.filter((t) => isAfter(new Date(t.date), weekStart));
    const weeklyPL = weeklyTrades.reduce((s, t) => s + t.profit_loss, 0);

    // Best pair
    const pairMap: Record<string, number> = {};
    trades.forEach((t) => { pairMap[t.pair] = (pairMap[t.pair] || 0) + t.profit_loss; });
    const bestPair = Object.entries(pairMap).sort((a, b) => b[1] - a[1])[0];

    return { wins, losses, totalPL, todayPL, todayTrades: todayTrades.length, winRate, weeklyPL, bestPair };
  }, [trades, today, weekStart]);

  const pieData = [
    { name: "Wins", value: stats.wins },
    { name: "Losses", value: stats.losses },
  ];

  const equityCurveData = useMemo(() => {
    if (trades.length === 0) return [];
    const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
    let balance = 10000;
    const points: { date: string; balance: number }[] = [];
    const byDate: Record<string, number> = {};
    sorted.forEach((t) => { byDate[t.date] = (byDate[t.date] || 0) + t.profit_loss; });
    Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0])).forEach(([date, pnl]) => {
      balance += pnl;
      points.push({ date: format(new Date(date), "MMM d"), balance: Math.round(balance) });
    });
    return points;
  }, [trades]);

  const monthlyProfitData = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => {
      const m = format(new Date(t.date), "MMM yyyy");
      map[m] = (map[m] || 0) + t.profit_loss;
    });
    return Object.entries(map).map(([month, profit]) => ({ month: month.split(" ")[0], profit: Math.round(profit) }));
  }, [trades]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Welcome, {displayName} 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your trading overview.</p>
        </div>
        <AccountSelector selectedAccountId={selectedAccountId} onSelectAccount={setSelectedAccountId} />
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Account Balance" value={`$${(10000 + stats.totalPL).toLocaleString()}`} icon={DollarSign} change={`${((stats.totalPL / 10000) * 100).toFixed(1)}% all time`} positive={stats.totalPL >= 0} delay={0.05} />
        <StatCard title="Today's P/L" value={`$${stats.todayPL}`} icon={TrendingUp} change={`${stats.todayTrades} trades`} positive={stats.todayPL >= 0} delay={0.1} />
        <StatCard title="Total Trades" value={trades.length} icon={BarChart3} delay={0.15} />
        <StatCard title="Win Rate" value={`${stats.winRate}%`} icon={Target} change={`${stats.wins}W / ${stats.losses}L`} positive={stats.winRate >= 50} delay={0.2} />
        <StatCard title="Weekly Profit" value={`$${stats.weeklyPL}`} icon={Calendar} change="This week" positive={stats.weeklyPL >= 0} delay={0.25} />
        <StatCard title="Best Pair" value={stats.bestPair?.[0] || "-"} icon={Star} change={stats.bestPair ? `$${stats.bestPair[1]} profit` : ""} positive delay={0.3} />
      </div>

      {trades.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No trades yet. Add your first trade to see analytics!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5 lg:col-span-2">
              <h3 className="text-sm font-semibold text-foreground mb-4">Equity Curve</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={equityCurveData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B8CFF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#5B8CFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 100", "dataMax + 100"]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="balance" stroke="#5B8CFF" strokeWidth={2} fill="url(#colorBalance)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Win vs Loss</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" animationDuration={1200}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-profit" /><span className="text-xs text-muted-foreground">Wins ({stats.wins})</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-loss" /><span className="text-xs text-muted-foreground">Losses ({stats.losses})</span></div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Profit</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyProfitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]} animationDuration={1200}>
                  {monthlyProfitData.map((entry, i) => <Cell key={i} fill={entry.profit >= 0 ? "#00C896" : "#FF4D4F"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </>
      )}
    </div>
  );
}
