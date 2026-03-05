import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
}

export function useTrades() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trades", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("date", { ascending: false });
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
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("trades")
        .insert({ ...trade, user_id: user.id })
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
