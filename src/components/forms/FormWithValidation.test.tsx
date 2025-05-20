import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormWithValidation from './FormWithValidation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/lib/auth-utils';
import { getUserFriendlyErrorMessage } from '@/lib/errorHandling';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthChangeEvent, Session, User, AuthError } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

vi.mock('@/lib/auth-utils', () => ({
  cleanupAuthState: vi.fn(),
}));

vi.mock('@/lib/errorHandling', () => ({
  getUserFriendlyErrorMessage: vi.fn(),
}));

// Helper function to render with auth provider
const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

let authStateCallback: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;

const triggerAuthStateChange = (event: AuthChangeEvent, session: Session | null) => {
  if (authStateCallback) {
    authStateCallback(event, session);
  }
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

describe('FormWithValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default Supabase mocks
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn(), id: 'test-id', callback } } };
    });
    vi.mocked(getUserFriendlyErrorMessage).mockImplementation((error: unknown) => {
      if (error instanceof Error && error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password.';
      }
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    });
  });

  it('renders the form with email and password fields', () => {
    renderWithAuthProvider(<FormWithValidation onSubmit={() => {}} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields on submit', async () => {
    renderWithAuthProvider(<FormWithValidation onSubmit={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for invalid email format', async () => {
    renderWithAuthProvider(<FormWithValidation onSubmit={() => {}} />);

    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
    });
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('submits valid form data and calls signInWithPassword', async () => {
    const mockUser = createMockUser();
    const mockSession = createMockSession({ user: mockUser });

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    renderWithAuthProvider(<FormWithValidation onSubmit={() => {}} />);

    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    triggerAuthStateChange('SIGNED_IN', mockSession);
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Welcome to PEBL!',
          description: `You've successfully signed in to your account.`,
          className: 'bg-crypto-gradient text-white border-none',
        })
      );
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  it('displays error toast on sign-in failure', async () => {
    const error = new AuthError('Invalid login credentials', 400);

    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error,
    });

    renderWithAuthProvider(<FormWithValidation onSubmit={() => {}} />);

    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sign In Failed',
          description: 'Invalid email or password.',
          variant: 'destructive',
        })
      );
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  it('calls custom onSubmit prop when provided', async () => {
    const mockOnSubmit = vi.fn();
    renderWithAuthProvider(<FormWithValidation onSubmit={mockOnSubmit} />);

    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          password: 'password123',
        }),
        expect.anything() // Form event
      );
    });
  });

  it('disables submit button during submission', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ 
        data: { 
          user: null as unknown as User, 
          session: null as unknown as Session 
        }, 
        error: null 
      }), 100))
    );

    renderWithAuthProvider(<FormWithValidation onSubmit={() => {}} />);

    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });
});