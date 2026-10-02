import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
    <section id="download" className="py-16 sm:py-24 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto glass-card p-8 sm:p-12 grid gap-8 md:grid-cols-[auto,1fr] items-center"
      >
        <img src="/icon-512.png" alt="TradeCircle app icon" width={160} height={160} loading="lazy" className="w-28 h-28 sm:w-40 sm:h-40 rounded-3xl mx-auto glow-primary" />
        <div className="text-center md:text-left">
          <p className="mono-label text-primary mb-3 flex items-center gap-2 justify-center md:justify-start">
            <Smartphone className="w-4 h-4" /> Android App
          </p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight mb-3">Take TradeCircle everywhere</h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">
            Install the app on your phone for full-screen access, a home-screen icon and instant launch.
          </p>
          <Button size="lg" onClick={handleInstall} disabled={installed} className="gap-2 rounded-none h-12 px-8">
            {installed ? <><CheckCircle2 className="w-4 h-4" /> App installed</> : <><Download className="w-4 h-4" /> Download for Android</>}
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
