import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, jest } from 'bun:test';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/lib/auth-utils';
import { getUserFriendlyErrorMessage } from '@/lib/errorHandling';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
      signInWithOtp: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      refreshSession: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

jest.mock('@/lib/auth-utils', () => ({
  cleanupAuthState: jest.fn(),
  formatCurrency: jest.fn(),
  formatCryptoValue: jest.fn(),
}));

jest.mock('@/lib/errorHandling', () => ({
  getUserFriendlyErrorMessage: jest.fn(),
  createErrorHandler: jest.fn(() => jest.fn((err) => err)),
}));

// Mock window.location
const mockLocation = { origin: 'http://localhost:3000' };
Object.defineProperty(global, 'location', { value: mockLocation, writable: true });

// Mock localStorage for cleanupAuthState
const localStorageMock = { removeItem: jest.fn() };
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

// Helper to render with AuthProvider
const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

// Helper component to consume AuthContext
interface TestComponentProps {
  action?: (auth: ReturnType<typeof useAuth>) => void;
}

const TestComponent: React.FC<TestComponentProps> = ({ action }) => {
  const auth = useAuth();
  action?.(auth);
  return (
    <div>
      <span data-testid="user">{auth.user ? auth.user.id : 'null'}</span>
      <span data-testid="session">{auth.session ? 'exists' : 'null'}</span>
      <span data-testid="loading">{auth.isLoading.toString()}</span>
    </div>
  );
};

// Helpers for assertions
const assertNoUserOrSession = () => {
  expect(screen.getByTestId('user')).toHaveTextContent('null');
  expect(screen.getByTestId('session')).toHaveTextContent('null');
};

const assertToastCalled = (expected: object, times = 1) => {
  expect(toast).toHaveBeenCalledWith(expect.objectContaining(expected));
  expect(toast).toHaveBeenCalledTimes(times);
};

// Wait for initial loading state
const waitForInitialLoad = async () => {
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'), { timeout: 2000 });
};

