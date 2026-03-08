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
  const [accountBalance, setAccountBalance] = useState("10000");
  const [riskPercent, setRiskPercent] = useState("2");
  const [stopLossPips, setStopLossPips] = useState("30");
  const [pipValue, setPipValue] = useState("10");

  const calc = useMemo(() => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = (parseFloat(riskPercent) || 0) / 100;
    const sl = parseFloat(stopLossPips) || 1;
    const pv = parseFloat(pipValue) || 10;

    const riskAmount = balance * risk;
    const lotSize = riskAmount / (sl * pv);
    const rrRatio2 = riskAmount * 2;
    const rrRatio3 = riskAmount * 3;

    return {
      riskAmount: riskAmount.toFixed(2),
      lotSize: lotSize.toFixed(2),
      rrRatio2: rrRatio2.toFixed(2),
      rrRatio3: rrRatio3.toFixed(2),
    };
  }, [accountBalance, riskPercent, stopLossPips, pipValue]);

  // Compounding calculator
  const [compBalance, setCompBalance] = useState("10000");
  const [monthlyReturn, setMonthlyReturn] = useState("5");
  const [months, setMonths] = useState("12");

  const compounding = useMemo(() => {
    const b = parseFloat(compBalance) || 0;
    const r = (parseFloat(monthlyReturn) || 0) / 100;
    const m = parseInt(months) || 0;
    const results: { month: number; balance: number }[] = [];
    let balance = b;
    for (let i = 1; i <= m; i++) {
      balance *= 1 + r;
      results.push({ month: i, balance: Math.round(balance * 100) / 100 });
    }
    return { finalBalance: balance.toFixed(2), totalGain: ((balance - b) / b * 100).toFixed(1), results };
  }, [compBalance, monthlyReturn, months]);

  const fc = "bg-secondary border-border text-foreground";

  return (
    <div className="space-y-6">
      {/* Position Size Calculator */}
      <motion.div {...fade(0.05)} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Position Size Calculator</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Account Balance ($)</label>
            <Input type="number" className={fc} value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Risk (%)</label>
            <Input type="number" className={fc} value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Stop Loss (pips)</label>
            <Input type="number" className={fc} value={stopLossPips} onChange={(e) => setStopLossPips(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Pip Value ($)</label>
            <Input type="number" className={fc} value={pipValue} onChange={(e) => setPipValue(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Risk Amount", value: `$${calc.riskAmount}`, icon: DollarSign, color: "text-loss" },
            { label: "Position Size", value: `${calc.lotSize} lots`, icon: BarChart3, color: "text-primary" },
            { label: "TP at 1:2 RR", value: `$${calc.rrRatio2}`, icon: Target, color: "text-profit" },
            { label: "TP at 1:3 RR", value: `$${calc.rrRatio3}`, icon: TrendingUp, color: "text-profit" },
          ].map((item) => (
            <div key={item.label} className="stat-card">
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                <p className="text-[10px] text-muted-foreground uppercase">{item.label}</p>
              </div>
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Compounding Calculator */}
      <motion.div {...fade(0.1)} className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-profit/15 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-profit" />
          </div>
          <h2 className="text-base font-semibold text-foreground">Compounding Calculator</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Starting Balance ($)</label>
            <Input type="number" className={fc} value={compBalance} onChange={(e) => setCompBalance(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Monthly Return (%)</label>
            <Input type="number" className={fc} value={monthlyReturn} onChange={(e) => setMonthlyReturn(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Months</label>
            <Input type="number" className={fc} value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="stat-card">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Final Balance</p>
            <p className="text-lg font-bold text-profit">${compounding.finalBalance}</p>
          </div>
          <div className="stat-card">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Total Return</p>
            <p className="text-lg font-bold text-profit">{compounding.totalGain}%</p>
          </div>
        </div>

        {compounding.results.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {compounding.results.map((r) => (
              <div key={r.month} className="text-center p-2 bg-secondary/50 rounded-lg">
                <p className="text-[10px] text-muted-foreground">Month {r.month}</p>
                <p className="text-xs font-semibold text-foreground">${r.balance.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function StrategiesSection() {
  const strategies = [
    {
      name: "Breakout Trading",
      difficulty: "Beginner",
      description: "Trade when price breaks through key support/resistance levels with increased volume.",
      rules: ["Identify consolidation zones", "Wait for candle close above/below level", "Enter with confirmation candle", "SL below breakout level"],
      pairs: ["EURUSD", "GBPUSD", "USDJPY"],
      timeframes: ["H1", "H4", "D1"],
    },
    {
      name: "Supply & Demand",
      difficulty: "Intermediate",
      description: "Identify institutional order blocks where major buying/selling occurred and trade reactions from those zones.",
      rules: ["Mark fresh supply/demand zones from strong moves", "Wait for price to return to the zone", "Enter with a rejection candle", "Target the opposing zone"],
      pairs: ["EURUSD", "GBPJPY", "XAUUSD"],
      timeframes: ["H4", "D1"],
    },
    {
      name: "ICT Concepts",
      difficulty: "Advanced",
      description: "Inner Circle Trader methodology focusing on liquidity, order blocks, fair value gaps, and smart money concepts.",
      rules: ["Identify liquidity pools above/below highs and lows", "Wait for liquidity sweep", "Enter at order block with FVG confluence", "Target opposing liquidity"],
      pairs: ["EURUSD", "GBPUSD", "NAS100"],
      timeframes: ["M15", "H1", "H4"],
    },
    {
      name: "Moving Average Crossover",
      difficulty: "Beginner",
      description: "Use two moving averages (fast and slow) to identify trend changes and momentum shifts.",
      rules: ["Use 20 EMA and 50 EMA", "Buy when fast crosses above slow", "Sell when fast crosses below slow", "Use ATR for stop loss distance"],
      pairs: ["Any major pair"],
      timeframes: ["H1", "H4", "D1"],
    },
  ];

  const difficultyColor = (d: string) => {
    if (d === "Beginner") return "text-profit bg-profit/10";
    if (d === "Intermediate") return "text-yellow-400 bg-yellow-500/10";
    return "text-loss bg-loss/10";
  };

  return (
    <div className="space-y-4">
      {strategies.map((strat, i) => (
        <motion.div key={strat.name} {...fade(0.05 + i * 0.05)} className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">{strat.name}</h3>
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${difficultyColor(strat.difficulty)}`}>
              {strat.difficulty}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{strat.description}</p>

          <div>
            <p className="text-xs font-medium text-foreground mb-2">Trading Rules:</p>
            <div className="space-y-1.5">
              {strat.rules.map((rule, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                  <p className="text-xs text-muted-foreground">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Pairs: </span>
              {strat.pairs.map((p) => (
                <span key={p} className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] mr-1">{p}</span>
              ))}
            </div>
            <div>
              <span className="font-medium text-foreground">Timeframes: </span>
              {strat.timeframes.map((tf) => (
                <span key={tf} className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px] mr-1">{tf}</span>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
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
