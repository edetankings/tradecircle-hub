
CREATE TABLE public.trading_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  max_risk_per_trade NUMERIC NOT NULL DEFAULT 1,
  max_trades_per_day INTEGER NOT NULL DEFAULT 3,
  allowed_pairs TEXT[] NOT NULL DEFAULT '{}',
  trading_sessions TEXT[] NOT NULL DEFAULT '{}',
  daily_loss_limit NUMERIC NOT NULL DEFAULT 0,
  weekly_loss_limit NUMERIC NOT NULL DEFAULT 0,
  strategy_rules TEXT NOT NULL DEFAULT '',
  discipline_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.trading_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trading plan"
  ON public.trading_plans FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trading plan"
  ON public.trading_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading plan"
  ON public.trading_plans FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trading plan"
  ON public.trading_plans FOR DELETE USING (auth.uid() = user_id);
