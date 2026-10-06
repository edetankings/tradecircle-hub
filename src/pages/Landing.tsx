import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import DownloadAppSection from "@/components/DownloadAppSection";
import tradeCircleLogo from "@/assets/tradecircle-logo-candidate-2.png";

gsap.registerPlugin(ScrollTrigger);

const features = [
  { number: "01", title: "MT4/MT5 Auto-Sync", desc: "Connect up to 3 MetaTrader accounts and import your trades automatically.", tag: "POPULAR" },
  { number: "02", title: "Live Analytics", desc: "Equity curves, win rates, monthly P/L, and pair performance at a glance." },
  { number: "03", title: "Trade Journal", desc: "Log every trade with notes, screenshots, and strategy tags. Learn from your history." },
  { number: "04", title: "Calendar View", desc: "Map trading activity to each day and spot patterns, streaks, and risk drift." },
  { number: "05", title: "Market Review", desc: "Document upcoming setups and track whether each trading idea played out.", tag: "NEW" },
  { number: "06", title: "Trading News", desc: "Stay ahead with real-time forex news and an economic calendar with impact filters.", tag: "NEW" },
];

const stats = [
  { value: "10K+", label: "Trades tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 5min", label: "Sync interval" },
  { value: "3", label: "MT accounts" },
];

const steps = [
  { number: "01", title: "Create your account", desc: "Sign up in seconds with your email. No credit card required." },
  { number: "02", title: "Connect MetaTrader", desc: "Add your read-only MT4/MT5 credentials. We pull trades automatically." },
  { number: "03", title: "Analyze and improve", desc: "Use analytics, journal entries, and your calendar to sharpen every decision." },
];

const testimonials = [
  { name: "Alex M.", role: "Forex Trader", text: "TradeCircle completely changed how I review my trades. The auto-sync saves me hours every week." },
  { name: "Sarah K.", role: "Day Trader", text: "The analytics dashboard gives me insights I never had before. My win rate improved by 15%." },
  { name: "James W.", role: "Swing Trader", text: "The calendar view helps me spot my most profitable patterns without digging through spreadsheets." },
];

const bars = [36, 56, 44, 72, 62, 84, 76, 94, 82, 100, 88, 112];
const daily = [54, 72, 30, 46, 82, 24, 64, 92, 42, 20, 76, 52, 86, 68];

