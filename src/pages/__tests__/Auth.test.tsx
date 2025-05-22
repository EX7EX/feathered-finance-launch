import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Auth from '../Auth';
import { vi } from 'vitest';

// Mock child components
vi.mock('../SignIn', () => ({
  default: () => <div data-testid="sign-in">Sign In Component</div>
}));

vi.mock('../SignUp', () => ({
  default: () => <div data-testid="sign-up">Sign Up Component</div>
}));

const renderAuth = (initialEntries: string[] = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<Auth />}>
          <Route index element={<div>Test Content</div>} />
          <Route path="signin" element={<div data-testid="sign-in">Sign In Component</div>} />
          <Route path="signup" element={<div data-testid="sign-up">Sign Up Component</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('Auth Layout Component', () => {
  it('renders back button', () => {
    renderAuth();
    
    const backButton = screen.getByRole('link');
    expect(backButton).toHaveAttribute('href', '/');
  });

  it('renders child components', () => {
    renderAuth(['/signin']);
    expect(screen.getByTestId('sign-in')).toBeInTheDocument();

    renderAuth(['/signup']);
    expect(screen.getByTestId('sign-up')).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    renderAuth();
    
    const container = screen.getByTestId('auth-container');
    expect(container).toHaveClass('min-h-screen', 'bg-crypto-dark', 'flex', 'flex-col');
    
    const contentArea = screen.getByTestId('auth-content');
    expect(contentArea).toHaveClass('flex-1', 'flex', 'items-center', 'justify-center', 'p-4');
  });
}); 