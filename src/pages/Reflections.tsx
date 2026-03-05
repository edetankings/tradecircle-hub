import { useState } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle, XCircle, Lightbulb, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const questions = [
  { key: "plan", label: "Did you follow your trading plan today?", icon: CheckCircle },
  { key: "mistake", label: "What mistake did you make?", icon: XCircle },
  { key: "well", label: "What did you do well?", icon: Lightbulb },
  { key: "improve", label: "What will you improve tomorrow?", icon: ArrowUp },
];

export default function Reflections() {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => setAnswers((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    toast.success("Reflection saved!");
    setAnswers({});
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

      <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">
        <Save className="w-4 h-4 mr-2" /> Save Reflection
      </Button>
    </div>
  );
}
