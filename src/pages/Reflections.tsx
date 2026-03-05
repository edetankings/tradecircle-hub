import { useState } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle, XCircle, Lightbulb, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const questions = [
  { key: "plan", label: "Did you follow your trading plan today?", icon: CheckCircle, dbKey: "followed_plan" },
  { key: "mistake", label: "What mistake did you make?", icon: XCircle, dbKey: "mistake" },
  { key: "well", label: "What did you do well?", icon: Lightbulb, dbKey: "did_well" },
  { key: "improve", label: "What will you improve tomorrow?", icon: ArrowUp, dbKey: "improvement" },
];

export default function Reflections() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: string) => setAnswers((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase.from("daily_reflections").upsert(
      {
        user_id: user.id,
        date: today,
        followed_plan: answers.plan?.toLowerCase().includes("yes") ?? null,
        mistake: answers.mistake || null,
        did_well: answers.well || null,
        improvement: answers.improve || null,
        notes: null,
      },
      { onConflict: "user_id,date" }
    );

    if (error) {
      toast.error("Failed to save reflection.");
    } else {
      toast.success("Reflection saved!");
      setAnswers({});
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Daily Reflection</h1>
        <p className="text-muted-foreground text-sm mt-1">Reflect on today's trading session.</p>
      </motion.div>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <motion.div
            key={q.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 space-y-3"
          >
            <div className="flex items-center gap-2">
              <q.icon className="w-4 h-4 text-primary" />
              <label className="text-sm font-medium text-foreground">{q.label}</label>
            </div>
            <Textarea
              className="bg-secondary border-border text-foreground min-h-[80px]"
              value={answers[q.key] || ""}
              onChange={(e) => update(q.key, e.target.value)}
              placeholder="Write your thoughts..."
            />
          </motion.div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Reflection"}
      </Button>
    </div>
  );
}
