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
import { useManualAccounts } from "@/hooks/useManualAccounts";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CURRENCIES = ["USD", "NGN", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD"];
const ACCOUNT_TYPES = ["Forex", "Crypto", "Stocks"];

export default function CreateManualAccountModal({ open, onOpenChange }: Props) {
  const { addAccount, canAddMore } = useManualAccounts();
  const [form, setForm] = useState({
    account_name: "",
    broker_name: "",
    account_currency: "USD",
    account_balance: "",
    account_equity: "",
    account_type: "Forex",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_name) return;
    await addAccount.mutateAsync({
      account_name: form.account_name,
      broker_name: form.broker_name,
      account_currency: form.account_currency,
      account_balance: parseFloat(form.account_balance) || 0,
      account_equity: parseFloat(form.account_equity) || 0,
      account_type: form.account_type,
    });
    setForm({ account_name: "", broker_name: "", account_currency: "USD", account_balance: "", account_equity: "", account_type: "Forex" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Manual Account</DialogTitle>
          <DialogDescription>
            Track trades manually without MT4/MT5 connection. Up to 5 accounts.
          </DialogDescription>
        </DialogHeader>

        {!canAddMore ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-foreground">Max 5 manual accounts reached. Remove one to add a new one.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Account Name *</Label>
              <Input placeholder="e.g. My Prop Firm Challenge" value={form.account_name} onChange={(e) => update("account_name", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Broker Name</Label>
              <Input placeholder="e.g. FTMO, ICMarkets" value={form.broker_name} onChange={(e) => update("broker_name", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.account_currency} onValueChange={(v) => update("account_currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c === "NGN" ? "NGN — Nigerian Naira (₦)" : c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={form.account_type} onValueChange={(v) => update("account_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Starting Balance</Label>
                <Input type="number" step="any" placeholder="10000" value={form.account_balance} onChange={(e) => update("account_balance", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Starting Equity</Label>
                <Input type="number" step="any" placeholder="10000" value={form.account_equity} onChange={(e) => update("account_equity", e.target.value)} />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={addAccount.isPending}>
              {addAccount.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Account
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
