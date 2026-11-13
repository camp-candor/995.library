import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,

  // ⚡️ SPEED OPTIMIZATIONS
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000', // RSBuild default
    trace: 'on-first-retry',
  },

  // 🚀 AUTO-START RSBUILD
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },

  projects: [
    {
      name: 'Google Chrome',
      use: {
        ...devices['Desktop Chrome'],
        // 🟢 THE MAGIC LINE:
        // This tells Playwright Core to look for the machine's installed Chrome
        // instead of a downloaded binary.
        channel: 'chrome',
      },
    },
  ],
});
