import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Using 'any' as a temporary workaround due to inaccessible types.
// TODO: Regenerate Supabase types to restore type safety.
export type LeaderboardUser = any;

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // The 'leaderboard' view was created in the migration
        const { data, error } = await supabase
          .from('leaderboard')
          .select('*');

        if (error) throw error;

        setLeaderboard(data || []);
      } catch (err) {
        setError(err);
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return { leaderboard, loading, error };
};
