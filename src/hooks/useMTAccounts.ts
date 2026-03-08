import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface MTAccount {
  id: string;
  user_id: string;
  broker_name: string;
  server_name: string;
  account_number: string;
  investor_password: string;
  platform: "MT4" | "MT5";
  account_label: string;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useMTAccounts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const accountsQuery = useQuery({
    queryKey: ["mt-accounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mt_accounts")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as any[]).map((d, i) => ({
        ...d,
        account_label: d.account_label || `Account ${i + 1}`,
      })) as MTAccount[];
    },
    enabled: !!user,
  });

  const addAccount = useMutation({
    mutationFn: async (account: {
      broker_name: string;
      server_name: string;
      account_number: string;
      investor_password: string;
      platform: "MT4" | "MT5";
    }) => {
      // Get current count for label
      const currentCount = accountsQuery.data?.length ?? 0;
      if (currentCount >= 3) {
        throw new Error("Maximum of 3 accounts allowed");
      }
      const label = `Account ${currentCount + 1}`;

      const { data, error } = await supabase
        .from("mt_accounts")
        .insert({
          ...account,
          user_id: user!.id,
          account_label: label,
        })
        .select()
        .single();
      if (error) throw error;
      return data as MTAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mt-accounts"] });
      toast.success("Account connected successfully!");
    },
    onError: (error: any) => {
      if (error.message?.includes("Maximum of 3")) {
        toast.error("You can connect up to 3 MT accounts.");
      } else if (error.code === "23505") {
        toast.error("This account is already connected.");
      } else {
        toast.error("Failed to connect account.");
      }
    },
  });

  const removeAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("mt_accounts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mt-accounts"] });
      toast.success("Account removed.");
    },
    onError: () => toast.error("Failed to remove account."),
  });

  const syncAccount = useMutation({
    mutationFn: async (mt_account_id?: string) => {
      const { data, error } = await supabase.functions.invoke("metaapi-sync", {
        body: { mt_account_id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mt-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast.success(`Synced ${data.total_synced} new trades!`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Sync failed. Check your account credentials.");
    },
  });

  return {
    accounts: accountsQuery.data ?? [],
    isLoading: accountsQuery.isLoading,
    addAccount,
    removeAccount,
    syncAccount,
    canAddMore: (accountsQuery.data?.length ?? 0) < 3,
  };
}
