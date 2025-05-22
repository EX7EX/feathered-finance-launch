import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SignIn from '../SignIn';
import { vi } from 'vitest';

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

const renderSignIn = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SignIn />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SignIn Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({ toast: vi.fn() });
  });

  it('renders sign in form correctly', () => {
    const mockAuth = {
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signInWithFacebook: vi.fn(),
    };
    (useAuth as any).mockReturnValue(mockAuth);

    renderSignIn();
    
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText('Access your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Don\'t have an account?')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('handles email/password sign in', async () => {
    const mockSignIn = vi.fn();
    (useAuth as any).mockReturnValue({ 
      signIn: mockSignIn,
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signInWithFacebook: vi.fn(),
    });

    renderSignIn();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('handles social sign in', async () => {
    const mockSignInWithGoogle = vi.fn();
    const mockSignInWithApple = vi.fn();
    const mockSignInWithFacebook = vi.fn();
    
    (useAuth as any).mockReturnValue({
      signIn: vi.fn(),
      signInWithGoogle: mockSignInWithGoogle,
      signInWithApple: mockSignInWithApple,
      signInWithFacebook: mockSignInWithFacebook,
    });

    renderSignIn();

    // Test Google sign in
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));
    expect(mockSignInWithGoogle).toHaveBeenCalled();

    // Test Apple sign in
    fireEvent.click(screen.getByRole('button', { name: /Continue with Apple/i }));
    expect(mockSignInWithApple).toHaveBeenCalled();

    // Test Facebook sign in
    fireEvent.click(screen.getByRole('button', { name: /Continue with Facebook/i }));
    expect(mockSignInWithFacebook).toHaveBeenCalled();
  });

  it('navigates to sign up page', () => {
    const mockAuth = {
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signInWithFacebook: vi.fn(),
    };
    (useAuth as any).mockReturnValue(mockAuth);

    renderSignIn();
    
    const signUpLink = screen.getByText('Sign up');
    expect(signUpLink).toHaveAttribute('href', '/auth/signup');
  });

  it('navigates to forgot password page', () => {
    const mockAuth = {
      signIn: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signInWithFacebook: vi.fn(),
    };
    (useAuth as any).mockReturnValue(mockAuth);

    renderSignIn();
    
    const forgotPasswordLink = screen.getByText('Forgot password?');
    expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
  });
}); 