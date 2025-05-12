
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  kyc_level: string;
  kyc_verified: boolean;
  kyc_reference_id: string | null;
  country: string | null;
  phone: string | null;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  two_factor_enabled: boolean;
}

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fetchUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
    
    return data;
  };
  
  const updateUserProfile = async (updatedProfile: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    
    return data;
  };

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: fetchUserProfile,
    enabled: !!user,
  });

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile', user?.id], data);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update profile: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return { 
    profile, 
    isLoading, 
    error, 
    updateProfile, 
    isUpdating 
  };
}
