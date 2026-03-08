import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMTAccounts } from "@/hooks/useMTAccounts";

const BROKERS = [
  "ICMarkets", "Exness", "XM", "FXTM", "Pepperstone", "FBS",
  "OctaFX", "HotForex", "RoboForex", "Tickmill", "FP Markets",
  "Alpari", "InstaForex", "LiteFinance", "Deriv", "Other",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConnectMTModal({ open, onOpenChange }: Props) {
  const { addAccount } = useMTAccounts();
  const [form, setForm] = useState({
    broker_name: "",
    server_name: "",
    account_number: "",
    investor_password: "",
    platform: "MT5" as "MT4" | "MT5",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.broker_name || !form.server_name || !form.account_number || !form.investor_password) return;
    await addAccount.mutateAsync(form);
    setForm({ broker_name: "", server_name: "", account_number: "", investor_password: "", platform: "MT5" });
    onOpenChange(false);
  };

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect MetaTrader Account</DialogTitle>
          <DialogDescription>
            Enter your investor (read-only) password to connect your trading account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MT4">MetaTrader 4</SelectItem>
                <SelectItem value="MT5">MetaTrader 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Broker Name</Label>
            <Select value={form.broker_name} onValueChange={(v) => update("broker_name", v)}>
              <SelectTrigger><SelectValue placeholder="Select broker" /></SelectTrigger>
              <SelectContent>
                {BROKERS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Server Name</Label>
            <Input
              placeholder="e.g. ICMarkets-Demo01"
              value={form.server_name}
              onChange={(e) => update("server_name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input
              placeholder="e.g. 12345678"
              value={form.account_number}
              onChange={(e) => update("account_number", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Investor Password (Read-Only)</Label>
            <Input
              type="password"
              placeholder="Investor password"
              value={form.investor_password}
              onChange={(e) => update("investor_password", e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              This is the read-only password from your broker. It cannot execute trades.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={addAccount.isPending}>
            {addAccount.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Account
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
