import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveAccount } from "@/hooks/useActiveAccount";

export interface TradeRow {
  id: string;
  pair: string;
  type: string;
  entry_price: number;
  exit_price: number;
  stop_loss: number;
  take_profit: number;
  lot_size: number;
  profit_loss: number;
  date: string;
  strategy: string;
  notes: string;
  screenshot_url: string | null;
  source: string;
  user_id: string;
  created_at: string;
  num_positions: number;
}

export function useTrades() {
  const { user } = useAuth();
  const { activeAccount } = useActiveAccount();

  return useQuery({
    queryKey: ["trades", user?.id, activeAccount?.id],
    queryFn: async () => {
      let query = supabase
        .from("trades")
        .select("*")
        .order("date", { ascending: false });

      // Filter by active account if one is selected
      if (activeAccount) {
        if (activeAccount.type === "mt") {
          query = query.eq("mt_account_id", activeAccount.id);
        } else if (activeAccount.type === "manual") {
          query = query.eq("manual_account_id", activeAccount.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TradeRow[];
    },
    enabled: !!user,
  });
}

export function useAddTrade() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trade: {
      pair: string;
      type: string;
      entry_price: number;
      exit_price: number;
      stop_loss: number;
      take_profit: number;
      lot_size: number;
      profit_loss: number;
      date: string;
      strategy: string;
      notes: string;
      mt_account_id?: string;
      manual_account_id?: string;
      num_positions?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { mt_account_id, manual_account_id, ...rest } = trade;
      const { data, error } = await supabase
        .from("trades")
        .insert({
          ...rest,
          user_id: user.id,
          num_positions: trade.num_positions || 1,
          ...(mt_account_id ? { mt_account_id } : {}),
          ...(manual_account_id ? { manual_account_id } : {}),
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
    },
  });
}
