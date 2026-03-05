import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link2, Unlink, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function ConnectAccount() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [accountId, setAccountId] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("myfxbook_username, myfxbook_account_id, myfxbook_connected")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.myfxbook_username || "");
          setAccountId(data.myfxbook_account_id || "");
          setConnected(data.myfxbook_connected);
        }
      });
  }, [user]);

  const handleConnect = async () => {
    if (!user || !username.trim() || !accountId.trim()) {
      toast.error("Please fill in both fields.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        myfxbook_username: username.trim(),
        myfxbook_account_id: accountId.trim(),
        myfxbook_connected: true,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to connect account.");
    } else {
      setConnected(true);
      toast.success("Myfxbook account linked!");
    }
    setLoading(false);
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
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to disconnect.");
    } else {
      setConnected(false);
      setUsername("");
      setAccountId("");
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
              <p>Username: <span className="text-foreground">{username}</span></p>
              <p>Account ID: <span className="text-foreground">{accountId}</span></p>
            </div>
            <Button variant="destructive" onClick={handleDisconnect} disabled={loading}>
              <Unlink className="w-4 h-4 mr-2" /> Disconnect
            </Button>
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
              <label className="text-xs font-medium text-muted-foreground">Myfxbook Username</label>
              <Input className={fc} placeholder="your-username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Account ID</label>
              <Input className={fc} placeholder="123456" value={accountId} onChange={(e) => setAccountId(e.target.value)} />
            </div>
            <Button onClick={handleConnect} disabled={loading} className="w-full">
              <Link2 className="w-4 h-4 mr-2" /> {loading ? "Connecting..." : "Connect Account"}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
