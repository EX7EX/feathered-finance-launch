
-- Fix security definer view by recreating with SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = true)
AS
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

GRANT SELECT ON public.leaderboard TO authenticated;
GRANT SELECT ON public.leaderboard TO anon;

-- Add a permissive SELECT policy on profiles for leaderboard access
CREATE POLICY "Public can view leaderboard profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);
