import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Target, BarChart3, Zap, RefreshCw, Medal, Crown, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_profit: number;
  win_rate: number;
  total_trades: number;
  profit_factor: number;
  wins: number;
  losses: number;
}

type SortKey = "total_profit" | "win_rate" | "total_trades" | "profit_factor";

export default function Leaderboard() {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<SortKey>("total_profit");

  const { data: entries = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard");
      if (error) throw error;
      return (data ?? []) as LeaderboardEntry[];
    },
    refetchInterval: 60000,
  });

  const sorted = [...entries].sort((a, b) => {
    if (sortBy === "total_profit") return b.total_profit - a.total_profit;
    if (sortBy === "win_rate") return b.win_rate - a.win_rate;
    if (sortBy === "total_trades") return b.total_trades - a.total_trades;
    return b.profit_factor - a.profit_factor;
  });

  const myRank = sorted.findIndex((e) => e.user_id === user?.id);
  const myEntry = myRank >= 0 ? sorted[myRank] : null;

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (i === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (i === 2) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>;
  };

  const rankBg = (i: number) => {
    if (i === 0) return "border-yellow-500/30 bg-yellow-500/5";
    if (i === 1) return "border-gray-400/30 bg-gray-400/5";
    if (i === 2) return "border-orange-500/30 bg-orange-500/5";
    return "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Rankings from real synced trades • {entries.length} trader{entries.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)} className="w-auto">
            <TabsList className="h-9">
              <TabsTrigger value="total_profit" className="text-xs px-3">Profit</TabsTrigger>
              <TabsTrigger value="win_rate" className="text-xs px-3">Win Rate</TabsTrigger>
              <TabsTrigger value="profit_factor" className="text-xs px-3">PF</TabsTrigger>
              <TabsTrigger value="total_trades" className="text-xs px-3">Trades</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </motion.div>

      {/* My Position Card */}
      {myEntry && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              #{myRank + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Your Position</p>
              <p className="text-xs text-muted-foreground">{myEntry.display_name}</p>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <div className="text-center">
                <p className={`text-sm font-bold ${myEntry.total_profit >= 0 ? "text-profit" : "text-loss"}`}>
                  ${myEntry.total_profit.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">Profit</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-primary">{myEntry.win_rate}%</p>
                <p className="text-[10px] text-muted-foreground">Win Rate</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{myEntry.profit_factor}</p>
                <p className="text-[10px] text-muted-foreground">PF</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">{myEntry.total_trades}</p>
                <p className="text-[10px] text-muted-foreground">Trades</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {sorted.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No leaderboard data yet. Sync your trades to appear here!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {sorted.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 0, 2].map((idx) => {
                const trader = sorted[idx];
                if (!trader) return null;
                const isFirst = idx === 0;
                return (
                  <motion.div
                    key={trader.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`glass-card p-5 text-center ${isFirst ? "row-start-1 border-yellow-500/30" : ""} ${rankBg(idx)}`}
                  >
                    <div className="flex justify-center mb-3">{rankIcon(idx)}</div>
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary mx-auto mb-2">
                      {trader.display_name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">{trader.display_name}</p>
                    <p className={`text-lg font-bold mt-1 ${trader.total_profit >= 0 ? "text-profit" : "text-loss"}`}>
                      ${trader.total_profit.toLocaleString()}
                    </p>
                    <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span>{trader.win_rate}% WR</span>
                      <span>{trader.total_trades} trades</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full Rankings Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="px-4 py-3 text-left font-medium w-14">#</th>
                  <th className="px-4 py-3 text-left font-medium">Trader</th>
                  <th className="px-4 py-3 text-right font-medium">Profit</th>
                  <th className="px-4 py-3 text-right font-medium">Win Rate</th>
                  <th className="px-4 py-3 text-right font-medium">Profit Factor</th>
                  <th className="px-4 py-3 text-right font-medium">W/L</th>
                  <th className="px-4 py-3 text-right font-medium">Trades</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((trader, i) => {
                  const isMe = trader.user_id === user?.id;
                  return (
                    <motion.tr
                      key={trader.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b border-border/50 hover:bg-secondary/40 transition-colors ${isMe ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center">
                          {rankIcon(i)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                            {trader.display_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{trader.display_name}</p>
                            {isMe && <p className="text-[10px] text-primary">You</p>}
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${trader.total_profit >= 0 ? "text-profit" : "text-loss"}`}>
                        ${trader.total_profit.toLocaleString()}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${trader.win_rate >= 50 ? "text-profit" : "text-loss"}`}>
                        {trader.win_rate}%
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${trader.profit_factor >= 1 ? "text-profit" : "text-loss"}`}>
                        {trader.profit_factor >= 999 ? "∞" : trader.profit_factor}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        <span className="text-profit">{trader.wins}</span>
                        <span className="mx-1">/</span>
                        <span className="text-loss">{trader.losses}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground font-medium">{trader.total_trades}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        </>
      )}
    </div>
  );
}
