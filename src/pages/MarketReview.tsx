import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Eye, Save, X, CheckCircle, XCircle, MinusCircle, TrendingUp, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import TradingPlanWidget from "@/components/TradingPlanWidget";

const PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "AUD/USD", "USD/CAD",
  "NZD/USD", "EUR/GBP", "EUR/JPY", "XAU/USD", "US30", "NAS100", "BTC/USD", "ETH/USD",
];

const RESULT_OPTIONS = [
  { value: "worked", label: "Worked", icon: CheckCircle, color: "text-profit bg-profit/10" },
  { value: "did_not_work", label: "Did Not Work", icon: XCircle, color: "text-loss bg-loss/10" },
  { value: "not_taken", label: "Not Taken", icon: MinusCircle, color: "text-muted-foreground bg-muted" },
];

interface MarketReview {
  id: string;
  pair: string;
  outlook: string;
  entry_idea: string;
  key_levels: string;
  notes: string;
  setup_result: string | null;
  created_at: string;
  updated_at: string;
}

export default function MarketReviewPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState<MarketReview | null>(null);
  const [editingEntry, setEditingEntry] = useState<MarketReview | null>(null);
  const [resultFilter, setResultFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("reviews");

  const [pair, setPair] = useState("");
  const [customPair, setCustomPair] = useState("");
  const [outlook, setOutlook] = useState("");
  const [entryIdea, setEntryIdea] = useState("");
  const [keyLevels, setKeyLevels] = useState("");
  const [notes, setNotes] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["market-reviews", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("market_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MarketReview[];
    },
    enabled: !!user,
  });

  const filteredReviews = useMemo(() => {
    if (resultFilter === "all") return reviews;
    if (resultFilter === "pending") return reviews.filter((r) => !r.setup_result);
    return reviews.filter((r) => r.setup_result === resultFilter);
  }, [reviews, resultFilter]);

  const resetForm = () => {
    setPair(""); setCustomPair(""); setOutlook(""); setEntryIdea("");
    setKeyLevels(""); setNotes(""); setEditingEntry(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const finalPair = pair === "__other" ? customPair : pair;
      if (!finalPair) throw new Error("Please select a trading pair");

      const payload = {
        pair: finalPair, outlook, entry_idea: entryIdea,
        key_levels: keyLevels, notes, user_id: user.id,
      };

      if (editingEntry) {
        const { error } = await supabase.from("market_reviews").update(payload).eq("id", editingEntry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("market_reviews").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-reviews"] });
      toast.success(editingEntry ? "Review updated" : "Review created");
      resetForm();
      setDialogOpen(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("market_reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-reviews"] });
      toast.success("Review deleted");
      setDetailOpen(null);
    },
  });

  const updateResultMutation = useMutation({
    mutationFn: async ({ id, result }: { id: string; result: string }) => {
      const { error } = await supabase.from("market_reviews").update({ setup_result: result }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["market-reviews"] });
      toast.success("Result updated");
    },
  });

  const openEdit = (entry: MarketReview) => {
    setEditingEntry(entry);
    setPair(PAIRS.includes(entry.pair) ? entry.pair : "__other");
    setCustomPair(PAIRS.includes(entry.pair) ? "" : entry.pair);
    setOutlook(entry.outlook);
    setEntryIdea(entry.entry_idea);
    setKeyLevels(entry.key_levels);
    setNotes(entry.notes);
    setDialogOpen(true);
  };

  const resultBadge = (result: string | null) => {
    if (!result) return <Badge variant="outline" className="text-[10px] text-muted-foreground">Pending</Badge>;
    const opt = RESULT_OPTIONS.find((r) => r.value === result);
    if (!opt) return null;
    return <Badge variant="outline" className={`text-[10px] ${opt.color}`}>{opt.label}</Badge>;
  };

  const stats = useMemo(() => {
    const total = reviews.length;
    const worked = reviews.filter((r) => r.setup_result === "worked").length;
    const failed = reviews.filter((r) => r.setup_result === "did_not_work").length;
    const notTaken = reviews.filter((r) => r.setup_result === "not_taken").length;
    const pending = reviews.filter((r) => !r.setup_result).length;
    return { total, worked, failed, notTaken, pending };
  }, [reviews]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Market Review</h1>
          <p className="text-muted-foreground text-sm mt-1">Analyze markets, document setups, and track your trading rules.</p>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reviews" className="gap-1.5 text-xs"><TrendingUp className="w-3.5 h-3.5" /> Market Reviews</TabsTrigger>
          <TabsTrigger value="trading-plan" className="gap-1.5 text-xs"><ClipboardList className="w-3.5 h-3.5" /> Trading Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-4 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Total", value: stats.total, color: "text-foreground" },
              { label: "Worked", value: stats.worked, color: "text-profit" },
              { label: "Failed", value: stats.failed, color: "text-loss" },
              { label: "Not Taken", value: stats.notTaken, color: "text-muted-foreground" },
              { label: "Pending", value: stats.pending, color: "text-primary" },
            ].map((s) => (
              <div key={s.label} className="stat-card text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters + New button */}
          <div className="flex flex-wrap items-center gap-2">
            {["all", "pending", "worked", "did_not_work", "not_taken"].map((f) => (
              <button key={f} onClick={() => setResultFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  resultFilter === f ? "bg-primary/20 text-primary ring-1 ring-primary/30" : "bg-secondary text-muted-foreground"
                }`}>
                {f === "all" ? "All" : f === "pending" ? "Pending" : f === "did_not_work" ? "Did Not Work" : f.charAt(0).toUpperCase() + f.slice(1).replace("_", " ")}
              </button>
            ))}
            <div className="flex-1" />
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" /> New Review</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingEntry ? "Edit Review" : "New Market Review"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Trading Pair</label>
                    <Select value={pair} onValueChange={setPair}>
                      <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select pair" /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {PAIRS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        <SelectItem value="__other">Other (custom)</SelectItem>
                      </SelectContent>
                    </Select>
                    {pair === "__other" && (
                      <Input placeholder="Enter custom pair (e.g. US30, NAS100)" value={customPair}
                        onChange={(e) => setCustomPair(e.target.value)} className="bg-secondary border-border mt-2" />
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Market Outlook / Analysis</label>
                    <Textarea placeholder="Bullish bias due to..." value={outlook} onChange={(e) => setOutlook(e.target.value)} className="bg-secondary border-border" rows={3} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Potential Entry Idea</label>
                    <Textarea placeholder="Looking to enter at..." value={entryIdea} onChange={(e) => setEntryIdea(e.target.value)} className="bg-secondary border-border" rows={2} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Key Levels (Support / Resistance)</label>
                    <Textarea placeholder="Support: 1.0850, Resistance: 1.0950" value={keyLevels} onChange={(e) => setKeyLevels(e.target.value)} className="bg-secondary border-border" rows={2} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
                    <Textarea placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-secondary border-border" rows={2} />
                  </div>
                  <Button className="w-full gap-2" onClick={() => saveMutation.mutate()} disabled={!pair || saveMutation.isPending}>
                    <Save className="w-4 h-4" /> {saveMutation.isPending ? "Saving..." : editingEntry ? "Update Review" : "Save Review"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Review Cards */}
          {filteredReviews.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No market reviews yet. Start documenting your trade setups!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.map((review, i) => (
                <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card p-5 hover:border-primary/20 transition-all cursor-pointer"
                  onClick={() => setDetailOpen(review)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{review.pair}</h3>
                        {resultBadge(review.setup_result)}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(review.created_at), "MMM d, yyyy h:mm a")}</p>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(review)} className="p-1 hover:bg-secondary rounded"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => deleteMutation.mutate(review.id)} className="p-1 hover:bg-secondary rounded"><Trash2 className="w-3.5 h-3.5 text-loss" /></button>
                    </div>
                  </div>
                  {review.outlook && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{review.outlook}</p>}
                  {review.entry_idea && (
                    <div className="p-2 bg-primary/5 rounded border border-primary/10 mb-2">
                      <p className="text-[10px] text-primary font-medium mb-0.5">Entry Idea</p>
                      <p className="text-xs text-foreground line-clamp-1">{review.entry_idea}</p>
                    </div>
                  )}
                  {review.key_levels && (
                    <p className="text-[10px] text-muted-foreground"><span className="font-medium">Levels:</span> {review.key_levels}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trading-plan" className="mt-4">
          <TradingPlanWidget />
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setDetailOpen(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{detailOpen.pair}</h3>
                  {resultBadge(detailOpen.setup_result)}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDetailOpen(null)}><X className="w-4 h-4" /></Button>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">{format(new Date(detailOpen.created_at), "MMMM d, yyyy h:mm a")}</p>

              <div className="space-y-4">
                {detailOpen.outlook && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Market Outlook</p>
                    <p className="text-sm text-muted-foreground">{detailOpen.outlook}</p>
                  </div>
                )}
                {detailOpen.entry_idea && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-xs font-medium text-primary mb-1">Entry Idea</p>
                    <p className="text-sm text-foreground">{detailOpen.entry_idea}</p>
                  </div>
                )}
                {detailOpen.key_levels && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Key Levels</p>
                    <p className="text-sm text-muted-foreground">{detailOpen.key_levels}</p>
                  </div>
                )}
                {detailOpen.notes && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{detailOpen.notes}</p>
                  </div>
                )}

                {/* Mark Result */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-foreground mb-2">Mark Setup Result</p>
                  <div className="flex gap-2">
                    {RESULT_OPTIONS.map((opt) => (
                      <Button key={opt.value} variant="outline" size="sm"
                        className={`gap-1.5 text-xs ${detailOpen.setup_result === opt.value ? opt.color + " ring-1 ring-current" : ""}`}
                        onClick={() => {
                          updateResultMutation.mutate({ id: detailOpen.id, result: opt.value });
                          setDetailOpen({ ...detailOpen, setup_result: opt.value });
                        }}>
                        <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
