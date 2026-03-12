import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Newspaper, Globe, Bitcoin, Calendar, ExternalLink, RefreshCw, Filter, AlertTriangle, Clock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
const IMPACT_FILTERS = ["ALL", "high", "medium", "low"];

export default function TradingNews() {
  const [activeTab, setActiveTab] = useState("forex");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [impactFilter, setImpactFilter] = useState("ALL");
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

  const filteredEvents = events.filter((e) => {
    const currMatch = currencyFilter === "ALL" || e.currency === currencyFilter;
    const impactMatch = impactFilter === "ALL" || e.impact === impactFilter;
    return currMatch && impactMatch;
  });

  const impactColor = (impact?: string) => {
    if (impact === "high") return "bg-destructive/20 text-destructive border-destructive/30";
    if (impact === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const impactDot = (impact?: string) => {
    if (impact === "high") return "bg-destructive";
    if (impact === "medium") return "bg-yellow-500";
    return "bg-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-primary" />
            Trading News
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time market news & economic calendar</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-28 bg-secondary border-border text-foreground">
              <Filter className="w-3.5 h-3.5 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          {activeTab === "calendar" && (
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-28 bg-secondary border-border text-foreground">
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {IMPACT_FILTERS.map((i) => <SelectItem key={i} value={i}>{i === "ALL" ? "All Impact" : i.charAt(0).toUpperCase() + i.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
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
          <EconomicCalendar events={filteredEvents} loading={loading} impactColor={impactColor} impactDot={impactDot} />
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
        <motion.a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-5 hover:border-primary/30 transition-all block group"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
            {item.impact && <Badge className={impactColor(item.impact)} variant="outline">{item.impact}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{item.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground">{item.source}</span>
              {item.currency && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.currency}</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {item.publishedAt ? format(new Date(item.publishedAt), "MMM d, h:mm a") : ""}
              </span>
              <ExternalLink className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  );
}

function EconomicCalendar({ events, loading, impactColor, impactDot }: { events: EconomicEvent[]; loading: boolean; impactColor: (i?: string) => string; impactDot: (i?: string) => string }) {
  if (loading) {
    return (
      <div className="glass-card overflow-x-auto">
        <div className="p-8 text-center"><div className="text-muted-foreground animate-pulse">Loading calendar...</div></div>
      </div>
    );
  }

  if (events.length === 0) {
    return <div className="glass-card p-12 text-center"><p className="text-muted-foreground">No economic events for this filter.</p></div>;
  }

  // Group events by date
  const grouped = events.reduce<Record<string, EconomicEvent[]>>((acc, event) => {
    const dateKey = event.date || "Unknown";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, dateEvents]) => (
        <div key={date} className="glass-card overflow-hidden">
          <div className="px-4 py-2.5 bg-secondary/50 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {date}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs">
                  <th className="px-4 py-2.5 text-left font-medium w-24">Time</th>
                  <th className="px-4 py-2.5 text-left font-medium w-16">Ccy</th>
                  <th className="px-4 py-2.5 text-left font-medium">Event</th>
                  <th className="px-4 py-2.5 text-center font-medium w-20">Impact</th>
                  <th className="px-4 py-2.5 text-right font-medium w-20">Forecast</th>
                  <th className="px-4 py-2.5 text-right font-medium w-20">Previous</th>
                  <th className="px-4 py-2.5 text-right font-medium w-20">Actual</th>
                </tr>
              </thead>
              <tbody>
                {dateEvents.map((event, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-border/50 hover:bg-secondary/40 transition-colors ${event.impact === "high" ? "bg-destructive/5" : ""}`}
                  >
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap text-xs">{event.time}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant="outline" className="text-xs font-bold">{event.currency}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-foreground font-medium text-xs">{event.title}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${impactDot(event.impact)}`} />
                        <span className="text-[10px] text-muted-foreground capitalize">{event.impact}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{event.forecast || "-"}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{event.previous || "-"}</td>
                    <td className={`px-4 py-2.5 text-right text-xs font-semibold ${event.actual ? "text-foreground" : "text-muted-foreground"}`}>
                      {event.actual || "-"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
