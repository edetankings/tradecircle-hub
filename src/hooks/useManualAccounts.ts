import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface ManualAccount {
  id: string;
  user_id: string;
  account_name: string;
  broker_name: string;
  account_currency: string;
  account_balance: number;
  account_equity: number;
  account_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useManualAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ["manual-accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manual_accounts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as ManualAccount[];
    },
    enabled: !!user,
  });

  const addAccount = useMutation({
    mutationFn: async (account: {
      account_name: string;
      broker_name: string;
      account_currency: string;
      account_balance: number;
      account_equity: number;
      account_type: string;
    }) => {
      const currentCount = accountsQuery.data?.length ?? 0;
      if (currentCount >= 5) {
        throw new Error("Maximum of 5 manual accounts allowed");
      }
      const { data, error } = await supabase
        .from("manual_accounts")
        .insert({ ...account, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as ManualAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-accounts"] });
      toast.success("Manual account created!");
    },
    onError: (error: any) => {
      if (error.message?.includes("Maximum of 5")) {
        toast.error("You can create up to 5 manual accounts.");
      } else {
        toast.error("Failed to create account.");
      }
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ManualAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from("manual_accounts")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as ManualAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-accounts"] });
      toast.success("Account updated!");
    },
    onError: () => toast.error("Failed to update account."),
  });

  const removeAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("manual_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-accounts"] });
      toast.success("Account removed.");
    },
    onError: () => toast.error("Failed to remove account."),
  });

  const setActiveAccount = useMutation({
    mutationFn: async (accountId: string) => {
      // First, deactivate all manual accounts
      await supabase.from("manual_accounts").update({ is_active: false }).eq("user_id", user!.id);
      
      // Deactivate all MT accounts
      await supabase.from("mt_accounts").update({ is_active: false }).eq("user_id", user!.id);

      // Activate the selected manual account
      const { error } = await supabase
        .from("manual_accounts")
        .update({ is_active: true })
        .eq("id", accountId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manual-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["mt-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["active-account"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast.success("Active account updated!");
    },
    onError: () => toast.error("Failed to update active account."),
  });

  return {
    accounts: accountsQuery.data ?? [],
    isLoading: accountsQuery.isLoading,
    addAccount,
    updateAccount,
    removeAccount,
    setActiveAccount,
    canAddMore: (accountsQuery.data?.length ?? 0) < 5,
  };
}
