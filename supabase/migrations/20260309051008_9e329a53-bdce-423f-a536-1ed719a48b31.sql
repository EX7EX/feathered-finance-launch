
-- Create supported_currencies table
CREATE TABLE public.supported_currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('crypto', 'fiat')),
  symbol text NOT NULL,
  exchange_rate_to_usd numeric NOT NULL DEFAULT 0,
  icon_url text,
  decimals integer NOT NULL DEFAULT 2,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.supported_currencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view currencies"
  ON public.supported_currencies
  FOR SELECT
  TO authenticated
  USING (true);

-- Also allow anon to read currencies (public data)
CREATE POLICY "Public can view currencies"
  ON public.supported_currencies
  FOR SELECT
  TO anon
  USING (true);

-- Create crypto_wallets table
CREATE TABLE public.crypto_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  crypto_code text REFERENCES public.supported_currencies(code) NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  address text,
  address_verified boolean NOT NULL DEFAULT false,
  blockchain text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, crypto_code)
);

ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallets"
  ON public.crypto_wallets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
  ON public.crypto_wallets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON public.crypto_wallets
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create fiat_accounts table
CREATE TABLE public.fiat_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  currency_code text REFERENCES public.supported_currencies(code) NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  available_balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, currency_code)
);

ALTER TABLE public.fiat_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fiat accounts"
  ON public.fiat_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fiat accounts"
  ON public.fiat_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fiat accounts"
  ON public.fiat_accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create price_cache table for CoinGecko caching
CREATE TABLE public.price_cache (
  coin_id text PRIMARY KEY,
  symbol text NOT NULL,
  current_price numeric NOT NULL DEFAULT 0,
  price_change_percentage_24h numeric,
  total_volume numeric,
  market_cap numeric,
  image text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.price_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price cache"
  ON public.price_cache
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view price cache"
  ON public.price_cache
  FOR SELECT
  TO anon
  USING (true);

-- Create leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  COALESCE(p.points, 0) as points,
  COALESCE(p.total_volume_usd, 0) as total_volume_usd,
  COALESCE(p.total_trades, 0) as total_trades
FROM public.profiles p
ORDER BY COALESCE(p.points, 0) DESC
LIMIT 100;

-- Grant select on leaderboard view
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.leaderboard TO anon;
