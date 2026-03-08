
-- Add account_label to mt_accounts
ALTER TABLE public.mt_accounts ADD COLUMN IF NOT EXISTS account_label TEXT NOT NULL DEFAULT 'Account 1';

-- Add mt_account_id to trades table for linking trades to MT accounts
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS mt_account_id UUID REFERENCES public.mt_accounts(id) ON DELETE SET NULL;

-- Add ticket column for MetaApi deduplication
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS ticket TEXT;

-- Create unique index on ticket per user to prevent duplicate trades
CREATE UNIQUE INDEX IF NOT EXISTS idx_trades_ticket_user ON public.trades (user_id, ticket) WHERE ticket IS NOT NULL;

-- Create function to enforce 3-account limit
CREATE OR REPLACE FUNCTION public.enforce_mt_account_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.mt_accounts WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Maximum of 3 MT accounts allowed per user';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS check_mt_account_limit ON public.mt_accounts;
CREATE TRIGGER check_mt_account_limit
  BEFORE INSERT ON public.mt_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_mt_account_limit();

-- Admin policy: admins can view all MT accounts
CREATE POLICY "Admins can view all MT accounts"
  ON public.mt_accounts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
