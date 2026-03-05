import { useState } from "react";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const pairs = ["EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY", "XAU/USD"];
const strategies = ["Breakout", "Trend Following", "Scalping", "Mean Reversion", "News Trading", "Range Trading"];

export default function AddTrade() {
  const [form, setForm] = useState({
    pair: "", type: "Buy" as "Buy" | "Sell", entryPrice: "", exitPrice: "",
    stopLoss: "", takeProfit: "", lotSize: "", profitLoss: "", date: new Date().toISOString().split("T")[0],
    strategy: "", notes: "",
  });

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Trade saved successfully!");
    setForm({ pair: "", type: "Buy", entryPrice: "", exitPrice: "", stopLoss: "", takeProfit: "", lotSize: "", profitLoss: "", date: new Date().toISOString().split("T")[0], strategy: "", notes: "" });
  };

  const fieldClass = "bg-secondary border-border text-foreground";

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add Trade</h1>
        <p className="text-muted-foreground text-sm mt-1">Log a new trade to your journal.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="glass-card p-6 space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Pair</label>
            <Select value={form.pair} onValueChange={(v) => update("pair", v)}>
              <SelectTrigger className={fieldClass}><SelectValue placeholder="Select pair" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {pairs.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Type</label>
            <Select value={form.type} onValueChange={(v) => update("type", v)}>
              <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Entry Price</label>
            <Input type="number" step="any" className={fieldClass} value={form.entryPrice} onChange={(e) => update("entryPrice", e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Exit Price</label>
            <Input type="number" step="any" className={fieldClass} value={form.exitPrice} onChange={(e) => update("exitPrice", e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Stop Loss</label>
            <Input type="number" step="any" className={fieldClass} value={form.stopLoss} onChange={(e) => update("stopLoss", e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Take Profit</label>
            <Input type="number" step="any" className={fieldClass} value={form.takeProfit} onChange={(e) => update("takeProfit", e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Lot Size</label>
            <Input type="number" step="any" className={fieldClass} value={form.lotSize} onChange={(e) => update("lotSize", e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Profit / Loss ($)</label>
            <Input type="number" step="any" className={fieldClass} value={form.profitLoss} onChange={(e) => update("profitLoss", e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Trade Date</label>
            <Input type="date" className={fieldClass} value={form.date} onChange={(e) => update("date", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Strategy</label>
            <Select value={form.strategy} onValueChange={(v) => update("strategy", v)}>
              <SelectTrigger className={fieldClass}><SelectValue placeholder="Select strategy" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {strategies.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Notes</label>
          <Textarea className={`${fieldClass} min-h-[80px]`} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Trade notes..." />
        </div>
        <Button type="submit" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" /> Save Trade
        </Button>
      </motion.form>
    </div>
  );
}
