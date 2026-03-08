import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, Globe, Bitcoin, AlertTriangle, Calendar, ExternalLink, RefreshCw, Filter } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: "forex" | "crypto" | "economic";
  impact?: "high" | "medium" | "low";
  currency?: string;
}

interface EconomicEvent {
  title: string;
  country: string;
  currency: string;
  impact: "high" | "medium" | "low";
  date: string;
  time: string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

const CURRENCIES = ["ALL", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];

export default function TradingNews() {
  const [activeTab, setActiveTab] = useState("forex");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke("trading-news", {
        body: { category: activeTab, currency: currencyFilter },
      });
      if (error) throw error;
      if (data?.news) setNews(data.news);
      if (data?.events) setEvents(data.events);
    } catch (err) {
      console.error("Failed to fetch news:", err);
      // Set sample data as fallback
      setNews(getSampleNews(activeTab));
      setEvents(getSampleEvents());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeTab, currencyFilter]);

  const filteredNews = currencyFilter === "ALL"
    ? news
    : news.filter((n) => !n.currency || n.currency === currencyFilter);

  const filteredEvents = currencyFilter === "ALL"
    ? events
    : events.filter((e) => e.currency === currencyFilter);

  const impactColor = (impact?: string) => {
    if (impact === "high") return "bg-loss/20 text-loss border-loss/30";
    if (impact === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Trading News</h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated with market-moving events.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-28 bg-secondary border-border text-foreground">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchNews} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forex" className="gap-2"><Globe className="w-4 h-4" /> Forex</TabsTrigger>
          <TabsTrigger value="crypto" className="gap-2"><Bitcoin className="w-4 h-4" /> Crypto</TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4" /> Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="forex" className="mt-4">
          <NewsGrid news={filteredNews.filter((n) => n.category === "forex")} loading={loading} impactColor={impactColor} />
        </TabsContent>

        <TabsContent value="crypto" className="mt-4">
          <NewsGrid news={filteredNews.filter((n) => n.category === "crypto")} loading={loading} impactColor={impactColor} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <EconomicCalendar events={filteredEvents} loading={loading} impactColor={impactColor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NewsGrid({ news, loading, impactColor }: { news: NewsItem[]; loading: boolean; impactColor: (i?: string) => string }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-3" />
            <div className="h-3 bg-muted rounded w-full mb-2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (news.length === 0) {
    return <div className="glass-card p-12 text-center"><p className="text-muted-foreground">No news available for this filter.</p></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {news.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 hover:border-primary/30 transition-all">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2">{item.title}</h3>
            {item.impact && <Badge className={impactColor(item.impact)} variant="outline">{item.impact}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{item.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{item.source}</span>
              {item.currency && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.currency}</Badge>}
            </div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs flex items-center gap-1 hover:underline">
              Read <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EconomicCalendar({ events, loading, impactColor }: { events: EconomicEvent[]; loading: boolean; impactColor: (i?: string) => string }) {
  if (loading) {
    return (
      <div className="glass-card overflow-x-auto">
        <div className="p-8 text-center"><div className="text-muted-foreground animate-pulse">Loading events...</div></div>
      </div>
    );
  }

  if (events.length === 0) {
    return <div className="glass-card p-12 text-center"><p className="text-muted-foreground">No economic events for this filter.</p></div>;
  }

  return (
    <div className="glass-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-xs">
            <th className="px-4 py-3 text-left font-medium">Time</th>
            <th className="px-4 py-3 text-left font-medium">Currency</th>
            <th className="px-4 py-3 text-left font-medium">Event</th>
            <th className="px-4 py-3 text-left font-medium">Impact</th>
            <th className="px-4 py-3 text-left font-medium">Forecast</th>
            <th className="px-4 py-3 text-left font-medium">Previous</th>
            <th className="px-4 py-3 text-left font-medium">Actual</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, i) => (
            <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{event.time}</td>
              <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{event.currency}</Badge></td>
              <td className="px-4 py-3 text-foreground font-medium">{event.title}</td>
              <td className="px-4 py-3"><Badge className={impactColor(event.impact)} variant="outline">{event.impact}</Badge></td>
              <td className="px-4 py-3 text-muted-foreground">{event.forecast || "-"}</td>
              <td className="px-4 py-3 text-muted-foreground">{event.previous || "-"}</td>
              <td className="px-4 py-3 text-foreground font-medium">{event.actual || "-"}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Fallback sample data
function getSampleNews(category: string): NewsItem[] {
  if (category === "forex") {
    return [
      { title: "Fed Signals Potential Rate Pause in Next Meeting", description: "Federal Reserve officials hinted at a possible pause in interest rate hikes, citing cooling inflation data.", url: "#", source: "Reuters", publishedAt: new Date().toISOString(), category: "forex", impact: "high", currency: "USD" },
      { title: "EUR/USD Consolidates Near 1.0850 Ahead of ECB Decision", description: "The euro remains range-bound as traders await the European Central Bank's monetary policy decision.", url: "#", source: "FX Street", publishedAt: new Date().toISOString(), category: "forex", impact: "medium", currency: "EUR" },
      { title: "GBP Strengthens on Better-Than-Expected GDP Data", description: "Sterling gained against major currencies after UK GDP showed unexpected growth.", url: "#", source: "Bloomberg", publishedAt: new Date().toISOString(), category: "forex", impact: "high", currency: "GBP" },
      { title: "JPY Weakens as Bank of Japan Maintains Ultra-Loose Policy", description: "The Japanese yen fell after the BOJ decided to keep its yield curve control policy unchanged.", url: "#", source: "Nikkei", publishedAt: new Date().toISOString(), category: "forex", impact: "high", currency: "JPY" },
      { title: "AUD/USD Drops After Weak Chinese Manufacturing PMI", description: "The Australian dollar came under pressure following disappointing Chinese economic data.", url: "#", source: "CNBC", publishedAt: new Date().toISOString(), category: "forex", impact: "medium", currency: "AUD" },
      { title: "USD/CAD Tests Resistance as Oil Prices Decline", description: "The Canadian dollar weakened against the greenback amid falling crude oil prices.", url: "#", source: "MarketWatch", publishedAt: new Date().toISOString(), category: "forex", impact: "medium", currency: "CAD" },
    ];
  }
  return [
    { title: "Bitcoin Surges Past $95,000 on ETF Inflows", description: "BTC broke through key resistance as spot ETFs continued to see record inflows.", url: "#", source: "CoinDesk", publishedAt: new Date().toISOString(), category: "crypto", impact: "high", currency: "USD" },
    { title: "Ethereum 2.0 Staking Reaches All-Time High", description: "More than 30 million ETH is now staked on the Ethereum network.", url: "#", source: "The Block", publishedAt: new Date().toISOString(), category: "crypto", impact: "medium" },
    { title: "Solana DeFi TVL Surpasses $15 Billion", description: "The Solana ecosystem continues to attract developers and capital.", url: "#", source: "DeFi Llama", publishedAt: new Date().toISOString(), category: "crypto", impact: "medium" },
    { title: "SEC Approves Multiple Crypto ETF Applications", description: "Regulatory clarity boosts institutional confidence in digital assets.", url: "#", source: "Reuters", publishedAt: new Date().toISOString(), category: "crypto", impact: "high", currency: "USD" },
  ];
}

function getSampleEvents(): EconomicEvent[] {
  return [
    { title: "Non-Farm Payrolls", country: "US", currency: "USD", impact: "high", date: "2026-03-08", time: "08:30 EST", forecast: "180K", previous: "175K" },
    { title: "ECB Interest Rate Decision", country: "EU", currency: "EUR", impact: "high", date: "2026-03-08", time: "07:45 EST", forecast: "4.25%", previous: "4.25%" },
    { title: "UK GDP (MoM)", country: "UK", currency: "GBP", impact: "high", date: "2026-03-08", time: "02:00 EST", forecast: "0.2%", previous: "0.1%", actual: "0.3%" },
    { title: "Australia Employment Change", country: "AU", currency: "AUD", impact: "medium", date: "2026-03-08", time: "19:30 EST", forecast: "25.0K", previous: "22.5K" },
    { title: "Canada Trade Balance", country: "CA", currency: "CAD", impact: "medium", date: "2026-03-08", time: "08:30 EST", forecast: "-1.2B", previous: "-0.8B" },
    { title: "Japan Core CPI (YoY)", country: "JP", currency: "JPY", impact: "medium", date: "2026-03-08", time: "18:30 EST", forecast: "2.8%", previous: "2.6%" },
    { title: "Switzerland CPI (MoM)", country: "CH", currency: "CHF", impact: "low", date: "2026-03-08", time: "02:30 EST", forecast: "0.1%", previous: "0.0%" },
  ];
}
