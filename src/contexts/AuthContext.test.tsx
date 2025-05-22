import React from 'react';
import { render, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { vi, Mock } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
};

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

const mockToast = vi.fn();
(useToast as Mock).mockReturnValue({ toast: mockToast });

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost',
    assign: vi.fn(),
  },
  writable: true,
});

const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <button onClick={() => auth.signIn('test@example.com', 'password')}>Sign In</button>
      <button onClick={() => auth.signUp('test@example.com', 'password')}>Sign Up</button>
      <button onClick={() => auth.signOut()}>Sign Out</button>
      <button onClick={() => auth.signInWithGoogle()}>Google Sign In</button>
      <button onClick={() => auth.signInWithApple()}>Apple Sign In</button>
      <button onClick={() => auth.signInWithFacebook()}>Facebook Sign In</button>
    </div>
  );
};

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  });

  describe('Sign-In', () => {
    it('handles successful sign-in', async () => {
      const mockSession = { user: { id: '123', email: 'test@example.com' } };
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { session: mockSession }, error: null });
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Sign In').click();
      });

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('handles sign-in failure', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ 
        data: { session: null }, 
        error: { message: 'Invalid login credentials' } 
      });
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Sign In').click();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sign In Failed',
        description: 'Invalid login credentials',
        variant: 'destructive',
      });
    });
  });

  describe('Sign-Up', () => {
    it('handles successful sign-up', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } }, error: null });

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Sign Up').click();
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: undefined,
          emailRedirectTo: 'http://localhost/auth',
        },
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Welcome to PEBL!',
        description: "We've sent you a confirmation email. Please check your inbox to activate your account.",
        className: 'bg-crypto-gradient text-white border-none',
      });
    });

    it('handles sign-up failure', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'Email already exists' } 
      });

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Sign Up').click();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sign Up Failed',
        description: 'Email already exists',
        variant: 'destructive',
      });
    });
  });

  describe('Sign-Out', () => {
    it('handles successful sign-out', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Sign Out').click();
      });

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('handles sign-out failure', async () => {
      mockSupabase.auth.signOut.mockRejectedValue(new Error('Sign out failed'));

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Sign Out').click();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Sign Out Failed',
        description: 'Sign out failed',
        variant: 'destructive',
      });
    });
  });

  describe('Social Sign-In', () => {
    it('handles Google sign-in', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { provider: 'google' }, error: null });

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Google Sign In').click();
      });

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost/auth',
        },
      });
    });

    it('handles Apple sign-in', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { provider: 'apple' }, error: null });

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Apple Sign In').click();
      });

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: 'http://localhost/auth',
        },
      });
    });

    it('handles Facebook sign-in', async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { provider: 'facebook' }, error: null });

      const { getByText } = renderWithAuth(<TestComponent />);

      await act(async () => {
        getByText('Facebook Sign In').click();
      });

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'facebook',
        options: {
          redirectTo: 'http://localhost/auth',
        },
      });
    });
  });
});