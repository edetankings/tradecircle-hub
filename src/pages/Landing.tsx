import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp, BarChart3, BookOpen, Shield, ArrowRight, Calendar, Trophy,
  Monitor, Zap, LineChart, Users, ChevronRight, Star, CheckCircle2,
  Sparkles, Target, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const features = [
  { icon: Monitor, title: "MT4/MT5 Auto-Sync", desc: "Connect up to 3 MetaTrader accounts and auto-import your trades via MetaApi bridge.", tag: "Popular" },
  { icon: BarChart3, title: "Live Analytics", desc: "Equity curves, win rates, monthly P/L breakdowns, and pair performance at a glance.", tag: null },
  { icon: BookOpen, title: "Trade Journal", desc: "Log every trade with notes, screenshots, and strategy tags. Learn from your history.", tag: null },
  { icon: Calendar, title: "Calendar View", desc: "See your trading activity mapped to each day — spot patterns and streaks instantly.", tag: null },
  { icon: Shield, title: "Risk Management", desc: "Track drawdown, profit factor, and risk-reward ratios to protect your capital.", tag: null },
  { icon: Trophy, title: "Leaderboard", desc: "Benchmark your performance against the community and climb the ranks.", tag: "New" },
];

const stats = [
  { value: "10K+", label: "Trades Tracked", icon: LineChart },
  { value: "99.9%", label: "Uptime", icon: Zap },
  { value: "< 5min", label: "Sync Interval", icon: Target },
  { value: "3", label: "MT Accounts", icon: Monitor },
];

const steps = [
  { num: "01", title: "Create Your Account", desc: "Sign up in seconds with your email. No credit card required.", icon: Users },
  { num: "02", title: "Connect MetaTrader", desc: "Add your MT4/MT5 investor password. We pull trades automatically.", icon: Monitor },
  { num: "03", title: "Analyze & Improve", desc: "Use analytics, journal entries, and the calendar to level up your trading.", icon: Brain },
];

const testimonials = [
  { name: "Alex M.", role: "Forex Trader", text: "TradeCircle completely changed how I review my trades. The auto-sync saves me hours every week.", rating: 5 },
  { name: "Sarah K.", role: "Day Trader", text: "The analytics dashboard gives me insights I never had before. My win rate improved by 15%.", rating: 5 },
  { name: "James W.", role: "Swing Trader", text: "Best trading journal I've used. The calendar view helps me spot my most profitable patterns.", rating: 5 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] rounded-full bg-primary/[0.03] blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-[120px]" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full bg-accent/[0.02] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/60 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
              <TrendingUp className="w-[18px] h-[18px] text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">TradeCircle</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/20">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section ref={heroRef} className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-6">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Now with MetaTrader 4/5 Auto-Sync
            <ChevronRight className="w-3 h-3" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]"
          >
            Your Forex Trading
            <br />
            <span className="gradient-text">Command Center</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Connect your MetaTrader accounts, auto-sync trades, and unlock powerful analytics — journal, calendar, and leaderboard all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base px-10 h-13 w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-shadow">
                Start Trading Smarter <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-13 w-full sm:w-auto border-border/50 hover:bg-card">
                Explore Features <ChevronRight className="w-4 h-4" />
              </Button>
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
          >
            {["No credit card required", "Free forever plan", "Setup in 2 minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-4xl mx-auto mt-16 relative z-10"
        >
          <div className="glass-card p-1 rounded-2xl shadow-2xl shadow-primary/10">
            <div className="bg-card rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 h-6 rounded-lg bg-muted/50 max-w-xs mx-auto" />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Balance", val: "$12,450", color: "text-foreground" },
                  { label: "Profit", val: "+$2,340", color: "text-profit" },
                  { label: "Win Rate", val: "67.5%", color: "text-primary" },
                  { label: "Trades", val: "142", color: "text-foreground" },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</div>
                    <div className={`text-lg font-bold ${m.color} mt-1`}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div className="h-32 bg-muted/20 rounded-lg flex items-end justify-evenly px-4 pb-3 gap-1">
                {[40, 55, 35, 70, 60, 80, 45, 65, 75, 90, 50, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
                    className="w-full rounded-sm bg-gradient-to-t from-primary/40 to-primary/80"
                  />
                ))}
              </div>
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary/10 blur-[60px] rounded-full" />
        </motion.div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm relative">
        <div className="max-w-5xl mx-auto py-12 px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={itemVariants} className="text-center group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Features</span>
            <h2 className="text-3xl md:text-5xl font-bold">Everything you need to level up</h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-lg">
              A complete suite of tools designed to help you analyze, reflect, and improve your trading performance.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="glass-card p-6 space-y-3 group hover:border-primary/25 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {f.tag && (
                  <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {f.tag}
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <f.icon className="w-5.5 h-5.5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 px-6 bg-card/20 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">How It Works</span>
            <h2 className="text-3xl md:text-5xl font-bold">Get started in 3 steps</h2>
            <p className="text-muted-foreground mt-4 text-lg">From signup to synced trades in under 5 minutes.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i, duration: 0.5 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/15 flex items-center justify-center mx-auto mb-5 relative z-10">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary/40 uppercase tracking-widest mb-2">Step {step.num}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-28 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold">Loved by traders worldwide</h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={itemVariants} className="glass-card p-6 space-y-4 hover:border-primary/20 transition-all duration-300">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-primary/5" />
          <div className="absolute inset-0 border border-primary/10 rounded-3xl" />
          <div className="relative z-10 p-12 md:p-20">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to take control of your trading?</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-10 text-lg">
              Join traders who use TradeCircle to track, analyze, and improve their performance every single day.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base px-12 h-13 shadow-xl shadow-primary/25">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6 bg-card/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold">TradeCircle</span>
          </div>
          <nav className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TradeCircle. Built for traders, by traders.
          </p>
        </div>
      </footer>
    </div>
  );
}
