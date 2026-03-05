
-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  myfxbook_username TEXT,
  myfxbook_account_id TEXT,
  myfxbook_connected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Buy', 'Sell')),
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC NOT NULL,
  stop_loss NUMERIC NOT NULL,
  take_profit NUMERIC NOT NULL,
  lot_size NUMERIC NOT NULL,
  profit_loss NUMERIC NOT NULL,
  date DATE NOT NULL,
  strategy TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  screenshot_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trades" ON public.trades FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trades" ON public.trades FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trades" ON public.trades FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trades" ON public.trades FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_trades_user_date ON public.trades(user_id, date DESC);

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create daily reflections table
CREATE TABLE public.daily_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  followed_plan BOOLEAN,
  mistake TEXT,
  did_well TEXT,
  improvement TEXT,
  notes TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reflections" ON public.daily_reflections FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reflections" ON public.daily_reflections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reflections" ON public.daily_reflections FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reflections" ON public.daily_reflections FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_reflections_updated_at BEFORE UPDATE ON public.daily_reflections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create leaderboard stats table
CREATE TABLE public.leaderboard_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_profit NUMERIC NOT NULL DEFAULT 0,
  win_rate NUMERIC NOT NULL DEFAULT 0,
  total_trades INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leaderboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is viewable by all authenticated users" ON public.leaderboard_stats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upsert their own stats" ON public.leaderboard_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON public.leaderboard_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Storage bucket for trade screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);

CREATE POLICY "Users can upload screenshots" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Screenshots are publicly accessible" ON storage.objects FOR SELECT
USING (bucket_id = 'screenshots');

CREATE POLICY "Users can delete their own screenshots" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
