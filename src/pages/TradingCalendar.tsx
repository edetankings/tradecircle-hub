import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { Button } from "@/components/ui/button";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function TradingCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data: trades = [] } = useTrades();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const tradesByDate = useMemo(() => {
    const map: Record<string, { count: number; pnl: number }> = {};
    trades.forEach((t) => {
      if (!map[t.date]) map[t.date] = { count: 0, pnl: 0 };
      map[t.date].count++;
      map[t.date].pnl += t.profit_loss;
    });
    return map;
  }, [trades]);

  const prev = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  const selectedTrades = selectedDate ? trades.filter((t) => t.date === selectedDate) : [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trading Calendar</h1>
        <p className="text-muted-foreground text-sm mt-1">Visualize your daily trading performance.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={prev} className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="text-lg font-semibold text-foreground">{MONTHS[month]} {year}</h2>
          <Button variant="ghost" size="icon" onClick={next} className="text-muted-foreground hover:text-foreground"><ChevronRight className="w-5 h-5" /></Button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const data = tradesByDate[dateStr];
            const isToday = dateStr === today;

            return (
              <button
                key={day}
                onClick={() => data && setSelectedDate(dateStr)}
                className={`aspect-square rounded-lg p-1 flex flex-col items-center justify-center text-xs transition-all duration-200
                  ${data ? (data.pnl >= 0 ? "bg-profit/10 hover:bg-profit/20 border border-profit/20" : "bg-loss/10 hover:bg-loss/20 border border-loss/20") : "hover:bg-secondary border border-transparent"}
                  ${isToday ? "ring-1 ring-primary" : ""}
                `}
              >
                <span className={`font-medium ${data ? (data.pnl >= 0 ? "text-profit" : "text-loss") : "text-muted-foreground"}`}>{day}</span>
                {data && (
                  <>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{data.count} trade{data.count > 1 ? "s" : ""}</span>
                    <span className={`text-[10px] font-semibold ${data.pnl >= 0 ? "text-profit" : "text-loss"}`}>
                      {data.pnl >= 0 ? "+" : ""}${data.pnl}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedDate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{selectedDate}</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="text-muted-foreground"><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-3">
                {selectedTrades.map((t) => (
                  <div key={t.id} className="bg-secondary/50 rounded-lg p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{t.pair}</span>
                      <span className={`font-semibold ${t.profit_loss >= 0 ? "text-profit" : "text-loss"}`}>
                        {t.profit_loss >= 0 ? "+" : ""}${t.profit_loss}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`px-1.5 py-0.5 rounded ${t.type === "Buy" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"}`}>{t.type}</span>
                      <span>{t.entry_price} → {t.exit_price}</span>
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">{t.strategy}</span>
                    </div>
                    {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
