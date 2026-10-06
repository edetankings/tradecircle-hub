import { useState } from "react";
import { Check, ChevronsUpDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActiveAccount } from "@/hooks/useActiveAccount";
import { useMTAccounts } from "@/hooks/useMTAccounts";
import { useManualAccounts } from "@/hooks/useManualAccounts";
import { cn } from "@/lib/utils";

const formatAccountMoney = (value: number, currency: string) =>
  new Intl.NumberFormat(currency === "NGN" ? "en-NG" : undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);

export function ActiveAccountSelector() {
  const [open, setOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<{
    id: string;
    type: "mt" | "manual";
  } | null>(null);

  const { activeAccount } = useActiveAccount();
  const { accounts: mtAccounts, setActiveAccount: setActiveMT } = useMTAccounts();
  const { accounts: manualAccounts, setActiveAccount: setActiveManual } = useManualAccounts();

  const allAccounts = [
    ...mtAccounts.map((acc) => ({
      id: acc.id,
      type: "mt" as const,
      name: acc.account_label,
      broker: acc.broker_name,
      displayText: `${acc.account_label} - ${acc.broker_name}`,
    })),
    ...manualAccounts.map((acc) => ({
      id: acc.id,
      type: "manual" as const,
      name: acc.account_name,
      broker: acc.broker_name,
      balance: acc.account_balance,
      equity: acc.account_equity,
      currency: acc.account_currency,
      displayText: `${acc.account_name} - ${acc.broker_name} (${formatAccountMoney(acc.account_balance, acc.account_currency)})`,
    })),
  ];

  const handleSelectAccount = (accountId: string, accountType: "mt" | "manual") => {
    if (activeAccount?.id === accountId) {
      setOpen(false);
      return;
    }

    setPendingSwitch({ id: accountId, type: accountType });
    setConfirmDialogOpen(true);
    setOpen(false);
  };

  const confirmSwitch = () => {
    if (!pendingSwitch) return;

    if (pendingSwitch.type === "mt") {
      setActiveMT.mutate(pendingSwitch.id);
    } else {
      setActiveManual.mutate(pendingSwitch.id);
    }

    setPendingSwitch(null);
    setConfirmDialogOpen(false);
  };

  const cancelSwitch = () => {
    setPendingSwitch(null);
    setConfirmDialogOpen(false);
  };

  if (allAccounts.length === 0) {
    return null;
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[280px] justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {activeAccount
                  ? `${activeAccount.name} - ${activeAccount.broker}`
                  : "Select account..."}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No accounts found.</CommandEmpty>
              {mtAccounts.length > 0 && (
                <CommandGroup heading="MetaTrader Accounts">
                  {mtAccounts.map((account) => (
                    <CommandItem
                      key={account.id}
                      value={account.id}
                      onSelect={() => handleSelectAccount(account.id, "mt")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          activeAccount?.id === account.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{account.account_label}</span>
                        <span className="text-xs text-muted-foreground">
                          {account.broker_name}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {manualAccounts.length > 0 && (
                <CommandGroup heading="Manual Accounts">
                  {manualAccounts.map((account) => (
                    <CommandItem
                      key={account.id}
                      value={account.id}
                      onSelect={() => handleSelectAccount(account.id, "manual")}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          activeAccount?.id === account.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{account.account_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {account.broker_name} • {formatAccountMoney(account.account_balance, account.account_currency)}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Active Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching accounts will display only this account's data. Your dashboard,
              analytics, and all charts will update to show trades and statistics for the
              selected account only. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelSwitch}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSwitch}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
