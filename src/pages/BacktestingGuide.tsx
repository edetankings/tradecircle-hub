import { motion } from "framer-motion";
import { BookOpen, Cog, BarChart3, RefreshCw, ClipboardList, Bot, AlertTriangle, Rocket } from "lucide-react";

const fade = (delay: number) => ({ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } });

const steps = [
  { icon: ClipboardList, title: "Step 1 – Define Strategy", desc: "Create clear rules for entry conditions, exit conditions, stop loss, take profit, and risk per trade. Your strategy must be rule-based to be testable." },
  { icon: Cog, title: "Step 2 – Apply to Historical Data", desc: "Software scans past price data and simulates trades based on your defined rules. This replays historical market conditions against your strategy." },
  { icon: BarChart3, title: "Step 3 – Analyze Results", desc: "Review key metrics: Win Rate, Profit Factor, Maximum Drawdown, Risk-to-Reward Ratio, and Total Net Profit to evaluate performance." },
  { icon: RefreshCw, title: "Step 4 – Optimize Strategy", desc: "Adjust parameters such as stop loss distance, entry timing, or lot sizing — then test again to improve results iteratively." },
];

const metrics = ["Win Rate", "Profit Factor", "Maximum Drawdown", "Risk-to-Reward Ratio", "Total Net Profit"];

export default function BacktestingGuide() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <motion.div {...fade(0)}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Backtesting Guide</h1>
        <p className="text-muted-foreground text-sm mt-1">Learn how to test your forex strategies using historical data.</p>
      </motion.div>

      {/* Introduction */}
      <motion.div {...fade(0.05)} className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">What is Forex Backtesting?</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Forex backtesting is the process of testing a trading strategy using historical market data to evaluate how it would have performed in the past. Instead of risking real money, traders simulate trades based on predefined rules such as entry points, exit conditions, and risk management.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {["MetaTrader 4", "MetaTrader 5", "TradingView"].map((p) => (
            <span key={p} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{p}</span>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div {...fade(0.1)} className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">How Backtesting Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <motion.div key={i} {...fade(0.15 + i * 0.05)} className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                  <step.icon className="w-4.5 h-4.5 text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              {i === 2 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {metrics.map((m) => (
                    <span key={m} className="px-2 py-0.5 rounded bg-secondary text-[10px] font-medium text-foreground">{m}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Manual vs Automated */}
      <motion.div {...fade(0.4)} className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Manual vs Automated Backtesting</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                <ClipboardList className="w-4.5 h-4.5 text-primary" />
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
                <Bot className="w-4.5 h-4.5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Automated Backtesting</h3>
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />Software runs simulations automatically</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />Tests thousands of trades quickly</li>
              <li className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />Requires strategy scripts or algorithms</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div {...fade(0.5)} className="glass-card p-5 border-l-4 border-loss">
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-loss" />
          <h3 className="text-sm font-semibold text-foreground">Important Note</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Past performance does not guarantee future results. Even if a strategy performs well in backtesting, traders should still use proper risk management and forward testing before trading live.
        </p>
      </motion.div>

      {/* Coming Soon */}
      <motion.div {...fade(0.55)} className="glass-card p-6 text-center space-y-3 border border-dashed border-accent/30">
        <Rocket className="w-8 h-8 text-accent mx-auto" />
        <h3 className="text-base font-semibold text-foreground">Coming Soon: Strategy Backtesting Analyzer</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Upload your trading results and automatically calculate Win Rate, Drawdown, Profit Factor, and Strategy Score — all inside TradeCircle.
        </p>
      </motion.div>
    </div>
  );
}
