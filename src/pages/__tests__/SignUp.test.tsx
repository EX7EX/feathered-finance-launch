import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SignUp from '../SignUp';
import { vi } from 'vitest';

// Define types for our mocks
interface AuthContextType {
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
}

interface ToastType {
  toast: (props: { title: string; description: string; variant?: string }) => void;
}

// Mock the useAuth hook
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

const renderSignUp = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SignUp Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ toast: vi.fn() });
  });

  it('renders sign up form correctly', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signUp: vi.fn(),
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signInWithFacebook: vi.fn(),
    });

    renderSignUp();
    
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Join our community')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Already have an account?')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });

  it('handles email/password sign up', async () => {
    const mockSignUp = vi.fn();
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ 
      signUp: mockSignUp,
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signInWithFacebook: vi.fn(),
    });

    renderSignUp();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('handles social sign up', async () => {
    const mockSignInWithGoogle = vi.fn();
    const mockSignInWithApple = vi.fn();
    const mockSignInWithFacebook = vi.fn();
    
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      signUp: vi.fn(),
      signInWithGoogle: mockSignInWithGoogle,
      signInWithApple: mockSignInWithApple,
      signInWithFacebook: mockSignInWithFacebook,
    });

    renderSignUp();

    // Test Google sign up
    fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));
    expect(mockSignInWithGoogle).toHaveBeenCalled();

    // Test Apple sign up
    fireEvent.click(screen.getByRole('button', { name: /Continue with Apple/i }));
    expect(mockSignInWithApple).toHaveBeenCalled();

    // Test Facebook sign up
    fireEvent.click(screen.getByRole('button', { name: /Continue with Facebook/i }));
    expect(mockSignInWithFacebook).toHaveBeenCalled();
  });

  it('navigates to sign in page', () => {
    renderSignUp();
    
    const signInLink = screen.getByText('Sign in');
    expect(signInLink).toHaveAttribute('href', '/auth/signin');
  });

  it('shows success toast on successful registration', async () => {
    const mockSignUp = vi.fn().mockResolvedValue(undefined);
    const mockToast = vi.fn();
    
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ 
      signUp: mockSignUp,
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signInWithFacebook: vi.fn(),
    });
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ toast: mockToast });

    renderSignUp();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'Your account has been created successfully.',
      });
    });
  });

  it('shows error toast on failed registration', async () => {
    const mockSignUp = vi.fn().mockRejectedValue(new Error('Registration failed'));
    const mockToast = vi.fn();
    
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ 
      signUp: mockSignUp,
      signInWithGoogle: vi.fn(),
      signInWithApple: vi.fn(),
      signInWithFacebook: vi.fn(),
    });
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ toast: mockToast });

    renderSignUp();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    });
  });
}); 