// Centralized auth state change trigger
let authStateCallback: ((event: string, session: any) => void) | null = null;
const triggerAuthStateChange = (event: string, session: any) => {
  act(() => {
    if (authStateCallback) {
      authStateCallback(event, session);
    }
  });
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    getUserFriendlyErrorMessage.mockImplementation((error) => {
      if (error.message.includes('provider is not enabled')) {
        return `${error.provider} login is not enabled in Supabase.`;
      }
      if (error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password.';
      }
      if (error.message.includes('Password is too short')) {
        return 'Password must be at least 6 characters.';
      }
      if (error.message.includes('User not found')) {
        return 'No account found with this email.';
      }
      if (error.message.includes('Invalid phone number format')) {
        return 'Please enter a valid phone number.';
      }
      return `Error: ${error.message}`;
    });
  });

  describe('Initial State', () => {
    it('provides initial context values and resolves loading state', async () => {
      renderWithAuthProvider(<TestComponent />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      await waitForInitialLoad();
      assertNoUserOrSession();
    });
  });

  describe('Email/Password Authentication', () => {
    it('signs in with email/password and updates context', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'fake-token' };

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });
      supabase.auth.getSession
        .mockResolvedValueOnce({ data: { session: null }, error: null })
        .mockResolvedValueOnce({ data: { session: mockSession }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await auth!.signInWithPassword('test@example.com', 'password');
      triggerAuthStateChange('SIGNED_IN', mockSession);

      await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('user-id'));
      expect(screen.getByTestId('session')).toHaveTextContent('exists');
      assertToastCalled({
        title: 'Welcome to PEBL!',
        description: 'You've successfully signed in to your account.',
        className: 'bg-crypto-gradient text-white border-none',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth-state');
    });

    it('handles email/password sign-in failure', async () => {
      const error = new Error('Invalid login credentials');
      (error as any).status = 400;

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error,
      });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await expect(auth!.signInWithPassword('wrong@example.com', 'wrong')).rejects.toThrow(error);
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
      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await auth!.signUp('newuser@example.com', 'password');
      await waitForInitialLoad();

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password',
      });
      assertNoUserOrSession();
      assertToastCalled({
        title: 'Welcome to PEBL!',
        description: (We've sent you a confirmation email. Please check your inbox to activate your account),
        className: 'bg-crypto-gradient text-white border-none',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it('handles sign-up failure', async () => {
      const error = new Error('Password is too short');
      (error as any).status = 400;

      supabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error,
      });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await expect(auth!.signUp('newuser@example.com', 'short')).rejects.toThrow(error);
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
    it('signs out and clears context', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'fake-token' };

      supabase.auth.signOut.mockResolvedValue({ error: null });
      supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      triggerAuthStateChange('SIGNED_IN', mockSession);
      await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('user-id'));

      await auth!.signOut();
      triggerAuthStateChange('SIGNED_OUT', null);

      await waitFor(() => assertNoUserOrSession());
      assertToastCalled({
        title: 'See you soon!',
        description: 'You've been signed out successfully.',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth-state');
    });

    it('handles sign-out failure', async () => {
      const error = new Error('Failed to sign out');
      (error as any).status = 500;

      supabase.auth.signOut.mockResolvedValue({ error });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await expect(auth!.signOut()).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Sign Out Failed',
        description: 'Error: Failed to sign out',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  describe('OAuth Authentication', () => {
    it.each([
      { provider: 'google', signInMethod: 'signInWithGoogle', title: 'Google Sign In Failed' },
      { provider: 'apple', signInMethod: 'signInWithApple', title: 'Apple Sign In Failed' },
      { provider: 'facebook', signInMethod: 'signInWithFacebook', title: 'Facebook Sign In Failed' },
    ])('signs in with $provider OAuth and updates context', async ({ provider, signInMethod }) => {
      const mockUser = { id: `${provider}-user-id`, email: `${provider}@example.com` };
      const mockSession = { user: mockUser, access_token: `fake-${provider}-token` };

      supabase.auth.signInWithOAuth.mockResolvedValue({
        data: { provider, url: `https://${provider}.com/auth` },
        error: null,
      });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await auth![signInMethod]();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider,
        options: { redirectTo: `${mockLocation.origin}/auth` },
      });

      triggerAuthStateChange('SIGNED_IN', mockSession);
      await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent(`${provider}-user-id`));
      expect(screen.getByTestId('session')).toHaveTextContent('exists');
      assertToastCalled({
        title: 'Welcome to PEBL!',
        description: 'You've successfully signed in to your account.',
        className: 'bg-crypto-gradient text-white border-none',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it.each([
      { provider: 'google', signInMethod: 'signInWithGoogle', title: 'Google Sign In Failed' },
      { provider: 'apple', signInMethod: 'signInWithApple', title: 'Apple Sign In Failed' },
      { provider: 'facebook', signInMethod: 'signInWithFacebook', title: 'Facebook Sign In Failed' },
    ])('handles $provider OAuth failure (provider not enabled)', async ({ provider, signInMethod, title }) => {
      const error = new Error('Unsupported provider: provider is not enabled');
      (error as any).status = 400;
      (error as any).provider = provider.charAt(0).toUpperCase() + provider.slice(1);

      supabase.auth.signInWithOAuth.mockResolvedValue({ data: null, error });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await expect(auth![signInMethod]()).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title,
        description: `${error.provider} login is not enabled in Supabase.`,
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  describe('Phone OTP Authentication', () => {
    it('sends OTP for phone sign-in', async () => {
      supabase.auth.signInWithOtp.mockResolvedValue({ data: null, error: null });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await auth!.signInWithPhone('+1234567890');
      await waitForInitialLoad();

      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        phone: '+1234567890',
        options: { shouldCreateUser: true },
      });
      assertNoUserOrSession();
      assertToastCalled({
        title: 'Verification Code Sent',
        description: 'We've sent a verification code to your phone number. Please enter it to continue.',
        className: 'bg-crypto-gradient text-white border-none',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it('handles phone OTP failure', async () => {
      const error = new Error('Invalid phone number format');
      (error as any).status = 400;

      supabase.auth.signInWithOtp.mockResolvedValue({ data: null, error });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await expect(auth!.signInWithPhone('invalid')).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Phone Sign In Failed',
        description: 'Please enter a valid phone number.',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  describe('Password Reset', () => {
    it('sends password reset email', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ data: null, error: null });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await auth!.resetPassword('reset@example.com');
      await waitForInitialLoad();

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('reset@example.com', {
        redirectTo: `${mockLocation.origin}/auth/update-password`,
      });
      assertNoUserOrSession();
      assertToastCalled({
        title: 'Password Reset Email Sent',
        description: 'We've sent you an email with instructions to reset your password. Please check your inbox.',
        className: 'bg-crypto-gradient text-white border-none',
      });
      expect(cleanupAuthState).not.toHaveBeenCalled();
    });

    it('handles password reset failure', async () => {
      const error = new Error('User not found');
      (error as any).status = 404;

      supabase.auth.resetPasswordForEmail.mockResolvedValue({ data: null, error });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await expect(auth!.resetPassword('nonexistent@example.com')).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Password Reset Failed',
        description: 'No account found with this email.',
        variant: 'destructive',
      });
      expect(cleanupAuthState).not.toHaveBeenCalled();
    });
  });

  describe('Password Update', () => {
    it('updates password after reset', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'fake-token' };

      supabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      triggerAuthStateChange('PASSWORD_RECOVERY', mockSession);
      await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('user-id'));

      await auth!.updateUser({ password: 'newpassword' });
      await waitForInitialLoad();

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword' });
      expect(screen.getByTestId('user')).toHaveTextContent('user-id');
      assertToastCalled({
        title: 'Password Updated',
        description: 'Your password has been successfully updated.',
        className: 'bg-crypto-gradient text-white border-none',
      });
    });

    it('handles password update failure', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'fake-token' };
      const error = new Error('Password is too weak');
      (error as any).status = 400;

      supabase.auth.updateUser.mockResolvedValue({ data: null, error });
      supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      triggerAuthStateChange('PASSWORD_RECOVERY', mockSession);
      await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('user-id'));

      await expect(auth!.updateUser({ password: 'weak' })).rejects.toThrow(error);
      await waitForInitialLoad();

      expect(screen.getByTestId('user')).toHaveTextContent('user-id');
      assertToastCalled({
        title: 'Password Update Failed',
        description: 'Error: Password is too weak',
        variant: 'destructive',
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles network error during sign-in', async () => {
      const error = new Error('Network error');
      (error as any).status = 0;

      supabase.auth.signInWithPassword.mockRejectedValue(error);
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await expect(auth!.signInWithPassword('test@example.com', 'password')).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Sign In Failed',
        description: 'Error: Network error',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it('handles TOKEN_REFRESHED event', async () => {
      const mockUser = { id: 'user-id', email: 'test@example.com' };
      const mockSession = { user: mockUser, access_token: 'new-token' };

      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
      supabase.auth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      triggerAuthStateChange('TOKEN_REFRESHED', mockSession);

      await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('user-id'));
      expect(screen.getByTestId('session')).toHaveTextContent('exists');
      expect(toast).not.toHaveBeenCalled();
    });

    it('handles rate limit error during sign-in', async () => {
      const error = new Error('Too many requests');
      (error as any).status = 429;

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error,
      });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await expect(auth!.signInWithPassword('test@example.com', 'password')).rejects.toThrow(error);
      await waitForInitialLoad();

      assertNoUserOrSession();
      assertToastCalled({
        title: 'Sign In Failed',
        description: 'Error: Too many requests',
        variant: 'destructive',
      });
      expect(cleanupAuthState).toHaveBeenCalled();
    });

    it('handles invalid redirectTo URL', async () => {
      Object.defineProperty(global, 'location', { value: { origin: undefined }, writable: true }); // Simulate non-browser environment
      const mockUser = { id: 'google-user-id', email: 'google@example.com' };
      const mockSession = { user: mockUser, access_token: 'fake-google-token' };

      supabase.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: 'google', url: 'https://google.com/auth' },
        error: null,
      });
      supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

      let auth: ReturnType<typeof useAuth>;
      renderWithAuthProvider(<TestComponent action={(context) => (auth = context)} />);

      await waitForInitialLoad();
      await auth!.signInWithGoogle();
      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: 'http://localhost/auth' }, // Fallback URL
      });

      triggerAuthStateChange('SIGNED_IN', mockSession);
      await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('google-user-id'));
      expect(screen.getByTestId('session')).toHaveTextContent('exists');
      assertToastCalled({
        title: 'Welcome to PEBL!',
        description: 'You've successfully signed in to your account.',
      });
      Object.defineProperty(global, 'location', { value: mockLocation, writable: true });
    });
  });
});