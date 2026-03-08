import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Brain, Camera, BookOpen, Link2, Save, TrendingUp, Target, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useTrades";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

const EMOTIONS = [
  { value: "confident", label: "😎 Confident", color: "bg-profit/10 text-profit" },
  { value: "calm", label: "😌 Calm", color: "bg-primary/10 text-primary" },
  { value: "neutral", label: "😐 Neutral", color: "bg-muted text-muted-foreground" },
  { value: "anxious", label: "😰 Anxious", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "fearful", label: "😨 Fearful", color: "bg-loss/10 text-loss" },
  { value: "greedy", label: "🤑 Greedy", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "frustrated", label: "😤 Frustrated", color: "bg-loss/10 text-loss" },
  { value: "revenge", label: "😡 Revenge Trading", color: "bg-loss/10 text-loss" },
];

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  emotional_state: string;
  trade_idea: string;
  screenshot_url: string | null;
  trade_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function StrategyJournal() {
  const { user } = useAuth();
  const { data: trades = [] } = useTrades();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [emotionFilter, setEmotionFilter] = useState("all");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tradeIdea, setTradeIdea] = useState("");
  const [emotionalState, setEmotionalState] = useState("neutral");
  const [linkedTradeId, setLinkedTradeId] = useState<string>("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["strategy-journal", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("strategy_journal")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!user,
  });

  const filteredEntries = useMemo(() => {
    if (emotionFilter === "all") return entries;
    return entries.filter((e) => e.emotional_state === emotionFilter);
  }, [entries, emotionFilter]);

  // Strategy Performance Metrics (from real trades)
  const strategyMetrics = useMemo(() => {
    const stratMap: Record<string, { trades: typeof trades; name: string }> = {};
    trades.forEach((t) => {
      const strat = t.strategy || "Untagged";
      if (!stratMap[strat]) stratMap[strat] = { trades: [], name: strat };
      stratMap[strat].trades.push(t);
    });

    return Object.values(stratMap).map((s) => {
      const wins = s.trades.filter((t) => t.profit_loss > 0);
      const losses = s.trades.filter((t) => t.profit_loss < 0);
      const totalPL = s.trades.reduce((sum, t) => sum + t.profit_loss, 0);
      const grossProfit = wins.reduce((sum, t) => sum + t.profit_loss, 0);
      const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.profit_loss, 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
      const winRate = s.trades.length > 0 ? (wins.length / s.trades.length) * 100 : 0;

      // Max drawdown
      let peak = 0, maxDD = 0, balance = 0;
      const sorted = [...s.trades].sort((a, b) => a.date.localeCompare(b.date));
      sorted.forEach((t) => {
        balance += t.profit_loss;
        if (balance > peak) peak = balance;
        const dd = peak > 0 ? ((peak - balance) / peak) * 100 : 0;
        if (dd > maxDD) maxDD = dd;
      });

      return {
        name: s.name,
        totalTrades: s.trades.length,
        winRate: Math.round(winRate * 10) / 10,
        totalPL: Math.round(totalPL * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
        maxDrawdown: Math.round(maxDD * 10) / 10,
        wins: wins.length,
        losses: losses.length,
      };
    }).sort((a, b) => b.totalPL - a.totalPL);
  }, [trades]);

  const resetForm = () => {
    setTitle(""); setContent(""); setTradeIdea(""); setEmotionalState("neutral");
    setLinkedTradeId(""); setScreenshotFile(null); setEditingEntry(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      let screenshot_url = editingEntry?.screenshot_url || null;

      if (screenshotFile) {
        const ext = screenshotFile.name.split(".").pop();
        const path = `${user.id}/journal/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("screenshots").upload(path, screenshotFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path);
        screenshot_url = urlData.publicUrl;
      }

      const payload = {
        title, content, trade_idea: tradeIdea, emotional_state: emotionalState,
        trade_id: linkedTradeId || null, screenshot_url, user_id: user.id,
      };

      if (editingEntry) {
        const { error } = await supabase.from("strategy_journal").update(payload).eq("id", editingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("strategy_journal").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategy-journal"] });
      toast.success(editingEntry ? "Entry updated" : "Entry created");
      resetForm();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("strategy_journal").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategy-journal"] });
      toast.success("Entry deleted");
    },
  });

  const openEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setTradeIdea(entry.trade_idea || "");
    setEmotionalState(entry.emotional_state || "neutral");
    setLinkedTradeId(entry.trade_id || "");
    setDialogOpen(true);
  };

  const emotionLabel = (val: string) => EMOTIONS.find((e) => e.value === val) || EMOTIONS[2];

  const emotionStats = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => { map[e.emotional_state] = (map[e.emotional_state] || 0) + 1; });
    return EMOTIONS.map((em) => ({ ...em, count: map[em.value] || 0 })).filter((e) => e.count > 0);
  }, [entries]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Strategy Journal</h1>
          <p className="text-muted-foreground text-sm mt-1">{entries.length} entries • Track your ideas & emotions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Entry</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEntry ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-secondary border-border" />
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Emotional State</label>
                <div className="flex flex-wrap gap-2">
                  {EMOTIONS.map((em) => (
                    <button key={em.value} onClick={() => setEmotionalState(em.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${emotionalState === em.value ? em.color + " ring-1 ring-current" : "bg-secondary text-muted-foreground hover:bg-muted"}`}>
                      {em.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Trade Idea</label>
                <Textarea placeholder="What's your trade idea?" value={tradeIdea} onChange={(e) => setTradeIdea(e.target.value)} className="bg-secondary border-border" rows={3} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Notes / Reflection</label>
                <Textarea placeholder="Notes about the trade..." value={content} onChange={(e) => setContent(e.target.value)} className="bg-secondary border-border" rows={4} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Link to Trade</label>
                <Select value={linkedTradeId || "none"} onValueChange={(v) => setLinkedTradeId(v === "none" ? "" : v)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select a trade" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="none">No linked trade</SelectItem>
                    {trades.slice(0, 20).map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.pair} {t.type} — ${t.profit_loss} ({t.date})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Screenshot</label>
                <Input type="file" accept="image/*" className="bg-secondary border-border" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
              </div>
              <Button className="w-full gap-2" onClick={() => saveMutation.mutate()} disabled={!title || saveMutation.isPending}>
                <Save className="w-4 h-4" /> {saveMutation.isPending ? "Saving..." : editingEntry ? "Update Entry" : "Save Entry"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Strategy Performance Cards */}
      {strategyMetrics.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h3 className="text-sm font-semibold text-foreground mb-3">Strategy Performance (from real trades)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {strategyMetrics.slice(0, 6).map((strat, i) => (
              <motion.div key={strat.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }} className="glass-card p-4 hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-foreground truncate">{strat.name}</h4>
                  <Badge variant="outline" className={`text-[10px] ${strat.totalPL >= 0 ? "text-profit" : "text-loss"}`}>
                    {strat.totalPL >= 0 ? "+" : ""}${strat.totalPL}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-primary" />
                    <span className="text-[11px] text-muted-foreground">Win Rate</span>
                    <span className={`text-[11px] font-semibold ml-auto ${strat.winRate >= 50 ? "text-profit" : "text-loss"}`}>{strat.winRate}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3 text-primary" />
                    <span className="text-[11px] text-muted-foreground">Trades</span>
                    <span className="text-[11px] font-semibold ml-auto text-foreground">{strat.totalTrades}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-[11px] text-muted-foreground">PF</span>
                    <span className={`text-[11px] font-semibold ml-auto ${strat.profitFactor >= 1 ? "text-profit" : "text-loss"}`}>
                      {strat.profitFactor >= 999 ? "∞" : strat.profitFactor}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-loss" />
                    <span className="text-[11px] text-muted-foreground">DD</span>
                    <span className="text-[11px] font-semibold ml-auto text-loss">{strat.maxDrawdown}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span className="text-profit">{strat.wins}W</span>
                  <span>/</span>
                  <span className="text-loss">{strat.losses}L</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Emotion Filters */}
      {emotionStats.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
          <button onClick={() => setEmotionFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${emotionFilter === "all" ? "bg-primary/20 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground"}`}>
            All ({entries.length})
          </button>
          {emotionStats.map((em) => (
            <button key={em.value} onClick={() => setEmotionFilter(em.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${emotionFilter === em.value ? em.color + " ring-1 ring-current" : "bg-secondary text-muted-foreground"}`}>
              {em.label} ({em.count})
            </button>
          ))}
        </motion.div>
      )}

      {/* Journal Entries */}
      {filteredEntries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No journal entries yet. Start recording your trading psychology!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntries.map((entry, i) => {
            const emotion = emotionLabel(entry.emotional_state);
            const linkedTrade = trades.find((t) => t.id === entry.trade_id);
            return (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }} className="glass-card p-5 hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(entry.created_at), "MMM d, yyyy h:mm a")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={`${emotion.color} text-[10px]`} variant="outline">{emotion.label}</Badge>
                    <button onClick={() => openEdit(entry)} className="p-1 hover:bg-secondary rounded"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    <button onClick={() => deleteMutation.mutate(entry.id)} className="p-1 hover:bg-secondary rounded"><Trash2 className="w-3.5 h-3.5 text-loss" /></button>
                  </div>
                </div>

                {entry.trade_idea && (
                  <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-[10px] text-primary font-medium mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Trade Idea</p>
                    <p className="text-xs text-foreground">{entry.trade_idea}</p>
                  </div>
                )}

                {entry.content && <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{entry.content}</p>}

                {entry.screenshot_url && (
                  <img src={entry.screenshot_url} alt="Screenshot" className="w-full h-32 object-cover rounded-lg mb-3 border border-border" />
                )}

                {linkedTrade && (
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">
                    <Link2 className="w-3 h-3" />
                    <span>{linkedTrade.pair} {linkedTrade.type}</span>
                    <span className={linkedTrade.profit_loss >= 0 ? "text-profit" : "text-loss"}>
                      {linkedTrade.profit_loss >= 0 ? "+" : ""}${linkedTrade.profit_loss}
                    </span>
                    <span>({linkedTrade.date})</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
