import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createErrorHandler, getUserFriendlyErrorMessage } from "@/lib/errorHandling";

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

// Create a scoped error handler for user profile operations
const handleUserProfileError = createErrorHandler("User Profile");

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
      // Use the error handler to process and log the error before throwing
      throw handleUserProfileError(error);
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
      // Use the error handler to process and log the error before throwing
      throw handleUserProfileError(error);
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
      // Use getUserFriendlyErrorMessage for the toast description
      toast({
        title: 'Error',
        description: `Failed to update profile: ${getUserFriendlyErrorMessage(error)}`,
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
