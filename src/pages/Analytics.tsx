import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useTrades } from "@/hooks/useTrades";

const COLORS = ["#5B8CFF", "#00C896", "#FF4D4F", "#FFBB28", "#8B5CF6", "#EC4899"];

export default function Analytics() {
  const { data: trades = [], isLoading } = useTrades();

  const profitByPair = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => { map[t.pair] = (map[t.pair] || 0) + t.profit_loss; });
    return Object.entries(map).map(([pair, profit]) => ({ pair, profit }));
  }, [trades]);

  const profitByStrategy = useMemo(() => {
    const map: Record<string, number> = {};
    trades.forEach((t) => { if (t.strategy) map[t.strategy] = (map[t.strategy] || 0) + t.profit_loss; });
    return Object.entries(map).map(([strategy, profit]) => ({ strategy, profit }));
  }, [trades]);

  const dayPerf = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const map: Record<string, { total: number; count: number }> = {};
    days.forEach((d) => (map[d] = { total: 0, count: 0 }));
    trades.forEach((t) => {
      const day = days[new Date(t.date).getDay()];
      map[day].total += t.profit_loss;
      map[day].count++;
    });
    return days.map((d) => ({ day: d, profit: map[d].total, trades: map[d].count }));
  }, [trades]);

  const wins = trades.filter((t) => t.profit_loss > 0).length;
  const avgRR = useMemo(() => {
    if (trades.length === 0) return "0.00";
    const rrs = trades.map((t) => {
      const risk = Math.abs(t.entry_price - t.stop_loss);
      const reward = Math.abs(t.exit_price - t.entry_price);
      return risk > 0 ? reward / risk : 0;
    });
    return (rrs.reduce((a, b) => a + b, 0) / rrs.length).toFixed(2);
  }, [trades]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card px-3 py-2 text-xs">
          <p className="text-muted-foreground">{label}</p>
          <p className="text-foreground font-semibold">${payload[0].value}</p>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Strategy Analytics</h1>
        </motion.div>
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">Add trades to see your analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Strategy Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Deep dive into your performance metrics.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Win Rate", value: `${trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0}%` },
          { label: "Avg RR", value: `${avgRR}:1` },
          { label: "Best Pair", value: profitByPair.sort((a, b) => b.profit - a.profit)[0]?.pair || "-" },
          { label: "Total P/L", value: `$${trades.reduce((s, t) => s + t.profit_loss, 0)}` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 lg:col-span-2">
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
