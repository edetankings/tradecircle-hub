import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Edit3, Save, X, AlertTriangle, Clock, Target, DollarSign,
  BarChart3, BookOpen, Brain, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useTradingPlan } from "@/hooks/useTradingPlan";

const ALL_PAIRS = ["EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY", "XAU/USD", "BTC/USD", "ETH/USD"];
const ALL_SESSIONS = ["London", "New York", "Tokyo", "Sydney"];

export default function TradingPlanWidget() {
  const { plan, isLoading, savePlan } = useTradingPlan();
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Form state
  const [maxRisk, setMaxRisk] = useState("1");
  const [maxTrades, setMaxTrades] = useState("3");
  const [pairs, setPairs] = useState<string[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [dailyLoss, setDailyLoss] = useState("0");
  const [weeklyLoss, setWeeklyLoss] = useState("0");
  const [strategyRules, setStrategyRules] = useState("");
  const [disciplineNotes, setDisciplineNotes] = useState("");

  // Load plan data
  useEffect(() => {
    if (plan) {
      setMaxRisk(String(plan.max_risk_per_trade));
      setMaxTrades(String(plan.max_trades_per_day));
      setPairs(plan.allowed_pairs || []);
      setSessions(plan.trading_sessions || []);
      setDailyLoss(String(plan.daily_loss_limit));
      setWeeklyLoss(String(plan.weekly_loss_limit));
      setStrategyRules(plan.strategy_rules || "");
      setDisciplineNotes(plan.discipline_notes || "");
    }
  }, [plan]);

  const togglePair = (p: string) => setPairs((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  const toggleSession = (s: string) => setSessions((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleSave = async () => {
    await savePlan.mutateAsync({
      max_risk_per_trade: parseFloat(maxRisk) || 1,
      max_trades_per_day: parseInt(maxTrades) || 3,
      allowed_pairs: pairs,
      trading_sessions: sessions,
      daily_loss_limit: parseFloat(dailyLoss) || 0,
      weekly_loss_limit: parseFloat(weeklyLoss) || 0,
      strategy_rules: strategyRules,
      discipline_notes: disciplineNotes,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    if (plan) {
      setMaxRisk(String(plan.max_risk_per_trade));
      setMaxTrades(String(plan.max_trades_per_day));
      setPairs(plan.allowed_pairs || []);
      setSessions(plan.trading_sessions || []);
      setDailyLoss(String(plan.daily_loss_limit));
      setWeeklyLoss(String(plan.weekly_loss_limit));
      setStrategyRules(plan.strategy_rules || "");
      setDisciplineNotes(plan.discipline_notes || "");
    }
  };

  if (isLoading) return null;

  // No plan yet - show CTA
  if (!plan && !editing) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Set Up Your Trading Plan</h3>
              <p className="text-xs text-muted-foreground">Define your rules before you start trading.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => setEditing(true)} className="gap-1.5">
            <Edit3 className="w-3.5 h-3.5" /> Create Plan
          </Button>
        </div>
      </motion.div>
    );
  }

  // Edit mode
  if (editing) {
    const fc = "bg-secondary border-border text-foreground";
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Edit Trading Plan</h3>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}><X className="w-4 h-4" /></Button>
            <Button size="sm" onClick={handleSave} disabled={savePlan.isPending} className="gap-1.5">
              <Save className="w-3.5 h-3.5" /> Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Max Risk Per Trade (%)</label>
            <Input type="number" step="0.1" min="0" max="100" className={fc} value={maxRisk} onChange={(e) => setMaxRisk(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Max Trades Per Day</label>
            <Input type="number" min="1" max="50" className={fc} value={maxTrades} onChange={(e) => setMaxTrades(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Daily Loss Limit ($)</label>
            <Input type="number" step="any" min="0" className={fc} value={dailyLoss} onChange={(e) => setDailyLoss(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Weekly Loss Limit ($)</label>
            <Input type="number" step="any" min="0" className={fc} value={weeklyLoss} onChange={(e) => setWeeklyLoss(e.target.value)} />
          </div>
        </div>

        {/* Pairs */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Allowed Trading Pairs</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_PAIRS.map((p) => (
              <button key={p} onClick={() => togglePair(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${pairs.includes(p) ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground hover:bg-muted"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Trading Sessions</label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SESSIONS.map((s) => (
              <button key={s} onClick={() => toggleSession(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sessions.includes(s) ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground hover:bg-muted"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Strategy Rules</label>
          <Textarea className={`${fc} min-h-[60px]`} value={strategyRules} onChange={(e) => setStrategyRules(e.target.value)} placeholder="e.g. Only trade breakouts after consolidation..." />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Personal Discipline Notes</label>
          <Textarea className={`${fc} min-h-[60px]`} value={disciplineNotes} onChange={(e) => setDisciplineNotes(e.target.value)} placeholder="e.g. Don't revenge trade, take breaks after 2 losses..." />
        </div>
      </motion.div>
    );
  }

  // Display mode
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">My Trading Rules</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
            <Edit3 className="w-3.5 h-3.5" />
          </Button>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-4">
              {/* Key metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg">
                  <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Risk/Trade</p>
                    <p className="text-sm font-bold text-foreground">{plan!.max_risk_per_trade}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg">
                  <BarChart3 className="w-3.5 h-3.5 text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Max Trades/Day</p>
                    <p className="text-sm font-bold text-foreground">{plan!.max_trades_per_day}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-loss shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Daily Limit</p>
                    <p className="text-sm font-bold text-foreground">${plan!.daily_loss_limit}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-secondary/50 rounded-lg">
                  <DollarSign className="w-3.5 h-3.5 text-loss shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Weekly Limit</p>
                    <p className="text-sm font-bold text-foreground">${plan!.weekly_loss_limit}</p>
                  </div>
                </div>
              </div>

              {/* Pairs */}
              {plan!.allowed_pairs.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Allowed Pairs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan!.allowed_pairs.map((p) => (
                      <Badge key={p} variant="outline" className="bg-primary/10 text-primary text-[10px] px-2">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sessions */}
              {plan!.trading_sessions.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Trading Sessions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {plan!.trading_sessions.map((s) => (
                      <Badge key={s} variant="outline" className="bg-accent/10 text-accent-foreground text-[10px] px-2">
                        <Clock className="w-2.5 h-2.5 mr-1" />{s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Strategy Rules */}
              {plan!.strategy_rules && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Strategy Rules
                  </p>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap bg-secondary/30 rounded-lg p-3">{plan!.strategy_rules}</p>
                </div>
              )}

              {/* Discipline Notes */}
              {plan!.discipline_notes && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Brain className="w-3 h-3" /> Discipline Notes
                  </p>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap bg-secondary/30 rounded-lg p-3">{plan!.discipline_notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
