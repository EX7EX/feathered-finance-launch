import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000, // 60 seconds
  expect: {
    timeout: 10000, // 10 seconds
  },
  use: {
    baseURL: 'http://localhost:5173', // Vite's default port
    trace: 'on-first-retry',
    video: 'on-first-retry',
    actionTimeout: 15000, // 15 seconds
    navigationTimeout: 15000, // 15 seconds
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173', // Vite's default port
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes
  },
}); 