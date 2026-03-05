import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Target, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardEntry {
  user_id: string;
  total_profit: number;
  win_rate: number;
  total_trades: number;
  display_name: string;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: stats } = await supabase
        .from("leaderboard_stats")
        .select("user_id, total_profit, win_rate, total_trades")
        .order("total_profit", { ascending: false });

      if (!stats || stats.length === 0) {
        setLoading(false);
        return;
      }

      const userIds = stats.map((s) => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name; });

      setEntries(
        stats.map((s) => ({
          ...s,
          display_name: profileMap[s.user_id] || "Trader",
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground text-sm mt-1">See how you rank against your circle.</p>
      </motion.div>

      {entries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No leaderboard data yet. Start trading to appear here!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((trader, i) => (
            <motion.div
              key={trader.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                i === 0 ? "bg-yellow-500/20 text-yellow-400" :
                i === 1 ? "bg-gray-400/20 text-gray-300" :
                i === 2 ? "bg-orange-500/20 text-orange-400" :
                "bg-secondary text-muted-foreground"
              }`}>
                {i <= 2 ? <Trophy className="w-4 h-4" /> : i + 1}
              </div>

              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                {trader.display_name.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{trader.display_name}</p>
                <p className="text-xs text-muted-foreground">Rank #{i + 1}</p>
              </div>

              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-profit">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">${trader.total_profit.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Profit</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-primary">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">{trader.win_rate}%</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Win Rate</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-foreground">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">{trader.total_trades}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Trades</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
