import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp, BarChart3, BookOpen, Shield, ArrowRight, Calendar, Trophy,
  Monitor, Zap, LineChart, Users, ChevronRight, Star, CheckCircle2,
  Sparkles, Target, Brain, Globe, Lock, Smartphone,
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

const trustBadges = [
  { icon: Lock, label: "Bank-grade encryption" },
  { icon: Globe, label: "Used in 40+ countries" },
  { icon: Smartphone, label: "Fully responsive" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Ambient background — richer multi-layer glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[900px] rounded-full bg-primary/[0.04] blur-[180px]" />
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full bg-primary/[0.03] blur-[140px]" />
        <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] rounded-full bg-accent/[0.02] blur-[120px]" />
        <div className="absolute top-2/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[hsl(163_100%_39%/0.02)] blur-[100px]" />
      </div>

      {/* Header — tighter, more refined */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 h-16">
          <Link to="/landing" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-shadow">
              <TrendingUp className="w-[18px] h-[18px] text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">TradeCircle</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors duration-200">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Log In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gap-1.5 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — more dramatic spacing & parallax */}
      <section ref={heroRef} className="relative pt-36 md:pt-48 pb-24 md:pb-36 px-6">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/[0.06] text-primary text-xs font-semibold mb-10 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Now with MetaTrader 4/5 Auto-Sync
            <ChevronRight className="w-3 h-3" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-5xl sm:text-6xl md:text-[5.5rem] font-extrabold tracking-[-0.03em] leading-[1.05]"
          >
            Your Forex Trading
            <br />
            <span className="gradient-text">Command Center</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-7 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Connect your MetaTrader accounts, auto-sync trades, and unlock powerful analytics — journal, calendar, and leaderboard all in one platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base px-10 h-14 w-full sm:w-auto shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300">
                Start Trading Smarter <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-14 w-full sm:w-auto border-border/50 hover:bg-card hover:border-primary/20 transition-all duration-300">
                Explore Features <ChevronRight className="w-4 h-4" />
              </Button>
            </a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-14 flex flex-wrap items-center justify-center gap-8 text-xs text-muted-foreground"
          >
            {["No credit card required", "Free forever plan", "Setup in 2 minutes"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary/70" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating dashboard mockup — more depth */}
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-5xl mx-auto mt-20 relative z-10"
        >
          <div className="glass-card p-1.5 rounded-2xl shadow-2xl shadow-primary/10 relative">
            <div className="bg-card rounded-xl p-6 md:p-8 space-y-5">
              {/* Window chrome */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(var(--profit))]/50" />
                </div>
                <div className="flex-1 h-7 rounded-lg bg-muted/40 max-w-sm mx-auto" />
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Balance", val: "$12,450", color: "text-foreground" },
                  { label: "Profit", val: "+$2,340", color: "text-profit" },
                  { label: "Win Rate", val: "67.5%", color: "text-primary" },
                  { label: "Trades", val: "142", color: "text-foreground" },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/30 rounded-xl p-4 text-center">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{m.label}</div>
                    <div className={`text-xl font-bold ${m.color} mt-1.5`}>{m.val}</div>
                  </div>
                ))}
              </div>
              {/* Chart mockup */}
              <div className="h-36 md:h-44 bg-muted/15 rounded-xl flex items-end justify-evenly px-5 pb-4 gap-1.5">
                {[40, 55, 35, 70, 60, 80, 45, 65, 75, 90, 50, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 0.7 + i * 0.05, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="w-full rounded-md bg-gradient-to-t from-primary/30 to-primary/70"
                  />
                ))}
              </div>
            </div>
            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-2xl border border-primary/[0.08] pointer-events-none" />
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-4/5 h-24 bg-primary/8 blur-[80px] rounded-full" />
        </motion.div>
      </section>

      {/* Stats Strip — tighter with subtle dividers */}
      <section className="border-y border-border/40 bg-card/20 backdrop-blur-sm relative">
        <div className="max-w-6xl mx-auto py-14 px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-border/30"
          >
            {stats.map((s) => (
              <motion.div key={s.label} variants={itemVariants} className="text-center group px-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                  <s.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1.5 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features — more spacious cards with hover glow */}
      <section id="features" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10">
              <Sparkles className="w-3 h-3" /> Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Everything you need to level up</h2>
            <p className="text-muted-foreground mt-5 max-w-lg mx-auto text-lg leading-relaxed">
              A complete suite of tools designed to help you analyze, reflect, and improve your trading performance.
            </p>
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="glass-card p-7 space-y-4 group hover:border-primary/20 transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {f.tag && (
                  <span className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/15">
                    {f.tag}
                  </span>
                )}
                <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <f.icon className="w-5.5 h-5.5 text-primary" />
                </div>
                <h3 className="relative font-semibold text-foreground text-lg">{f.title}</h3>
                <p className="relative text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works — elevated cards */}
      <section id="how-it-works" className="py-32 px-6 bg-card/15 relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10">
              <Target className="w-3 h-3" /> How It Works
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Get started in 3 steps</h2>
            <p className="text-muted-foreground mt-5 text-lg">From signup to synced trades in under 5 minutes.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-20 left-[22%] right-[22%] h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 * i, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="relative text-center glass-card p-8 group hover:border-primary/15 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:scale-110 group-hover:border-primary/20 transition-all duration-300">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-[11px] font-bold text-primary/40 uppercase tracking-[0.2em] mb-3">Step {step.num}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — refined cards with better hierarchy */}
      <section id="testimonials" className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary mb-4 px-4 py-1.5 rounded-full bg-primary/[0.06] border border-primary/10">
              <Star className="w-3 h-3" /> Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Loved by traders worldwide</h2>
            <p className="text-muted-foreground mt-5 text-lg max-w-md mx-auto">
              See what our community says about TradeCircle.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="glass-card p-7 space-y-5 hover:border-primary/15 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border/40">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary ring-2 ring-primary/10">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust badges strip */}
      <section className="py-16 px-6 border-y border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-3 gap-6"
          >
            {trustBadges.map((b) => (
              <motion.div key={b.label} variants={itemVariants} className="flex flex-col items-center gap-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-primary/[0.06] border border-primary/10 flex items-center justify-center">
                  <b.icon className="w-5 h-5 text-primary/70" />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{b.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA — more dramatic gradient */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-3xl mx-auto text-center relative overflow-hidden rounded-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-card to-primary/[0.04]" />
          <div className="absolute inset-0 border border-primary/10 rounded-3xl" />
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-32 bg-primary/10 blur-[60px] rounded-full" />
          <div className="relative z-10 p-14 md:p-24">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-18 h-18 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8 border border-primary/10"
            >
              <Sparkles className="w-9 h-9 text-primary" />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-bold mb-5 tracking-tight">Ready to take control?</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-12 text-lg leading-relaxed">
              Join traders who use TradeCircle to track, analyze, and improve their performance every single day.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2 text-base px-14 h-14 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer — cleaner layout */}
      <footer className="border-t border-border/40 py-14 px-6 bg-card/15">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <Link to="/landing" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md shadow-primary/15">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">TradeCircle</span>
          </Link>
          <nav className="flex items-center gap-8 text-xs text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors duration-200">How It Works</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors duration-200">Reviews</a>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} TradeCircle. Built for traders, by traders.
          </p>
        </div>
      </footer>
    </div>
  );
}
