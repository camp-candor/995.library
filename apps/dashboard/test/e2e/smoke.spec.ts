import { test, expect } from '@playwright/test';

test('Smoke Test: App loads successfully', async ({ page }) => {
  // Go to localhost:3000 (defined in baseURL)
  await page.goto('/');

  // Verify title or content
  await expect(page).toHaveTitle(/Rsbuild/i);
});
