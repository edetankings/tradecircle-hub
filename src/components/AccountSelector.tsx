import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Monitor, Plus, Trash2, RefreshCw, Loader2, Wallet } from "lucide-react";
import { useMTAccounts } from "@/hooks/useMTAccounts";
import { useManualAccounts } from "@/hooks/useManualAccounts";
import ConnectMTModal from "@/components/ConnectMTModal";
import CreateManualAccountModal from "@/components/CreateManualAccountModal";
import { format } from "date-fns";

export type SelectedAccount = {
  id: string;
  type: "mt" | "manual";
} | null;

interface Props {
  selectedAccount: SelectedAccount;
  onSelectAccount: (account: SelectedAccount) => void;
}

export default function AccountSelector({ selectedAccount, onSelectAccount }: Props) {
  const { accounts: mtAccounts, isLoading: mtLoading, removeAccount: removeMT, syncAccount, canAddMore: canAddMT } = useMTAccounts();
  const { accounts: manualAccounts, isLoading: manualLoading, removeAccount: removeManual, canAddMore: canAddManual } = useManualAccounts();
  const [mtModalOpen, setMtModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  const isLoading = mtLoading || manualLoading;

  // Determine label
  let label = "All Accounts";
  if (selectedAccount) {
    if (selectedAccount.type === "mt") {
      const acc = mtAccounts.find((a) => a.id === selectedAccount.id);
      label = acc ? `${acc.account_label} — ${acc.broker_name}` : "All Accounts";
    } else {
      const acc = manualAccounts.find((a) => a.id === selectedAccount.id);
      label = acc ? `${acc.account_name}` : "All Accounts";
    }
  }

  const totalAccounts = mtAccounts.length + manualAccounts.length;

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
              <div className="flex items-center gap-2 truncate">
                {selectedAccount?.type === "manual" ? (
                  <Wallet className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <Monitor className="w-4 h-4 text-primary shrink-0" />
                )}
                <span className="truncate text-sm">{label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Trading Accounts ({totalAccounts})
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* All Accounts */}
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onSelectAccount(null)}>
              <Monitor className="w-4 h-4" />
              <span className="flex-1">All Accounts</span>
              {!selectedAccount && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>

            {isLoading && (
              <DropdownMenuItem disabled className="text-muted-foreground text-xs">Loading accounts…</DropdownMenuItem>
            )}

            {/* MT Accounts */}
            {mtAccounts.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">MetaTrader</DropdownMenuLabel>
              </>
            )}
            {mtAccounts.map((acc) => (
              <DropdownMenuItem
                key={acc.id}
                className="gap-2 cursor-pointer group"
                onClick={() => onSelectAccount({ id: acc.id, type: "mt" })}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">{acc.platform}</span>
                    <span className="font-medium truncate text-sm">{acc.account_label}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {acc.broker_name} · #{acc.account_number} · {acc.server_name}
                  </div>
                  {acc.last_synced_at && (
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                      Synced {format(new Date(acc.last_synced_at), "MMM d, h:mm a")}
                    </div>
                  )}
                </div>
                {selectedAccount?.id === acc.id && selectedAccount.type === "mt" && <Check className="w-4 h-4 text-primary shrink-0" />}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  onClick={(e) => { e.stopPropagation(); removeMT.mutate(acc.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </DropdownMenuItem>
            ))}

            {/* Manual Accounts */}
            {manualAccounts.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">Manual</DropdownMenuLabel>
              </>
            )}
            {manualAccounts.map((acc) => (
              <DropdownMenuItem
                key={acc.id}
                className="gap-2 cursor-pointer group"
                onClick={() => onSelectAccount({ id: acc.id, type: "manual" })}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent text-accent-foreground">{acc.account_type}</span>
                    <span className="font-medium truncate text-sm">{acc.account_name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {acc.broker_name ? `${acc.broker_name} · ` : ""}{acc.account_currency} · Bal: ${Number(acc.account_balance).toLocaleString()}
                  </div>
                </div>
                {selectedAccount?.id === acc.id && selectedAccount.type === "manual" && <Check className="w-4 h-4 text-primary shrink-0" />}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  onClick={(e) => { e.stopPropagation(); removeManual.mutate(acc.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {/* Add MT Account */}
            {canAddMT ? (
              <DropdownMenuItem className="gap-2 cursor-pointer text-primary font-medium" onClick={() => setMtModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Connect MetaTrader 4/5
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="gap-2 text-muted-foreground text-xs">
                <Plus className="w-4 h-4" /> Max 3 MT accounts
              </DropdownMenuItem>
            )}

            {/* Add Manual Account */}
            {canAddManual ? (
              <DropdownMenuItem className="gap-2 cursor-pointer text-primary font-medium" onClick={() => setManualModalOpen(true)}>
                <Wallet className="w-4 h-4" />
                Create Manual Account
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="gap-2 text-muted-foreground text-xs">
                <Wallet className="w-4 h-4" /> Max 5 manual accounts
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {mtAccounts.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => syncAccount.mutate(selectedAccount?.type === "mt" ? selectedAccount.id : undefined)}
            disabled={syncAccount.isPending}
            title="Sync trades"
          >
            {syncAccount.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      <ConnectMTModal open={mtModalOpen} onOpenChange={setMtModalOpen} />
      <CreateManualAccountModal open={manualModalOpen} onOpenChange={setManualModalOpen} />
    </>
  );
}
