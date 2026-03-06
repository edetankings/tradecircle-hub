import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link2, Unlink, ExternalLink, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ConnectAccount() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountId, setAccountId] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("myfxbook_username, myfxbook_account_id, myfxbook_connected, last_synced_at")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setEmail((data as any).myfxbook_username || "");
          setAccountId((data as any).myfxbook_account_id || "");
          setConnected((data as any).myfxbook_connected);
          setLastSynced((data as any).last_synced_at || null);
        }
      });
  }, [user]);

  const handleSync = async () => {
    if (!user || !email.trim() || !password.trim() || !accountId.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("myfxbook-sync", {
        body: { email: email.trim(), password: password.trim(), accountId: accountId.trim() },
      });

      if (res.error) {
        toast.error(res.error.message || "Sync failed.");
      } else if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        setConnected(true);
        setLastSynced(res.data.lastSynced);
        setPassword("");
        toast.success(`Synced ${res.data.tradesCount} trades from Myfxbook!`);
        queryClient.invalidateQueries({ queryKey: ["trades"] });
      }
    } catch (err: any) {
      toast.error(err.message || "Sync failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        myfxbook_username: null,
        myfxbook_account_id: null,
        myfxbook_connected: false,
        last_synced_at: null,
      } as any)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to disconnect.");
    } else {
      setConnected(false);
      setEmail("");
      setAccountId("");
      setLastSynced(null);
      toast.success("Account disconnected.");
    }
    setLoading(false);
  };

  const fc = "bg-secondary border-border text-foreground";

  return (
    <div className="space-y-6 max-w-xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Connect Trading Account</h1>
        <p className="text-muted-foreground text-sm mt-1">Link your Myfxbook account to auto-sync trades.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 space-y-5"
      >
        {connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-profit">
              <Link2 className="w-5 h-5" />
              <span className="font-semibold">Connected to Myfxbook</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Email: <span className="text-foreground">{email}</span></p>
              <p>Account ID: <span className="text-foreground">{accountId}</span></p>
              {lastSynced && (
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Last synced: {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
                </p>
              )}
            </div>

            {/* Refresh sync */}
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">Enter your Myfxbook password to refresh trades:</p>
              <Input
                type="password"
                className={fc}
                placeholder="Myfxbook password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex gap-3">
                <Button onClick={handleSync} disabled={loading || !password.trim()} className="flex-1">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  {loading ? "Syncing..." : "Refresh Trades"}
                </Button>
                <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
                  <Unlink className="w-4 h-4 mr-2" /> Disconnect
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <ExternalLink className="w-4 h-4" />
              <a href="https://www.myfxbook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Get your credentials from Myfxbook
              </a>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Myfxbook Email</label>
              <Input className={fc} placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Myfxbook Password</label>
              <Input type="password" className={fc} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Account ID</label>
              <Input className={fc} placeholder="123456" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
            </div>
            <Button onClick={handleSync} disabled={loading} className="w-full">
              <Link2 className="w-4 h-4 mr-2" /> {loading ? "Connecting & Syncing..." : "Connect & Sync Account"}
            </Button>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 text-xs text-muted-foreground space-y-1"
      >
        <p className="font-medium text-foreground text-sm">How it works</p>
        <p>• Your credentials are used only to authenticate with Myfxbook's API and are never stored.</p>
        <p>• Trade history is fetched and saved to your journal automatically.</p>
        <p>• Dashboard, calendar, and analytics update in real-time after sync.</p>
      </motion.div>
    </div>
  );
}
