import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import tradeCircleLogo from "@/assets/tradecircle-logo-candidate-2.png";

type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function DownloadAppSection() {
  const [promptEvent, setPromptEvent] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setPromptEvent(e as InstallPrompt); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
      return;
    }
    toast({
      title: "Install TradeCircle",
      description: "Open this site in Chrome on your Android phone, tap the ⋮ menu, then 'Install app' / 'Add to Home screen'.",
    });
  };

  return (
    <section id="download" className="border-b border-border bg-card px-4 py-20 sm:px-6 sm:py-28">
      <div data-reveal className="mx-auto grid max-w-5xl items-center gap-8 border border-border bg-background p-7 shadow-soft sm:p-12 md:grid-cols-[auto,1fr]">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-card p-3 shadow-soft sm:h-36 sm:w-36">
          <img src={tradeCircleLogo} alt="TradeCircle TC candlestick logo" width={1024} height={1024} className="h-full w-full object-contain" />
        </div>
        <div className="text-center md:text-left">
          <p className="mono-label mb-3 text-primary">[Android app · v1.1.0]</p>
          <h2 className="mb-3 font-display text-2xl font-bold sm:text-4xl">Take TradeCircle everywhere</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">
            Install the app on your phone for full-screen access, a home-screen icon and instant launch.
          </p>
          <Button size="lg" onClick={handleInstall} disabled={installed} className="h-12 rounded-md px-8">
            {installed ? "App installed [✓]" : "Download for Android ↓"}
          </Button>
        </div>
      </div>
    </section>
  );
}
