import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Target,
  Calendar,
  Star,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from "recharts";
import StatCard from "@/components/StatCard";
import { mockTrades, equityCurveData, monthlyProfitData } from "@/data/mockData";

const wins = mockTrades.filter((t) => t.profitLoss > 0).length;
const losses = mockTrades.filter((t) => t.profitLoss < 0).length;
const totalPL = mockTrades.reduce((s, t) => s + t.profitLoss, 0);
const todayTrades = mockTrades.filter((t) => t.date === "2026-03-05");
const todayPL = todayTrades.reduce((s, t) => s + t.profitLoss, 0);
const winRate = Math.round((wins / mockTrades.length) * 100);
const pieData = [
  { name: "Wins", value: wins },
  { name: "Losses", value: losses },
];
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
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back. Here's your trading overview.</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Account Balance" value="$10,742" icon={DollarSign} change="7.4% all time" positive delay={0.05} />
        <StatCard title="Today's P/L" value={`$${todayPL}`} icon={TrendingUp} change={`${todayTrades.length} trades`} positive={todayPL >= 0} delay={0.1} />
        <StatCard title="Total Trades" value={mockTrades.length} icon={BarChart3} delay={0.15} />
        <StatCard title="Win Rate" value={`${winRate}%`} icon={Target} change={`${wins}W / ${losses}L`} positive={winRate >= 50} delay={0.2} />
        <StatCard title="Weekly Profit" value={`$${totalPL}`} icon={Calendar} change="This week" positive={totalPL >= 0} delay={0.25} />
        <StatCard title="Best Pair" value="EUR/USD" icon={Star} change="$250 profit" positive delay={0.3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Equity Curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="glass-card p-5 lg:col-span-2"
        >
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

        {/* Win/Loss Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-4">Win vs Loss</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                animationDuration={1200}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-profit" />
              <span className="text-xs text-muted-foreground">Wins ({wins})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-loss" />
              <span className="text-xs text-muted-foreground">Losses ({losses})</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Monthly Profit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="glass-card p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Profit</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyProfitData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="profit" radius={[6, 6, 0, 0]} animationDuration={1200}>
              {monthlyProfitData.map((entry, i) => (
                <Cell key={i} fill={entry.profit >= 0 ? "#00C896" : "#FF4D4F"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
