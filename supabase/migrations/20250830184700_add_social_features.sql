-- Add columns for social and gamification features to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS points integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_trades integer DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS total_volume_usd numeric DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS last_login_points_awarded_at timestamp with time zone;

-- Create a public-facing view for the leaderboard to avoid exposing sensitive profile data
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  id,
  username,
  avatar_url,
  points,
  total_trades,
  total_volume_usd
FROM
  public.profiles
ORDER BY
  points DESC
LIMIT 100;
