import { test, expect } from '@playwright/test';

// Load environment variables
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'testpassword123';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sign-in page before each test
    await page.goto('/auth/signin');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display sign in form', async ({ page }) => {
    // Check if the sign-in form is visible
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Access your account')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholderText('you@example.com')).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholderText('••••••••')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible({ timeout: 10000 });
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Check for validation messages
    await expect(page.getByText('Email is required')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Password is required')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.getByPlaceholderText('you@example.com').fill('invalid@example.com');
    await page.getByPlaceholderText('••••••••').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Check for error message
    await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 });
  });

  test('should successfully sign in with valid credentials', async ({ page }) => {
    // Fill in valid credentials
    await page.getByPlaceholderText('you@example.com').fill(TEST_USER_EMAIL);
    await page.getByPlaceholderText('••••••••').fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Check if redirected to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    // Check if user is logged in
    await expect(page.getByText('Welcome')).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to sign up page', async ({ page }) => {
    await page.getByText('Sign up').click();
    await expect(page).toHaveURL('/auth/signup');
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.getByText('Forgot password?').click();
    await expect(page).toHaveURL('/auth/forgot-password');
  });
}); 