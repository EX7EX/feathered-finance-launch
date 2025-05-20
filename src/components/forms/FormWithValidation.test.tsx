import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'bun:test';
import '@testing-library/jest-dom';
import FormWithValidation from './FormWithValidation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cleanupAuthState } from '@/lib/auth-utils';
import { getUserFriendlyErrorMessage } from '@/lib/errorHandling';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
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

// Helper to render with AuthProvider
const renderWithAuthProvider = (ui: React.ReactElement) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

// Centralized auth state change trigger
let authStateCallback: ((event: string, session: any) => void) | null = null;
const triggerAuthStateChange = (event: string, session: any) => {
  if (authStateCallback) {
    authStateCallback(event, session);
  }
};

describe('FormWithValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default Supabase mocks
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    supabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });
    getUserFriendlyErrorMessage.mockImplementation((error) => {
      if (error.message.includes('Invalid login credentials')) {
        return 'Invalid email or password.';
      }
      return `Error: ${error.message}`;
    });
  });

  it('renders the form with email and password fields', () => {
    renderWithAuthProvider(<FormWithValidation />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields on submit', async () => {
    renderWithAuthProvider(<FormWithValidation />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('displays validation error for invalid email format', async () => {
    renderWithAuthProvider(<FormWithValidation />);

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
    const mockUser = { id: 'user-id', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'fake-token' };

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: mockSession },
      error: null,
    });

    renderWithAuthProvider(<FormWithValidation />);

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
          description: 'You’ve successfully signed in to your account.',
          className: 'bg-crypto-gradient text-white border-none',
        })
      );
      expect(cleanupAuthState).toHaveBeenCalled();
    });
  });

  it('displays error toast on sign-in failure', async () => {
    const error = new Error('Invalid login credentials');
    (error as any).status = 400;

    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error,
    });

    renderWithAuthProvider(<FormWithValidation />);

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
    const mockOnSubmit = jest.fn();
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
    supabase.auth.signInWithPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { user: null, session: null }, error: null }), 100))
    );

    renderWithAuthProvider(<FormWithValidation />);

    fireEvent.input(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.input(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
    });
  });
});