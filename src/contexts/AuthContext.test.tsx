import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/lib/auth-utils';
import { getUserFriendlyErrorMessage } from '@/lib/errorHandling';
import { Session, User, AuthError } from '@supabase/supabase-js';
import React from 'react';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/auth-utils', () => ({
  cleanupAuthState: vi.fn(),
}));

vi.mock('@/lib/errorHandling', () => ({
  createErrorHandler: (context: string) => (error: unknown): Error => {
    console.error(`${context} error:`, error);
    return error instanceof Error ? error : new Error(`Unknown error in ${context}`);
  },
  getUserFriendlyErrorMessage: vi.fn((error: unknown) => {
    if (error instanceof Error && error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password.';
    }
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
  }),
}));

// Mock localStorage
const localStorageMock = {
  removeItem: vi.fn(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Helper component to consume AuthContext
interface TestComponentProps {
  action?: (auth: ReturnType<typeof useAuth>) => void;
}

const TestComponent = ({ action }: TestComponentProps) => {
  const auth = useAuth();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (auth.isLoading) return;
    setLoading(false);
    action?.(auth);
  }, [auth.isLoading, action]);

  return <div data-testid="loading">{loading.toString()}</div>;
};

// Helper function to render with auth provider
const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  ...overrides,
});

const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  access_token: 'fake-token',
  refresh_token: 'fake-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides,
});

const assertToastCalled = (expected: object, times = 1) => {
  expect(toast).toHaveBeenCalledWith(expect.objectContaining(expected));
  expect(toast).toHaveBeenCalledTimes(times);
};

const assertNoUserOrSession = () => {
  expect(supabase.auth.getSession).toHaveBeenCalled();
  expect(localStorage.removeItem).toHaveBeenCalledWith('supabase.auth.token');
};

// Wait for initial loading state
const waitForInitialLoad = async () => {
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'), { timeout: 2000 });
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default Supabase mocks
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      return { data: { subscription: { unsubscribe: vi.fn(), id: 'test-id', callback } } };
    });
    vi.mocked(getUserFriendlyErrorMessage).mockImplementation((error: unknown) => {
      if (error instanceof Error && error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password.';
      }
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    });
  });

  describe('Sign-In', () => {
    it('handles successful sign-in', async () => {
      const mockUser = createMockUser();
      const mockSession = createMockSession({ user: mockUser });

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      let authContext: ReturnType<typeof useAuth> | undefined;
      renderWithAuthProvider(<TestComponent action={(context) => (authContext = context)} />);

      await waitForInitialLoad();
      if (!authContext) throw new Error('Auth context not initialized');
      await authContext.signIn('test@example.com', 'password');
      await waitForInitialLoad();

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      assertToastCalled({
        title: 'Welcome to PEBL!',
        description: `You've successfully signed in to your account.`,
        className: 'bg-crypto-gradient text-white border-none',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it('handles sign-in failure', async () => {
      const error = new AuthError('Invalid login credentials', 400);

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error,
      });

      let authContext: ReturnType<typeof useAuth> | undefined;
      renderWithAuthProvider(<TestComponent action={(context) => (authContext = context)} />);

      await waitForInitialLoad();
      if (!authContext) throw new Error('Auth context not initialized');
      await expect(authContext.signIn('wrong@example.com', 'wrongpassword')).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Sign In Failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  describe('Sign-Up', () => {
    it('handles successful sign-up with email verification', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      let authContext: ReturnType<typeof useAuth> | undefined;
      renderWithAuthProvider(<TestComponent action={(context) => (authContext = context)} />);

      await waitForInitialLoad();
      if (!authContext) throw new Error('Auth context not initialized');
      await authContext.signUp('newuser@example.com', 'password');
      await waitForInitialLoad();

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password',
        options: {
          emailRedirectTo: expect.any(String),
        },
      });
      assertNoUserOrSession();
      assertToastCalled({
        title: 'Welcome to PEBL!',
        description: `We've sent you a confirmation email. Please check your inbox to activate your account.`,
        className: 'bg-crypto-gradient text-white border-none',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it('handles sign-up failure', async () => {
      const error = new AuthError('Password is too short', 400);

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error,
      });

      let authContext: ReturnType<typeof useAuth> | undefined;
      renderWithAuthProvider(<TestComponent action={(context) => (authContext = context)} />);

      await waitForInitialLoad();
      if (!authContext) throw new Error('Auth context not initialized');
      await expect(authContext.signUp('newuser@example.com', 'short')).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Sign Up Failed',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  describe('Sign-Out', () => {
    it('handles successful sign-out', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      let authContext: ReturnType<typeof useAuth> | undefined;
      renderWithAuthProvider(<TestComponent action={(context) => (authContext = context)} />);

      await waitForInitialLoad();
      if (!authContext) throw new Error('Auth context not initialized');
      await authContext.signOut();
      await waitForInitialLoad();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      assertToastCalled({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
        className: 'bg-crypto-gradient text-white border-none',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it('handles sign-out failure', async () => {
      const error = new AuthError('Network error', 500);

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error });

      let authContext: ReturnType<typeof useAuth> | undefined;
      renderWithAuthProvider(<TestComponent action={(context) => (authContext = context)} />);

      await waitForInitialLoad();
      if (!authContext) throw new Error('Auth context not initialized');
      await expect(authContext.signOut()).rejects.toThrow(error);
      await waitForInitialLoad();

      assertToastCalled({
        title: 'Sign Out Failed',
        description: 'Error: Network error',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles network error during sign-in', async () => {
      const error = new AuthError('Network error', 500);

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error,
      });

      let authContext: ReturnType<typeof useAuth> | undefined;
      renderWithAuthProvider(<TestComponent action={(context) => (authContext = context)} />);

      await waitForInitialLoad();
      if (!authContext) throw new Error('Auth context not initialized');
      await expect(authContext.signIn('test@example.com', 'password')).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Sign In Failed',
        description: 'Error: Network error',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it('handles rate limit error during sign-in', async () => {
      const error = new AuthError('Too many requests', 429);

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error,
      });

      let authContext: ReturnType<typeof useAuth> | undefined;
      renderWithAuthProvider(<TestComponent action={(context) => (authContext = context)} />);

      await waitForInitialLoad();
      if (!authContext) throw new Error('Auth context not initialized');
      await expect(authContext.signIn('test@example.com', 'password')).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Sign In Failed',
        description: 'Error: Too many requests',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });
});