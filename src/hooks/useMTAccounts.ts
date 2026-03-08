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
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MTAccount[];
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
      const { data, error } = await supabase
        .from("mt_accounts")
        .insert({ ...account, user_id: user!.id })
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
      if (error.code === "23505") {
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

  return { accounts: accountsQuery.data ?? [], isLoading: accountsQuery.isLoading, addAccount, removeAccount };
}
