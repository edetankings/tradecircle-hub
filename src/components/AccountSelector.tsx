import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Monitor, Plus, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { useMTAccounts } from "@/hooks/useMTAccounts";
import ConnectMTModal from "@/components/ConnectMTModal";
import { format } from "date-fns";

interface Props {
  selectedAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
}

export default function AccountSelector({ selectedAccountId, onSelectAccount }: Props) {
  const { accounts, isLoading, removeAccount, syncAccount, canAddMore } = useMTAccounts();
  const [modalOpen, setModalOpen] = useState(false);

  const selected = accounts.find((a) => a.id === selectedAccountId);
  const label = selected
    ? `${selected.account_label} — ${selected.broker_name}`
    : "All Accounts";

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
              <div className="flex items-center gap-2 truncate">
                <Monitor className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate text-sm">{label}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Trading Accounts ({accounts.length}/3)
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 cursor-pointer"
              onClick={() => onSelectAccount(null)}
            >
              <Monitor className="w-4 h-4" />
              <span className="flex-1">All Accounts</span>
              {!selectedAccountId && <Check className="w-4 h-4 text-primary" />}
            </DropdownMenuItem>

            {isLoading && (
              <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                Loading accounts…
              </DropdownMenuItem>
            )}

            {accounts.map((acc) => (
              <DropdownMenuItem
                key={acc.id}
                className="gap-2 cursor-pointer group"
                onClick={() => onSelectAccount(acc.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      {acc.platform}
                    </span>
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
                {selectedAccountId === acc.id && <Check className="w-4 h-4 text-primary shrink-0" />}
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAccount.mutate(acc.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            {canAddMore ? (
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-primary font-medium"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Connect MetaTrader 4/5
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="gap-2 text-muted-foreground text-xs">
                <Plus className="w-4 h-4" />
                Max 3 accounts reached
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {accounts.length > 0 && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => syncAccount.mutate(selectedAccountId ?? undefined)}
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

      <ConnectMTModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
