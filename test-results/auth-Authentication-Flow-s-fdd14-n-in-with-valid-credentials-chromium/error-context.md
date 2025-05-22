# Test info

- Name: Authentication Flow >> should successfully sign in with valid credentials
- Location: /Users/mac/Documents/WORKSPACE/fintechs/exchanges:launchpads/feathered-finance-launch/tests/e2e/auth.spec.ts:41:3

# Error details

```
TimeoutError: locator.fill: Timeout 15000ms exceeded.
Call log:
  - waiting for getByLabel('Email')

    at /Users/mac/Documents/WORKSPACE/fintechs/exchanges:launchpads/feathered-finance-launch/tests/e2e/auth.spec.ts:43:36
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // Load environment variables
   4 | const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
   5 | const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD || 'testpassword123';
   6 |
   7 | test.describe('Authentication Flow', () => {
   8 |   test.beforeEach(async ({ page }) => {
   9 |     // Navigate to the auth page before each test
  10 |     await page.goto('/auth');
  11 |     // Wait for the page to be fully loaded
  12 |     await page.waitForLoadState('networkidle');
  13 |   });
  14 |
  15 |   test('should display auth form with tabs', async ({ page }) => {
  16 |     // Check if the auth form is visible
  17 |     await expect(page.getByRole('heading', { name: 'Welcome to SimplMonie' })).toBeVisible({ timeout: 10000 });
  18 |     await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible({ timeout: 10000 });
  19 |     await expect(page.getByRole('tab', { name: 'Register' })).toBeVisible({ timeout: 10000 });
  20 |   });
  21 |
  22 |   test('should show validation errors for invalid input', async ({ page }) => {
  23 |     // Try to submit empty form
  24 |     await page.getByRole('button', { name: 'Sign In' }).click();
  25 |     
  26 |     // Check for validation messages
  27 |     await expect(page.getByText('Email is required')).toBeVisible({ timeout: 10000 });
  28 |     await expect(page.getByText('Password is required')).toBeVisible({ timeout: 10000 });
  29 |   });
  30 |
  31 |   test('should show error for invalid credentials', async ({ page }) => {
  32 |     // Fill in invalid credentials
  33 |     await page.getByLabel('Email').fill('invalid@example.com');
  34 |     await page.getByLabel('Password').fill('wrongpassword');
  35 |     await page.getByRole('button', { name: 'Sign In' }).click();
  36 |
  37 |     // Check for error message
  38 |     await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10000 });
  39 |   });
  40 |
  41 |   test('should successfully sign in with valid credentials', async ({ page }) => {
  42 |     // Fill in valid credentials
> 43 |     await page.getByLabel('Email').fill(TEST_USER_EMAIL);
     |                                    ^ TimeoutError: locator.fill: Timeout 15000ms exceeded.
  44 |     await page.getByLabel('Password').fill(TEST_USER_PASSWORD);
  45 |     await page.getByRole('button', { name: 'Sign In' }).click();
  46 |
  47 |     // Check if redirected to dashboard
  48 |     await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  49 |     
  50 |     // Check if user is logged in
  51 |     await expect(page.getByText('Welcome')).toBeVisible({ timeout: 10000 });
  52 |   });
  53 | }); 
```