export default function Landing() {
  const pageRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const context = gsap.context(() => {
      gsap.from("[data-hero-line]", {
        yPercent: 115,
        duration: 1,
        ease: "power4.out",
        stagger: 0.12,
      });
      gsap.from("[data-hero-fade]", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        delay: 0.45,
        ease: "power3.out",
        stagger: 0.1,
      });
      gsap.from("[data-live-bar]", {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 1.1,
        delay: 0.55,
        stagger: 0.05,
        ease: "elastic.out(1, 0.65)",
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 42,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 86%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
        gsap.from(group.children, {
          y: 34,
          opacity: 0,
          duration: 0.65,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 82%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
        gsap.to(element, {
          yPercent: -14,
          ease: "none",
          scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 1 },
        });
      });
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={pageRef} className="landing-light min-h-screen overflow-hidden bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/landing" className="flex items-center gap-2 font-display text-base font-bold uppercase tracking-normal sm:text-lg">
            <img src={tradeCircleLogo} alt="" width={1024} height={1024} className="h-9 w-9 object-contain" />
            <span className="text-primary">TradeCircle</span>
          </Link>
          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase md:flex">
            <a className="landing-link" href="#dashboard">Analytics</a>
            <a className="landing-link" href="#features">Features</a>
            <a className="landing-link" href="#how-it-works">Process</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Log in</Link></Button>
            <Button asChild size="sm" className="rounded-md px-4"><Link to="/auth">Start free <span aria-hidden="true">→</span></Link></Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-36 lg:pt-44">
          <div className="paper-grid absolute inset-0 opacity-70" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <div data-hero-fade className="mb-7 flex items-center gap-2 font-display text-[10px] font-bold uppercase text-muted-foreground">
                <span className="status-dot" /> Live trading intelligence
              </div>
              <h1 className="max-w-4xl font-display text-[clamp(3.25rem,8vw,7.5rem)] font-bold leading-[0.88] tracking-normal">
                <span className="block overflow-hidden"><span data-hero-line className="block">Trade.</span></span>
                <span className="block overflow-hidden"><span data-hero-line className="block text-primary">Review.</span></span>
                <span className="block overflow-hidden"><span data-hero-line className="block">Improve.</span></span>
              </h1>
              <p data-hero-fade className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Your complete trading journal and analytics workspace. Connect MetaTrader, sync every trade, and turn performance data into better decisions.
              </p>
              <div data-hero-fade className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-md px-7"><Link to="/auth">Open your workspace <span aria-hidden="true">→</span></Link></Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-md px-7"><a href="#dashboard">Explore analytics</a></Button>
              </div>
              <div data-hero-fade className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-display text-[10px] uppercase text-muted-foreground">
                <span>[01] No card required</span><span>[02] Free forever plan</span><span>[03] Two-minute setup</span>
              </div>
            </div>

            <div data-hero-fade className="relative border border-border bg-card p-4 shadow-soft sm:p-6" data-parallax>
              <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                <div><p className="mono-label">Account equity</p><p className="mt-1 font-display text-2xl font-bold">$124,502.40</p></div>
                <div className="text-right"><p className="mono-label">30D return</p><p className="mt-1 font-display text-xl font-bold text-profit">+18.4%</p></div>
              </div>
              <div className="relative flex h-56 items-end gap-2 border-b border-border px-2 pb-0 sm:h-72">
                <div className="absolute left-2 top-2 font-display text-[10px] text-muted-foreground">EURUSD / 1H</div>
                {bars.map((height, index) => (
                  <div key={index} data-live-bar className={`flex-1 ${index === 7 || index === 10 ? "bg-primary" : "bg-secondary"}`} style={{ height }} />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><p className="mono-label">Win rate</p><p className="mt-1 font-display font-bold">67.5%</p></div>
                <div><p className="mono-label">Profit factor</p><p className="mt-1 font-display font-bold">2.14</p></div>
                <div><p className="mono-label">Trades</p><p className="mt-1 font-display font-bold">142</p></div>
              </div>
            </div>
          </div>
        </section>

        <div className="ticker border-y border-border bg-foreground py-3 text-background">
          <div className="ticker-track font-display text-[10px] font-bold uppercase">
            <span>EURUSD 1.0842 <b className="text-profit">+0.42%</b></span><span>XAUUSD 2,386.20 <b className="text-loss">−0.18%</b></span><span>GBPUSD 1.2745 <b className="text-profit">+0.31%</b></span><span>NAS100 18,402 <b className="text-profit">+1.12%</b></span>
            <span>EURUSD 1.0842 <b className="text-profit">+0.42%</b></span><span>XAUUSD 2,386.20 <b className="text-loss">−0.18%</b></span><span>GBPUSD 1.2745 <b className="text-profit">+0.31%</b></span><span>NAS100 18,402 <b className="text-profit">+1.12%</b></span>
          </div>
        </div>

        <section className="border-b border-border px-4 py-12 sm:px-6 sm:py-16">
          <div data-stagger className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden border border-border bg-border md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className="bg-background p-5 sm:p-8">
                <p className="mono-label">0{index + 1} / SIGNAL</p>
                <p className="mt-5 font-display text-2xl font-bold sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="dashboard" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
              <div><p className="mono-label text-primary">[Analytics workspace]</p><h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-5xl">Every decision,<br />made visible.</h2></div>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground md:justify-self-end sm:text-base">Four core account metrics and three performance views update whenever you switch accounts or sync trades.</p>
            </div>

            <div data-stagger className="grid gap-4 md:grid-cols-12">
              <article className="bento-panel md:col-span-7">
                <div className="flex items-start justify-between"><div><p className="mono-label">Equity curve</p><h3 className="mt-2 font-display text-xl font-bold">Account growth</h3></div><span className="font-display text-sm font-bold text-profit">+18.4%</span></div>
                <div className="mt-10 flex h-52 items-end gap-2 border-b border-border">
                  {bars.map((height, index) => <div key={index} className={`data-bar flex-1 ${index > 7 ? "bg-primary" : "bg-secondary"}`} style={{ height: `${height * 1.35}px` }} />)}
                </div>
              </article>
              <article className="bento-panel md:col-span-5">
                <p className="mono-label">Win / loss distribution</p>
                <div className="mt-8 grid grid-cols-5 gap-2" aria-label="67 percent winning trades">
                  {Array.from({ length: 20 }).map((_, index) => <span key={index} className={`aspect-square rounded-sm ${index < 14 ? "bg-profit" : "bg-loss"}`} />)}
                </div>
                <div className="mt-8 flex items-end justify-between"><div><p className="font-display text-5xl font-bold">67%</p><p className="mt-1 text-xs text-muted-foreground">Current win rate</p></div><p className="font-display text-xs text-muted-foreground">96W / 46L</p></div>
              </article>
              {[
                ["Balance", "$12,450"], ["Equity", "$12,890"], ["Win rate", "67.5%"], ["Total trades", "142"],
              ].map(([label, value], index) => (
                <article key={label} className="bento-panel md:col-span-3"><p className="mono-label">0{index + 1}</p><p className="mt-8 text-xs text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p></article>
              ))}
              <article className="bento-panel md:col-span-12">
                <div className="flex items-center justify-between"><div><p className="mono-label">Daily profit / loss</p><h3 className="mt-2 font-display text-lg font-bold">Last 14 sessions</h3></div><span className="font-display text-xs text-muted-foreground">LIVE DATA</span></div>
                <div className="mt-8 flex h-40 items-end gap-2 sm:gap-3">{daily.map((height, index) => <div key={index} className={`data-bar flex-1 ${[2,5,9].includes(index) ? "bg-loss" : "bg-profit"}`} style={{ height: `${height}%` }} />)}</div>
              </article>
            </div>
            <div data-reveal className="mt-10 text-center"><Button asChild size="lg" className="h-12 rounded-md px-8"><Link to="/auth">Try the dashboard free <span aria-hidden="true">→</span></Link></Button></div>
          </div>
        </section>

        <section id="features" className="border-y border-border bg-card px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mb-12 max-w-2xl"><p className="mono-label text-primary">[Complete toolkit]</p><h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">Less noise.<br />More signal.</h2></div>
            <div data-stagger className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="feature-tile group relative min-h-64 bg-background p-6 sm:p-8">
                  <div className="flex items-center justify-between"><span className="font-display text-xs text-primary">[{feature.number}]</span>{feature.tag && <span className="font-display text-[9px] font-bold text-muted-foreground">{feature.tag}</span>}</div>
                  <div className="mt-14 h-px w-10 bg-primary transition-all duration-500 group-hover:w-20" />
                  <h3 className="mt-6 font-display text-lg font-bold">{feature.title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mb-12"><p className="mono-label text-primary">[Three steps]</p><h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">From signup to insight.</h2></div>
            <div data-stagger className="grid border-y border-border md:grid-cols-3 md:divide-x md:divide-border">
              {steps.map((step) => <article key={step.number} className="py-8 md:px-8 first:pl-0"><span className="font-display text-5xl font-bold text-secondary">{step.number}</span><h3 className="mt-8 font-display text-lg font-bold">{step.title}</h3><p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">{step.desc}</p></article>)}
            </div>
          </div>
        </section>

        <section id="testimonials" className="border-y border-border bg-foreground px-4 py-20 text-background sm:px-6 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div data-reveal className="mb-12"><p className="font-display text-[10px] uppercase text-primary-foreground/60">[Trader notes]</p><h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">Built into better habits.</h2></div>
            <div data-stagger className="grid gap-px bg-background/20 md:grid-cols-3">
              {testimonials.map((item) => <blockquote key={item.name} className="bg-foreground p-7 sm:p-9"><p className="font-display text-xs text-primary-foreground">★★★★★</p><p className="mt-8 text-base leading-relaxed text-background/80">“{item.text}”</p><footer className="mt-8 border-t border-background/20 pt-5"><p className="font-display text-sm font-bold">{item.name}</p><p className="mt-1 text-xs text-background/50">{item.role}</p></footer></blockquote>)}
            </div>
          </div>
        </section>

        <DownloadAppSection />

        <section className="px-4 py-20 sm:px-6 sm:py-32">
          <div data-reveal className="mx-auto max-w-5xl border border-border bg-card p-8 text-center shadow-soft sm:p-16">
            <p className="mono-label text-primary">[Your edge starts here]</p>
            <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-6xl">Make every trade teach you something.</h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">Track, analyze, and improve your performance with one focused trading workspace.</p>
            <Button asChild size="lg" className="mt-9 h-12 rounded-md px-9"><Link to="/auth">Create free account <span aria-hidden="true">→</span></Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <Link to="/landing" className="flex items-center gap-2 font-display font-bold text-foreground"><img src={tradeCircleLogo} alt="" loading="lazy" width={1024} height={1024} className="h-7 w-7 object-contain" /> TRADECIRCLE</Link>
          <nav className="flex flex-wrap gap-6"><a href="#dashboard">Analytics</a><a href="#features">Features</a><a href="#how-it-works">Process</a><a href="#testimonials">Reviews</a></nav>
          <p>© {new Date().getFullYear()} TradeCircle</p>
        </div>
      </footer>
    </div>
  );
}