import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface TradingPlan {
  id: string;
  user_id: string;
  max_risk_per_trade: number;
  max_trades_per_day: number;
  allowed_pairs: string[];
  trading_sessions: string[];
  daily_loss_limit: number;
  weekly_loss_limit: number;
  strategy_rules: string;
  discipline_notes: string;
  created_at: string;
  updated_at: string;
}

export function useTradingPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const planQuery = useQuery({
    queryKey: ["trading-plan", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trading_plans")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as TradingPlan | null;
    },
    enabled: !!user,
  });

  const savePlan = useMutation({
    mutationFn: async (plan: Omit<TradingPlan, "id" | "user_id" | "created_at" | "updated_at">) => {
      const existing = planQuery.data;
      if (existing) {
        const { data, error } = await supabase
          .from("trading_plans")
          .update(plan as any)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("trading_plans")
          .insert({ ...plan, user_id: user!.id } as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-plan"] });
      toast.success("Trading plan saved!");
    },
    onError: () => toast.error("Failed to save trading plan."),
  });

  return {
    plan: planQuery.data ?? null,
    isLoading: planQuery.isLoading,
    savePlan,
  };
}
