import TradingPlanWidget from "@/components/TradingPlanWidget";

export default function TradingPlan() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trading Plan</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Set your rules, limits, and discipline guidelines before you trade.
        </p>
      </div>
      <TradingPlanWidget />
    </div>
  );
}
