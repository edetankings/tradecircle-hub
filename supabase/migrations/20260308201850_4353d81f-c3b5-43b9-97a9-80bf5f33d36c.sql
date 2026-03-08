
CREATE TABLE public.strategy_journal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trade_id uuid REFERENCES public.trades(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  emotional_state text DEFAULT 'neutral',
  trade_idea text DEFAULT '',
  screenshot_url text,
  tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.strategy_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal" ON public.strategy_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON public.strategy_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON public.strategy_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON public.strategy_journal FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_strategy_journal_updated_at
  BEFORE UPDATE ON public.strategy_journal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
