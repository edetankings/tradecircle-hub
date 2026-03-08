-- Add new columns to daily_reflections for enhanced reflection tracking
ALTER TABLE public.daily_reflections 
  ADD COLUMN IF NOT EXISTS trade_id uuid REFERENCES public.trades(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS emotion_before text DEFAULT '',
  ADD COLUMN IF NOT EXISTS emotion_after text DEFAULT '',
  ADD COLUMN IF NOT EXISTS strategy_used text DEFAULT '',
  ADD COLUMN IF NOT EXISTS lesson_learned text DEFAULT '';

-- Create function to compute leaderboard from real trades
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  total_profit numeric,
  win_rate numeric,
  total_trades bigint,
  profit_factor numeric,
  wins bigint,
  losses bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH trade_stats AS (
    SELECT 
      t.user_id,
      COUNT(*) as total_trades,
      COUNT(*) FILTER (WHERE t.profit_loss > 0) as wins,
      COUNT(*) FILTER (WHERE t.profit_loss < 0) as losses,
      COALESCE(SUM(t.profit_loss), 0) as total_profit,
      COALESCE(SUM(t.profit_loss) FILTER (WHERE t.profit_loss > 0), 0) as gross_profit,
      ABS(COALESCE(SUM(t.profit_loss) FILTER (WHERE t.profit_loss < 0), 0)) as gross_loss
    FROM public.trades t
    GROUP BY t.user_id
    HAVING COUNT(*) >= 1
  )
  SELECT 
    ts.user_id,
    COALESCE(p.display_name, 'Trader')::text as display_name,
    p.avatar_url::text as avatar_url,
    ROUND(ts.total_profit, 2) as total_profit,
    CASE WHEN ts.total_trades > 0 
      THEN ROUND((ts.wins::numeric / ts.total_trades) * 100, 1) 
      ELSE 0 
    END as win_rate,
    ts.total_trades,
    CASE WHEN ts.gross_loss > 0 
      THEN ROUND(ts.gross_profit / ts.gross_loss, 2) 
      ELSE CASE WHEN ts.gross_profit > 0 THEN 999.99 ELSE 0 END
    END as profit_factor,
    ts.wins,
    ts.losses
  FROM trade_stats ts
  LEFT JOIN public.profiles p ON p.user_id = ts.user_id
  ORDER BY ts.total_profit DESC
  LIMIT 100;
END;
$$;