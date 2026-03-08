
CREATE TABLE public.mt_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  broker_name TEXT NOT NULL,
  server_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  investor_password TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'MT5' CHECK (platform IN ('MT4', 'MT5')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, account_number, server_name)
);

ALTER TABLE public.mt_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own MT accounts"
  ON public.mt_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MT accounts"
  ON public.mt_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MT accounts"
  ON public.mt_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MT accounts"
  ON public.mt_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_mt_accounts_updated_at
  BEFORE UPDATE ON public.mt_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
