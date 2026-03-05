import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTrades } from "@/hooks/useTrades";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function Journal() {
  const { data: trades = [], isLoading } = useTrades();
  const [pairFilter, setPairFilter] = useState("all");
  const [stratFilter, setStratFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const pairs = useMemo(() => [...new Set(trades.map((t) => t.pair))], [trades]);
  const strats = useMemo(() => [...new Set(trades.map((t) => t.strategy).filter(Boolean))], [trades]);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (pairFilter !== "all" && t.pair !== pairFilter) return false;
      if (stratFilter !== "all" && t.strategy !== stratFilter) return false;
      if (dateFilter && t.date !== dateFilter) return false;
      return true;
    });
  }, [trades, pairFilter, stratFilter, dateFilter]);

  const fc = "bg-secondary border-border text-foreground";

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trade Journal</h1>
        <p className="text-muted-foreground text-sm mt-1">{filtered.length} trades logged</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-3">
        <Select value={pairFilter} onValueChange={setPairFilter}>
          <SelectTrigger className={`w-36 ${fc}`}><SelectValue placeholder="All Pairs" /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Pairs</SelectItem>
            {pairs.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stratFilter} onValueChange={setStratFilter}>
          <SelectTrigger className={`w-44 ${fc}`}><SelectValue placeholder="All Strategies" /></SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Strategies</SelectItem>
            {strats.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className={`w-40 ${fc}`} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs">
              {["Pair", "Type", "Entry", "Exit", "P/L", "Date", "Strategy", "Notes"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.02 * i }}
                className="border-b border-border/50 hover:bg-secondary/40 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground">{t.pair}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.type === "Buy" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"}`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t.entry_price}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.exit_price}</td>
                <td className={`px-4 py-3 font-semibold ${t.profit_loss >= 0 ? "text-profit" : "text-loss"}`}>
                  {t.profit_loss >= 0 ? "+" : ""}${t.profit_loss}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">{t.strategy}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{t.notes}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">No trades found</p>
        )}
      </motion.div>
    </div>
  );
}
