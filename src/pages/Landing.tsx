import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, BarChart3, BookOpen, Shield, ArrowRight, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BarChart3, title: "Analytics", desc: "Track your performance with detailed charts and metrics." },
  { icon: BookOpen, title: "Trade Journal", desc: "Log every trade and learn from your history." },
  { icon: Calendar, title: "Calendar View", desc: "Visualize your trading activity day by day." },
  { icon: Shield, title: "Risk Management", desc: "Monitor drawdown, win rate, and profit factor." },
  { icon: Trophy, title: "Leaderboard", desc: "Compare your results with other traders." },
  { icon: TrendingUp, title: "Myfxbook Sync", desc: "Connect your Myfxbook account to import trades." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">TradeCircle</span>
          </div>
          <Link to="/auth">
            <Button size="sm" className="gap-1.5">
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight"
          >
            Your Forex Trading
            <span className="text-primary"> Command Center</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Track, journal, and analyze every trade. Connect your Myfxbook account, study your performance, and grow as a trader — all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex gap-3 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base">
                Start Trading Smarter <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Everything you need to level up</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-border bg-card p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TradeCircle. Built for traders, by traders.
      </footer>
    </div>
  );
}
