import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, CheckCircle, XCircle, Lightbulb, ArrowUp, Calendar, ChevronLeft, ChevronRight,
  Camera, Brain, Trash2, Plus, Eye, X, Link2, TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTrades } from "@/hooks/useTrades";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, subDays, addDays } from "date-fns";

const EMOTIONS = [
  { value: "confident", label: "😎 Confident", color: "bg-profit/10 text-profit" },
  { value: "calm", label: "😌 Calm", color: "bg-primary/10 text-primary" },
  { value: "neutral", label: "😐 Neutral", color: "bg-muted text-muted-foreground" },
  { value: "anxious", label: "😰 Anxious", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "fearful", label: "😨 Fearful", color: "bg-loss/10 text-loss" },
  { value: "greedy", label: "🤑 Greedy", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "frustrated", label: "😤 Frustrated", color: "bg-loss/10 text-loss" },
  { value: "revenge", label: "😡 Revenge", color: "bg-loss/10 text-loss" },
];

const emotionLabel = (val: string) => EMOTIONS.find((e) => e.value === val) || EMOTIONS[2];

export default function Reflections() {
  const { user } = useAuth();
  const { data: trades = [] } = useTrades();
  const queryClient = useQueryClient();

  const [view, setView] = useState<"cards" | "form">("cards");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const [detailReflection, setDetailReflection] = useState<any>(null);

  // Form state
  const [followedPlan, setFollowedPlan] = useState("");
  const [mistake, setMistake] = useState("");
  const [didWell, setDidWell] = useState("");
  const [improvement, setImprovement] = useState("");
  const [notes, setNotes] = useState("");
  const [emotionBefore, setEmotionBefore] = useState("neutral");
  const [emotionAfter, setEmotionAfter] = useState("neutral");
  const [strategyUsed, setStrategyUsed] = useState("");
  const [lessonLearned, setLessonLearned] = useState("");
  const [linkedTradeId, setLinkedTradeId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const todayTrades = useMemo(() => trades.filter((t) => t.date === dateStr), [trades, dateStr]);
  const strategies = useMemo(() => [...new Set(trades.map((t) => t.strategy).filter(Boolean))], [trades]);

  // Fetch existing reflection for selected date (form mode)
  const { data: existing } = useQuery({
    queryKey: ["reflection", user?.id, dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_reflections")
        .select("*")
        .eq("user_id", user!.id)
        .eq("date", dateStr)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // All reflections for card grid
  const { data: allReflections = [] } = useQuery({
    queryKey: ["reflections-all", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_reflections")
        .select("*")
        .eq("user_id", user!.id)
        .order("date", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (existing) {
      setFollowedPlan(existing.followed_plan ? "yes" : existing.followed_plan === false ? "no" : "");
      setMistake(existing.mistake || "");
      setDidWell(existing.did_well || "");
      setImprovement(existing.improvement || "");
      setNotes(existing.notes || "");
      setEmotionBefore((existing as any).emotion_before || "neutral");
      setEmotionAfter((existing as any).emotion_after || "neutral");
      setStrategyUsed((existing as any).strategy_used || "");
      setLessonLearned((existing as any).lesson_learned || "");
      setLinkedTradeId((existing as any).trade_id || "");
    } else {
      setFollowedPlan(""); setMistake(""); setDidWell(""); setImprovement(""); setNotes("");
      setEmotionBefore("neutral"); setEmotionAfter("neutral"); setStrategyUsed("");
      setLessonLearned(""); setLinkedTradeId("");
    }
    setScreenshotFile(null);
  }, [existing, dateStr]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    let screenshot_url = existing?.screenshot_url || null;
    if (screenshotFile) {
      const ext = screenshotFile.name.split(".").pop();
      const path = `${user.id}/reflections/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("screenshots").upload(path, screenshotFile);
      if (uploadErr) { toast.error("Screenshot upload failed"); setSaving(false); return; }
      const { data: urlData } = supabase.storage.from("screenshots").getPublicUrl(path);
      screenshot_url = urlData.publicUrl;
    }

    const payload = {
      user_id: user.id, date: dateStr,
      followed_plan: followedPlan === "yes" ? true : followedPlan === "no" ? false : null,
      mistake: mistake || null, did_well: didWell || null, improvement: improvement || null,
      notes: notes || null, screenshot_url,
      emotion_before: emotionBefore, emotion_after: emotionAfter,
      strategy_used: strategyUsed, lesson_learned: lessonLearned || null,
      trade_id: linkedTradeId || null,
    };

    const { error } = existing
      ? await supabase.from("daily_reflections").update(payload).eq("id", existing.id)
      : await supabase.from("daily_reflections").insert(payload);

    if (error) {
      toast.error("Failed to save reflection.");
    } else {
      toast.success(existing ? "Reflection updated!" : "Reflection saved!");
      queryClient.invalidateQueries({ queryKey: ["reflection"] });
      queryClient.invalidateQueries({ queryKey: ["reflections-all"] });
      setView("cards");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!existing) return;
    const { error } = await supabase.from("daily_reflections").delete().eq("id", existing.id);
    if (error) toast.error("Failed to delete");
    else {
      toast.success("Reflection deleted");
      queryClient.invalidateQueries({ queryKey: ["reflection"] });
      queryClient.invalidateQueries({ queryKey: ["reflections-all"] });
      setView("cards");
    }
  };

  // Determine trade result for a reflection
  const getTradeResult = (r: any) => {
    if (!r.trade_id) return null;
    const trade = trades.find((t) => t.id === r.trade_id);
    if (!trade) return null;
    return { isWin: trade.profit_loss > 0, pl: trade.profit_loss, pair: trade.pair };
  };

  const openForm = (date?: Date) => {
    if (date) setSelectedDate(date);
    else setSelectedDate(new Date());
    setView("form");
  };

  const openEdit = (r: any) => {
    setSelectedDate(new Date(r.date + "T12:00:00"));
    setDetailReflection(null);
    setView("form");
  };

  const todayPL = todayTrades.reduce((s, t) => s + t.profit_loss, 0);

  // ───── CARDS VIEW ─────
  if (view === "cards") {
    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Reflections</h1>
            <p className="text-muted-foreground text-sm mt-1">{allReflections.length} reflection{allReflections.length !== 1 ? "s" : ""} recorded</p>
          </div>
          <Button onClick={() => openForm()} className="gap-2">
            <Plus className="w-4 h-4" /> New Reflection
          </Button>
        </motion.div>

        {allReflections.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No reflections yet. Start tracking your trading psychology!</p>
            <Button onClick={() => openForm()} className="mt-4 gap-2"><Plus className="w-4 h-4" /> Add First Reflection</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allReflections.map((r: any, i: number) => {
              const em = emotionLabel(r.emotion_before || "neutral");
              const tradeResult = getTradeResult(r);
              return (
                <motion.button
                  key={r.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setDetailReflection(r)}
                  className="glass-card p-5 text-left hover:border-primary/30 transition-all group"
                >
                  {/* Strategy name */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider truncate">
                      {r.strategy_used || "No Strategy"}
                    </span>
                    {r.followed_plan === true && <CheckCircle className="w-3.5 h-3.5 text-profit shrink-0" />}
                    {r.followed_plan === false && <XCircle className="w-3.5 h-3.5 text-loss shrink-0" />}
                  </div>

                  {/* Trade result */}
                  <div className="flex items-center gap-2 mb-2">
                    {tradeResult ? (
                      <Badge className={`${tradeResult.isWin ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"} text-xs px-2 py-0.5`} variant="outline">
                        {tradeResult.isWin ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {tradeResult.isWin ? "Win" : "Loss"} · {tradeResult.pair}
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground text-xs px-2 py-0.5" variant="outline">
                        No linked trade
                      </Badge>
                    )}
                  </div>

                  {/* Emotion */}
                  <div className="mb-3">
                    <Badge className={`${em.color} text-xs px-2 py-0.5`} variant="outline">
                      {em.label}
                    </Badge>
                  </div>

                  {/* Preview snippet */}
                  {(r.did_well || r.lesson_learned) && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {r.did_well || r.lesson_learned}
                    </p>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(r.date + "T12:00:00"), "d MMM yyyy")}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!detailReflection} onOpenChange={(open) => !open && setDetailReflection(null)}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            {detailReflection && <ReflectionDetail r={detailReflection} trades={trades} onEdit={() => openEdit(detailReflection)} />}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ───── FORM VIEW ─────
  return (
    <div className="space-y-6 max-w-4xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView("cards")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {existing ? "Edit Reflection" : "New Reflection"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Reflect on your trading session.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedDate((d) => subDays(d, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="px-4 py-2 glass-card text-sm font-medium text-foreground min-w-[140px] text-center">
            <Calendar className="w-3.5 h-3.5 inline mr-2 text-primary" />
            {format(selectedDate, "MMM d, yyyy")}
          </div>
          <Button variant="outline" size="icon" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {todayTrades.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {todayTrades.length} trade{todayTrades.length !== 1 ? "s" : ""} on this day
              </span>
            </div>
            <span className={`text-sm font-bold ${todayPL >= 0 ? "text-profit" : "text-loss"}`}>
              {todayPL >= 0 ? "+" : ""}${todayPL.toFixed(2)}
            </span>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {/* Emotions */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Emotional State</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Before Trading</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOTIONS.map((em) => (
                  <button key={em.value} onClick={() => setEmotionBefore(em.value)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${emotionBefore === em.value ? em.color + " ring-1 ring-current" : "bg-secondary text-muted-foreground hover:bg-muted"}`}>
                    {em.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">After Trading</label>
              <div className="flex flex-wrap gap-1.5">
                {EMOTIONS.map((em) => (
                  <button key={em.value} onClick={() => setEmotionAfter(em.value)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${emotionAfter === em.value ? em.color + " ring-1 ring-current" : "bg-secondary text-muted-foreground hover:bg-muted"}`}>
                    {em.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Strategy & Trade */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Strategy & Trade</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Strategy Used</label>
              <Select value={strategyUsed || "none"} onValueChange={(v) => setStrategyUsed(v === "none" ? "" : v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select strategy" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">No specific strategy</SelectItem>
                  {strategies.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Link to Trade</label>
              <Select value={linkedTradeId || "none"} onValueChange={(v) => setLinkedTradeId(v === "none" ? "" : v)}>
                <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select trade" /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="none">No linked trade</SelectItem>
                  {todayTrades.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.pair} {t.type} — ${t.profit_loss}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Plan adherence */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-profit" />
            <label className="text-sm font-medium text-foreground">Did you follow your trading plan?</label>
          </div>
          <div className="flex gap-2">
            {["yes", "no", "partially"].map((v) => (
              <button key={v} onClick={() => setFollowedPlan(v)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all ${followedPlan === v ? (v === "yes" ? "bg-profit/10 text-profit ring-1 ring-profit/30" : v === "no" ? "bg-loss/10 text-loss ring-1 ring-loss/30" : "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/30") : "bg-secondary text-muted-foreground hover:bg-muted"}`}>
                {v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Questions */}
        {[
          { key: "well", label: "What did you do well?", icon: Lightbulb, value: didWell, set: setDidWell },
          { key: "mistake", label: "What mistake did you make?", icon: XCircle, value: mistake, set: setMistake },
          { key: "improve", label: "What will you improve?", icon: ArrowUp, value: improvement, set: setImprovement },
          { key: "lesson", label: "Key lesson learned", icon: Brain, value: lessonLearned, set: setLessonLearned },
        ].map((q, i) => (
          <motion.div key={q.key} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <q.icon className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium text-foreground">{q.label}</label>
            </div>
            <Textarea className="bg-secondary border-border text-foreground min-h-[70px]" value={q.value} onChange={(e) => q.set(e.target.value)} placeholder="Write your thoughts..." />
          </motion.div>
        ))}

        {/* Notes & Screenshot */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 space-y-4">
          <Textarea className="bg-secondary border-border text-foreground min-h-[60px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block flex items-center gap-1"><Camera className="w-3 h-3" /> Screenshot</label>
              <Input type="file" accept="image/*" className="bg-secondary border-border" onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)} />
            </div>
            {existing?.screenshot_url && (
              <img src={existing.screenshot_url} alt="Screenshot" className="w-16 h-16 rounded-lg object-cover border border-border" />
            )}
          </div>
        </motion.div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : existing ? "Update Reflection" : "Save Reflection"}
          </Button>
          {existing && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ───── Detail View Component ─────
function ReflectionDetail({ r, trades, onEdit }: { r: any; trades: any[]; onEdit: () => void }) {
  const em_before = emotionLabel(r.emotion_before || "neutral");
  const em_after = emotionLabel(r.emotion_after || "neutral");
  const linkedTrade = r.trade_id ? trades.find((t: any) => t.id === r.trade_id) : null;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Reflection — {format(new Date(r.date + "T12:00:00"), "d MMM yyyy")}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-5 mt-2">
        {/* Strategy & Result */}
        <div className="flex flex-wrap items-center gap-2">
          {r.strategy_used && (
            <Badge className="bg-primary/10 text-primary text-xs px-2.5 py-1" variant="outline">
              {r.strategy_used}
            </Badge>
          )}
          {linkedTrade && (
            <Badge className={`${linkedTrade.profit_loss > 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"} text-xs px-2.5 py-1`} variant="outline">
              {linkedTrade.profit_loss > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {linkedTrade.profit_loss > 0 ? "Win" : "Loss"} · {linkedTrade.pair} · ${linkedTrade.profit_loss}
            </Badge>
          )}
          {r.followed_plan === true && (
            <Badge className="bg-profit/10 text-profit text-xs px-2.5 py-1" variant="outline"><CheckCircle className="w-3 h-3 mr-1" /> Followed Plan</Badge>
          )}
          {r.followed_plan === false && (
            <Badge className="bg-loss/10 text-loss text-xs px-2.5 py-1" variant="outline"><XCircle className="w-3 h-3 mr-1" /> Didn't Follow Plan</Badge>
          )}
        </div>

        {/* Emotions */}
        <div className="glass-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Emotional State</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground mb-1">Before</p>
              <Badge className={`${em_before.color} text-xs px-2.5 py-1`} variant="outline">{em_before.label}</Badge>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-muted-foreground mb-1">After</p>
              <Badge className={`${em_after.color} text-xs px-2.5 py-1`} variant="outline">{em_after.label}</Badge>
            </div>
          </div>
        </div>

        {/* Content sections */}
        {[
          { label: "What went well", value: r.did_well, icon: Lightbulb },
          { label: "Mistake made", value: r.mistake, icon: XCircle },
          { label: "Improvement plan", value: r.improvement, icon: ArrowUp },
          { label: "Lesson learned", value: r.lesson_learned, icon: Brain },
          { label: "Notes", value: r.notes, icon: Eye },
        ].filter((s) => s.value).map((s) => (
          <div key={s.label}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <s.icon className="w-3.5 h-3.5 text-primary" />
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</h4>
            </div>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{s.value}</p>
          </div>
        ))}

        {/* Screenshot */}
        {r.screenshot_url && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-primary" /> Screenshot
            </h4>
            <img src={r.screenshot_url} alt="Trade screenshot" className="w-full rounded-lg border border-border" />
          </div>
        )}

        {/* Linked Trade */}
        {linkedTrade && (
          <div className="glass-card p-3 text-xs">
            <div className="flex items-center gap-1.5 mb-2">
              <Link2 className="w-3 h-3 text-primary" />
              <span className="font-semibold text-muted-foreground uppercase tracking-wider">Linked Trade</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <span>Pair: <span className="text-foreground font-medium">{linkedTrade.pair}</span></span>
              <span>Type: <span className="text-foreground font-medium">{linkedTrade.type}</span></span>
              <span>P/L: <span className={`font-bold ${linkedTrade.profit_loss >= 0 ? "text-profit" : "text-loss"}`}>${linkedTrade.profit_loss}</span></span>
              <span>ID: <span className="text-foreground font-mono text-[10px]">{linkedTrade.id.slice(0, 8)}…</span></span>
            </div>
          </div>
        )}

        <Button onClick={onEdit} variant="outline" className="w-full gap-2">
          <Save className="w-4 h-4" /> Edit Reflection
        </Button>
      </div>
    </>
  );
}
