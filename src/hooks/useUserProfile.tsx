import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// The Profile type definition is currently inaccessible.
// Using 'any' as a temporary workaround.
// TODO: Regenerate Supabase types to restore type safety.

export const useUserProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        setProfile(data);
      } catch (err) {
        setError(err);
        console.error('Error fetching user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
};
