import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp, BarChart3, BookOpen, Shield, ArrowRight, Calendar, Trophy,
  Monitor, Zap, LineChart, Users, ChevronRight, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Monitor, title: "MT4/MT5 Sync", desc: "Connect up to 3 MetaTrader accounts and auto-import your trades via MetaApi bridge." },
  { icon: BarChart3, title: "Live Analytics", desc: "Equity curves, win rates, monthly P/L breakdowns, and pair performance at a glance." },
  { icon: BookOpen, title: "Trade Journal", desc: "Log every trade with notes, screenshots, and strategy tags. Learn from your history." },
  { icon: Calendar, title: "Calendar View", desc: "See your trading activity mapped to each day — spot patterns and streaks instantly." },
  { icon: Shield, title: "Risk Management", desc: "Track drawdown, profit factor, and risk-reward ratios to protect your capital." },
  { icon: Trophy, title: "Leaderboard", desc: "Benchmark your performance against the community and climb the ranks." },
];

const stats = [
  { value: "10K+", label: "Trades Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 5min", label: "Sync Interval" },
  { value: "3", label: "MT Accounts" },
];

const steps = [
  { num: "01", title: "Create Your Account", desc: "Sign up in seconds with your email. No credit card required." },
  { num: "02", title: "Connect MetaTrader", desc: "Add your MT4/MT5 investor password. We pull trades automatically." },
  { num: "03", title: "Analyze & Improve", desc: "Use analytics, journal entries, and the calendar to level up your trading." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">TradeCircle</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gap-1.5">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/8 blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-6"
          >
            <Zap className="w-3 h-3" />
            Now with MetaTrader 4/5 Auto-Sync
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
          >
            Your Forex Trading{" "}
            <span className="gradient-text">Command Center</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Connect your MetaTrader accounts, auto-sync trades, and get powerful analytics — journal, calendar, and leaderboard all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto">
                Start Trading Smarter <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto">
                See Features <ChevronRight className="w-4 h-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-5xl mx-auto py-10 px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                className="text-center"
              >
                <div className="text-3xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to level up</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              A complete suite of tools designed to help you analyze, reflect, and improve your trading performance.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
                className="glass-card p-6 space-y-3 group hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold">Get started in 3 steps</h2>
            <p className="text-muted-foreground mt-3">From signup to synced trades in under 5 minutes.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="relative"
              >
                <div className="text-5xl font-black text-primary/10 mb-3">{step.num}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center glass-card p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-primary fill-primary" />
              ))}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to take control of your trading?</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Join traders who use TradeCircle to track, analyze, and improve their performance every single day.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base px-10 h-12">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">TradeCircle</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TradeCircle. Built for traders, by traders.
          </p>
        </div>
      </footer>
    </div>
  );
}
