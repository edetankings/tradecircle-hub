import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MTAccount } from "./useMTAccounts";
import { ManualAccount } from "./useManualAccounts";

export type ActiveAccountType = "mt" | "manual";

export interface ActiveAccount {
  id: string;
  type: ActiveAccountType;
  name: string;
  broker: string;
  balance?: number;
  equity?: number;
}

interface ActiveAccountContextType {
  activeAccount: ActiveAccount | null;
  isLoading: boolean;
}

const ActiveAccountContext = createContext<ActiveAccountContextType | undefined>(
  undefined
);

export function ActiveAccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const { data: activeAccount, isLoading } = useQuery({
    queryKey: ["active-account", user?.id],
    queryFn: async () => {
      // First check MT accounts
      const { data: mtAccount } = await supabase
        .from("mt_accounts")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (mtAccount) {
        return {
          id: mtAccount.id,
          type: "mt" as ActiveAccountType,
          name: mtAccount.account_label,
          broker: mtAccount.broker_name,
        };
      }

      // Then check manual accounts
      const { data: manualAccount } = await supabase
        .from("manual_accounts")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (manualAccount) {
        return {
          id: manualAccount.id,
          type: "manual" as ActiveAccountType,
          name: manualAccount.account_name,
          broker: manualAccount.broker_name,
          balance: manualAccount.account_balance,
          equity: manualAccount.account_equity,
        };
      }

      return null;
    },
    enabled: !!user,
  });

  return (
    <ActiveAccountContext.Provider value={{ activeAccount: activeAccount ?? null, isLoading }}>
      {children}
    </ActiveAccountContext.Provider>
  );
}

export function useActiveAccount() {
  const context = useContext(ActiveAccountContext);
  if (context === undefined) {
    throw new Error("useActiveAccount must be used within ActiveAccountProvider");
  }
  return context;
}
