export interface Trade {
  id: string;
  pair: string;
  type: "Buy" | "Sell";
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  profitLoss: number;
  date: string;
  strategy: string;
  notes: string;
  screenshot?: string;
}
