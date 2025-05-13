
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/lib/auth-utils';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome to PEBL!",
            description: "You've successfully signed in to your account.",
            className: "bg-crypto-gradient text-white border-none",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "See you soon!",
            description: "You've been signed out successfully.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Clean up existing state first
      cleanupAuthState();
      
      // Try global sign out to ensure clean state
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (e) {
        // Ignore errors here, continue with sign in
      }
      
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setIsLoading(true);
      // First ensure we have a clean state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) {
        throw error;
      } else {
        toast({
          title: "Welcome to PEBL!",
          description: "We've sent you a confirmation email. Please check your inbox to activate your account.",
          className: "bg-crypto-gradient text-white border-none",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      // First ensure we have a clean state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Google Sign In Failed",
        description: error.message === "Unsupported provider: provider is not enabled" 
          ? "Google login is not enabled in Supabase. Please enable it in the Supabase dashboard."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      // First ensure we have a clean state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Apple Sign In Failed",
        description: error.message === "Unsupported provider: provider is not enabled" 
          ? "Apple login is not enabled in Supabase. Please enable it in the Supabase dashboard."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    try {
      setIsLoading(true);
      // First ensure we have a clean state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Facebook Sign In Failed",
        description: error.message === "Unsupported provider: provider is not enabled" 
          ? "Facebook login is not enabled in Supabase. Please enable it in the Supabase dashboard."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      setIsLoading(true);
      // First ensure we have a clean state
      cleanupAuthState();
      
      const { error } = await supabase.auth.signInWithOtp({ 
        phone,
        options: {
          shouldCreateUser: true,
        }
      });
      
      if (error) {
        throw error;
      } else {
        toast({
          title: "Verification Code Sent",
          description: "We've sent a verification code to your phone number. Please enter it to continue.",
          className: "bg-crypto-gradient text-white border-none",
        });
      }
    } catch (error: any) {
      toast({
        title: "Phone Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        throw error;
      } else {
        // Force page reload for a clean state
        window.location.href = '/auth';
      }
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "We've sent you an email with a password reset link. Please check your inbox.",
          className: "bg-crypto-gradient text-white border-none",
        });
      }
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithApple,
      signInWithFacebook,
      signInWithPhone,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
