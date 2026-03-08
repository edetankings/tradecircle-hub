import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Cog, BarChart3, RefreshCw, ClipboardList, Bot, AlertTriangle, Rocket,
  Calculator, Shield, Target, TrendingUp, Zap, GraduationCap, DollarSign, Percent,
  ChevronDown, ChevronUp, Brain, Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function BacktestingGuide() {
  const [activeTab, setActiveTab] = useState("guides");

  return (
    <div className="space-y-6">
      <motion.div {...fade(0)}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Resources</h1>
        <p className="text-muted-foreground text-sm mt-1">Trading guides, calculators, and educational resources.</p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides" className="gap-1.5 text-xs"><GraduationCap className="w-3.5 h-3.5" /> Guides</TabsTrigger>
          <TabsTrigger value="calculators" className="gap-1.5 text-xs"><Calculator className="w-3.5 h-3.5" /> Calculators</TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5 text-xs"><Rocket className="w-3.5 h-3.5" /> Videos</TabsTrigger>
          <TabsTrigger value="psychology" className="gap-1.5 text-xs"><Lightbulb className="w-3.5 h-3.5" /> Psychology</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-4"><GuidesSection /></TabsContent>
        <TabsContent value="calculators" className="mt-4"><CalculatorsSection /></TabsContent>
        <TabsContent value="videos" className="mt-4"><VideosSection /></TabsContent>
        <TabsContent value="psychology" className="mt-4"><PsychologySection /></TabsContent>
      </Tabs>
    </div>
  );
}

