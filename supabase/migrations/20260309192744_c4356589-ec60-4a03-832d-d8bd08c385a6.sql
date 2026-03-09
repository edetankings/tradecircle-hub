
-- Add market_reviews table
CREATE TABLE public.market_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pair TEXT NOT NULL DEFAULT '',
  outlook TEXT NOT NULL DEFAULT '',
  entry_idea TEXT NOT NULL DEFAULT '',
  key_levels TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  setup_result TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own market reviews" ON public.market_reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own market reviews" ON public.market_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own market reviews" ON public.market_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own market reviews" ON public.market_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add num_positions column to trades table
ALTER TABLE public.trades ADD COLUMN IF NOT EXISTS num_positions INTEGER NOT NULL DEFAULT 1;
