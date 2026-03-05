import { motion } from "framer-motion";
import { Trophy, TrendingUp, Target, BarChart3 } from "lucide-react";
import { leaderboardData } from "@/data/mockData";

export default function Leaderboard() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground text-sm mt-1">See how you rank against your circle.</p>
      </motion.div>

      <div className="space-y-3">
        {leaderboardData.map((trader, i) => (
          <motion.div
            key={trader.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card p-5 flex items-center gap-4 ${trader.name === "You" ? "ring-1 ring-primary" : ""}`}
          >
            {/* Rank */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
              i === 0 ? "bg-yellow-500/20 text-yellow-400" :
              i === 1 ? "bg-gray-400/20 text-gray-300" :
              i === 2 ? "bg-orange-500/20 text-orange-400" :
              "bg-secondary text-muted-foreground"
            }`}>
              {i <= 2 ? <Trophy className="w-4 h-4" /> : trader.rank}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
              {trader.avatar}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{trader.name}</p>
              <p className="text-xs text-muted-foreground">Rank #{trader.rank}</p>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-profit">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">${trader.profit.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Profit</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-primary">
                  <Target className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">{trader.winRate}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Win Rate</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-foreground">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="text-sm font-semibold">{trader.totalTrades}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Trades</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