function GuidesSection() {
  const guides = [
    {
      icon: BookOpen, title: "Forex Backtesting Guide",
      content: "Forex backtesting tests a trading strategy using historical market data. Instead of risking real money, traders simulate trades based on predefined entry/exit rules.",
      steps: [
        "Define strategy rules: entry conditions, exit conditions, SL, TP, risk per trade",
        "Apply rules to historical price data (MT4/MT5 Strategy Tester or TradingView)",
        "Analyze metrics: Win Rate, Profit Factor, Max Drawdown, Sharpe Ratio",
        "Optimize parameters iteratively and forward-test before going live",
      ],
    },
    {
      icon: Shield, title: "Risk Management Fundamentals",
      content: "Proper risk management is the foundation of long-term trading success. Never risk more than you can afford to lose on a single trade.",
      steps: [
        "Risk 1-2% of your account per trade maximum",
        "Always use stop losses — never trade without one",
        "Calculate position size based on your stop loss distance",
        "Maintain a minimum 1:2 risk-to-reward ratio",
      ],
    },
    {
      icon: Target, title: "Building a Trading Plan",
      content: "A trading plan defines when to enter, when to exit, how much to risk, and which pairs to trade. It removes emotion from decision-making.",
      steps: [
        "Define your trading style: scalping, day trading, or swing trading",
        "Choose 2-4 currency pairs to focus on",
        "Set daily/weekly loss limits",
        "Journal every trade and review weekly",
      ],
    },
    {
      icon: BarChart3, title: "Reading Price Action",
      content: "Price action trading relies on raw price movement without lagging indicators. Learn to read candlestick patterns, support/resistance, and market structure.",
      steps: [
        "Master key candlestick patterns: pin bars, engulfing, inside bars",
        "Identify support and resistance zones",
        "Understand market structure: HH/HL (uptrend), LH/LL (downtrend)",
        "Trade with the trend, not against it",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {guides.map((guide, i) => (
        <motion.div key={guide.title} {...fade(0.05 + i * 0.05)} className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
              <guide.icon className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{guide.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{guide.content}</p>
          <div className="space-y-2">
            {guide.steps.map((step, j) => (
              <div key={j} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                <p className="text-xs text-muted-foreground">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Manual vs Automated */}
      <motion.div {...fade(0.3)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Manual Backtesting</h3>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />Scroll through historical charts manually</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />Record trades in a journal</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />Helps understand price action deeply</li>
          </ul>
        </div>
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Automated Backtesting</h3>
          </div>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />Software runs simulations automatically</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />Tests thousands of trades quickly</li>
            <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />Requires strategy scripts or algorithms</li>
          </ul>
        </div>
      </motion.div>

      <motion.div {...fade(0.4)} className="glass-card p-5 border-l-4 border-loss">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-loss" />
          <h3 className="text-sm font-semibold text-foreground">Important Note</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Past performance does not guarantee future results. Always use proper risk management and forward testing before trading live.
        </p>
      </motion.div>
    </div>
  );
}

function CalculatorsSection() {
  // Position Size
  const [psBalance, setPsBalance] = useState("10000");
  const [psRisk, setPsRisk] = useState("2");
  const [psSL, setPsSL] = useState("30");

  const posSize = useMemo(() => {
    const balance = parseFloat(psBalance) || 0;
    const risk = (parseFloat(psRisk) || 0) / 100;
    const sl = parseFloat(psSL) || 1;
    const riskAmount = balance * risk;
    const lotSize = riskAmount / (sl * 10);
    return { riskAmount: riskAmount.toFixed(2), lotSize: lotSize.toFixed(2) };
  }, [psBalance, psRisk, psSL]);

  // Risk to Reward
  const [rrEntry, setRrEntry] = useState("1.1000");
  const [rrSL, setRrSL] = useState("1.0950");
  const [rrTP, setRrTP] = useState("1.1100");

  const rrCalc = useMemo(() => {
    const entry = parseFloat(rrEntry) || 0;
    const sl = parseFloat(rrSL) || 0;
    const tp = parseFloat(rrTP) || 0;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(tp - entry);
    const ratio = risk > 0 ? reward / risk : 0;
    return { risk: risk.toFixed(5), reward: reward.toFixed(5), ratio: ratio.toFixed(2) };
  }, [rrEntry, rrSL, rrTP]);

  // Profit Calculator
  const [profitPair, setProfitPair] = useState("EUR/USD");
  const [profitLot, setProfitLot] = useState("1.0");
  const [profitEntry, setProfitEntry] = useState("1.1000");
  const [profitExit, setProfitExit] = useState("1.1050");

  const profitCalc = useMemo(() => {
    const lot = parseFloat(profitLot) || 0;
    const entry = parseFloat(profitEntry) || 0;
    const exit = parseFloat(profitExit) || 0;
    const pipDiff = (exit - entry) * 10000; // standard pip calculation
    const isJPY = profitPair.includes("JPY");
    const pips = isJPY ? (exit - entry) * 100 : pipDiff;
    const pipVal = isJPY ? 1000 : 10; // approximate per standard lot
    const pnl = pips * pipVal * lot;
    return { pips: pips.toFixed(1), pnl: pnl.toFixed(2), isProfit: pnl >= 0 };
  }, [profitPair, profitLot, profitEntry, profitExit]);

  // Drawdown Calculator
  const [ddStart, setDdStart] = useState("10000");
  const [ddEnd, setDdEnd] = useState("8500");

  const ddCalc = useMemo(() => {
    const start = parseFloat(ddStart) || 0;
    const end = parseFloat(ddEnd) || 0;
    const loss = start - end;
    const pct = start > 0 ? (loss / start) * 100 : 0;
    const recoveryPct = end > 0 ? (loss / end) * 100 : 0;
    return { loss: loss.toFixed(2), pct: pct.toFixed(2), recoveryPct: recoveryPct.toFixed(2) };
  }, [ddStart, ddEnd]);

  const fc = "bg-secondary border-border text-foreground";

  return (
    <div className="space-y-6">
      {/* Position Size Calculator */}
      <motion.div {...fade(0.05)} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Position Size Calculator</h2>
            <p className="text-xs text-muted-foreground">Calculate the optimal lot size based on your risk parameters.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Account Balance ($)</label>
            <Input type="number" step="any" min="0" className={fc} value={psBalance} onChange={(e) => setPsBalance(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Risk (%)</label>
            <Input type="number" step="any" min="0" max="100" className={fc} value={psRisk} onChange={(e) => setPsRisk(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Stop Loss (pips)</label>
            <Input type="number" step="any" min="0" className={fc} value={psSL} onChange={(e) => setPsSL(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-loss" />
              <p className="text-[10px] text-muted-foreground uppercase">Risk Amount</p>
            </div>
            <p className="text-lg font-bold text-loss">${posSize.riskAmount}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase">Recommended Lot Size</p>
            </div>
            <p className="text-lg font-bold text-primary">{posSize.lotSize} lots</p>
          </div>
        </div>
      </motion.div>

      {/* Risk to Reward Calculator */}
      <motion.div {...fade(0.1)} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-profit/15 flex items-center justify-center">
            <Target className="w-5 h-5 text-profit" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Risk to Reward Calculator</h2>
            <p className="text-xs text-muted-foreground">Evaluate the risk/reward ratio before entering a trade.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Entry Price</label>
            <Input type="number" step="any" className={fc} value={rrEntry} onChange={(e) => setRrEntry(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Stop Loss</label>
            <Input type="number" step="any" className={fc} value={rrSL} onChange={(e) => setRrSL(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Take Profit</label>
            <Input type="number" step="any" className={fc} value={rrTP} onChange={(e) => setRrTP(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Risk (pips)</p>
            <p className="text-lg font-bold text-loss">{rrCalc.risk}</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Reward (pips)</p>
            <p className="text-lg font-bold text-profit">{rrCalc.reward}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <p className="text-[10px] text-muted-foreground uppercase">R:R Ratio</p>
            </div>
            <p className={`text-xl font-bold ${parseFloat(rrCalc.ratio) >= 2 ? "text-profit" : parseFloat(rrCalc.ratio) >= 1 ? "text-yellow-400" : "text-loss"}`}>
              1:{rrCalc.ratio}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Profit Calculator */}
      <motion.div {...fade(0.15)} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Profit Calculator</h2>
            <p className="text-xs text-muted-foreground">Calculate profit or loss for a trade.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Pair</label>
            <select className={`w-full h-10 rounded-md px-3 text-sm ${fc}`} value={profitPair} onChange={(e) => setProfitPair(e.target.value)}>
              {["EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "EUR/JPY", "XAU/USD"].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Lot Size</label>
            <Input type="number" step="any" min="0" className={fc} value={profitLot} onChange={(e) => setProfitLot(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Entry Price</label>
            <Input type="number" step="any" className={fc} value={profitEntry} onChange={(e) => setProfitEntry(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Exit Price</label>
            <Input type="number" step="any" className={fc} value={profitExit} onChange={(e) => setProfitExit(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Pips</p>
            <p className={`text-lg font-bold ${profitCalc.isProfit ? "text-profit" : "text-loss"}`}>{profitCalc.pips}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className={`w-3.5 h-3.5 ${profitCalc.isProfit ? "text-profit" : "text-loss"}`} />
              <p className="text-[10px] text-muted-foreground uppercase">Profit / Loss</p>
            </div>
            <p className={`text-xl font-bold ${profitCalc.isProfit ? "text-profit" : "text-loss"}`}>
              {profitCalc.isProfit ? "+" : ""}${profitCalc.pnl}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Drawdown Calculator */}
      <motion.div {...fade(0.2)} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-loss/15 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-loss" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Drawdown Calculator</h2>
            <p className="text-xs text-muted-foreground">Calculate drawdown percentage and recovery needed.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Starting Balance ($)</label>
            <Input type="number" step="any" min="0" className={fc} value={ddStart} onChange={(e) => setDdStart(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Current / Lowest Balance ($)</label>
            <Input type="number" step="any" min="0" className={fc} value={ddEnd} onChange={(e) => setDdEnd(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Loss Amount</p>
            <p className="text-lg font-bold text-loss">${ddCalc.loss}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-1">
              <Percent className="w-3.5 h-3.5 text-loss" />
              <p className="text-[10px] text-muted-foreground uppercase">Drawdown</p>
            </div>
            <p className={`text-xl font-bold ${parseFloat(ddCalc.pct) > 20 ? "text-loss" : parseFloat(ddCalc.pct) > 10 ? "text-yellow-400" : "text-profit"}`}>
              {ddCalc.pct}%
            </p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Recovery Needed</p>
            <p className="text-lg font-bold text-primary">{ddCalc.recoveryPct}%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function VideosSection() {
  const videos = [
    {
      title: "How to Read Candlestick Charts",
      description: "Learn the basics of reading candlestick patterns and what they reveal about market sentiment and price direction.",
      duration: "15 min", level: "Beginner", category: "Price Action",
    },
    {
      title: "Risk Management Masterclass",
      description: "A deep dive into position sizing, stop loss placement, and how to protect your capital during volatile markets.",
      duration: "25 min", level: "Beginner", category: "Risk Management",
    },
    {
      title: "Building a Trading Journal",
      description: "Step-by-step guide to creating a trading journal that helps you identify patterns in your performance and psychology.",
      duration: "20 min", level: "Beginner", category: "Education",
    },
    {
      title: "Understanding Market Structure",
      description: "Master higher highs, higher lows, break of structure, and change of character to identify trend direction.",
      duration: "30 min", level: "Intermediate", category: "Price Action",
    },
    {
      title: "Trading Psychology: Handling Losses",
      description: "Practical techniques for managing emotions after losing trades and maintaining discipline during drawdowns.",
      duration: "18 min", level: "All Levels", category: "Psychology",
    },
    {
      title: "Backtesting Your Strategy Properly",
      description: "How to backtest a strategy with historical data, avoid curve-fitting, and validate edge before going live.",
      duration: "22 min", level: "Intermediate", category: "Education",
    },
  ];

  const levelColor = (l: string) => {
    if (l === "Beginner") return "text-profit bg-profit/10";
    if (l === "Intermediate") return "text-yellow-400 bg-yellow-500/10";
    return "text-primary bg-primary/10";
  };

  return (
    <div className="space-y-4">
      <motion.div {...fade(0)} className="glass-card p-5 border-l-4 border-primary">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Video tutorials</span> covering essential trading concepts from beginner to advanced levels. Study these to strengthen your foundation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((video, i) => (
          <motion.div key={video.title} {...fade(0.05 + i * 0.04)} className="glass-card p-5 space-y-3 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${levelColor(video.level)}`}>{video.level}</span>
              <span className="text-[10px] text-muted-foreground">{video.duration}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{video.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{video.description}</p>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px]">{video.category}</span>
              <Rocket className="w-3.5 h-3.5 text-primary" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
function PsychologySection() {
  const topics = [
    {
      icon: Brain, title: "Managing Trading Emotions",
      content: "Fear and greed are the two most destructive emotions in trading. Fear causes you to exit winners too early or avoid valid setups. Greed causes overtrading and moving stop losses.",
      tips: [
        "Follow your trading plan mechanically",
        "Accept that losses are part of the game",
        "Never revenge trade after a loss",
        "Take breaks after 2-3 consecutive losses",
      ],
    },
    {
      icon: Shield, title: "Dealing with Drawdowns",
      content: "Every trading strategy will experience drawdowns. The key is having a plan for when they occur and not deviating from your strategy.",
      tips: [
        "Reduce position size during drawdowns",
        "Review your journal for pattern changes",
        "Don't change your strategy mid-drawdown",
        "Set a maximum daily/weekly loss limit",
      ],
    },
    {
      icon: Target, title: "Building Discipline",
      content: "Discipline is the bridge between your trading plan and your results. Without it, even the best strategy will fail.",
      tips: [
        "Trade the same setup every time",
        "Use a pre-trade checklist",
        "Journal every trade immediately after closing",
        "Review your weekly performance every Sunday",
      ],
    },
    {
      icon: Lightbulb, title: "Growth Mindset in Trading",
      content: "View every trade as a learning opportunity. Losing trades teach you more than winning trades when you analyze them properly.",
      tips: [
        "Focus on process over outcomes",
        "Celebrate following your plan, not just profits",
        "Study your losing trades more than winners",
        "Set skill-based goals, not money-based goals",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {topics.map((topic, i) => (
        <motion.div key={topic.title} {...fade(0.05 + i * 0.05)} className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
              <topic.icon className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{topic.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{topic.content}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topic.tips.map((tip, j) => (
              <div key={j} className="flex items-start gap-2 p-2.5 bg-secondary/50 rounded-lg">
                <Zap className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
