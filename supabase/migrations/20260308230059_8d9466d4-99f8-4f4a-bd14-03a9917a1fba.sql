
CREATE TABLE public.manual_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_name TEXT NOT NULL,
  broker_name TEXT NOT NULL DEFAULT '',
  account_currency TEXT NOT NULL DEFAULT 'USD',
  account_balance NUMERIC NOT NULL DEFAULT 0,
  account_equity NUMERIC NOT NULL DEFAULT 0,
  account_type TEXT NOT NULL DEFAULT 'Forex',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.manual_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own manual accounts"
  ON public.manual_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own manual accounts"
  ON public.manual_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manual accounts"
  ON public.manual_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manual accounts"
  ON public.manual_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Add manual_account_id to trades table for linking manual trades
ALTER TABLE public.trades ADD COLUMN manual_account_id UUID REFERENCES public.manual_accounts(id) ON DELETE SET NULL;
