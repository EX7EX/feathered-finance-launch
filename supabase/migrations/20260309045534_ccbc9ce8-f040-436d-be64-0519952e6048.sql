
-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  kyc_level text DEFAULT 'none',
  kyc_verified boolean DEFAULT false,
  kyc_reference_id text,
  country text,
  phone text,
  locale text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  two_factor_enabled boolean DEFAULT false,
  points integer DEFAULT 0,
  total_trades integer DEFAULT 0,
  total_volume_usd numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Game scores table
CREATE TABLE public.game_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score integer NOT NULL,
  level integer NOT NULL DEFAULT 1,
  chickens_defeated integer DEFAULT 0,
  longest_combo integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own scores" ON public.game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view all scores" ON public.game_scores FOR SELECT TO authenticated USING (true);

-- Trade history table
CREATE TABLE public.trade_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pair text NOT NULL,
  side text NOT NULL,
  price numeric NOT NULL,
  amount numeric NOT NULL,
  total numeric NOT NULL,
  tx_hash text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trades" ON public.trade_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON public.trade_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for trade_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.trade_history;
