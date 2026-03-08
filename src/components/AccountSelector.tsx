import { useState } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Monitor, Plus, Trash2 } from "lucide-react";
import { useMTAccounts, MTAccount } from "@/hooks/useMTAccounts";
import ConnectMTModal from "@/components/ConnectMTModal";

interface Props {
  selectedAccountId: string | null;
  onSelectAccount: (id: string | null) => void;
}

export default function AccountSelector({ selectedAccountId, onSelectAccount }: Props) {
  const { accounts, isLoading, removeAccount } = useMTAccounts();
  const [modalOpen, setModalOpen] = useState(false);

  const selected = accounts.find((a) => a.id === selectedAccountId);
  const label = selected
    ? `${selected.broker_name} — ${selected.account_number}`
    : "All Accounts";

  return (
    <>
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
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Trading Accounts
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
                  <span className="font-medium truncate text-sm">{acc.broker_name}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  #{acc.account_number} · {acc.server_name}
                </div>
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
          <DropdownMenuItem
            className="gap-2 cursor-pointer text-primary font-medium"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Connect MetaTrader 4/5
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConnectMTModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
