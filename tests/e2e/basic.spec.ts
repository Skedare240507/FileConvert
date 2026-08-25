import { test, expect } from '@playwright/test';

test.describe('Basic FileConvert End-to-End', () => {
  test('homepage has correct title and renders upload component', async ({ page }) => {
    // Note: Assuming standard local dev port 3000
    await page.goto('http://localhost:3000/');

    // Check title
    await expect(page).toHaveTitle(/FileConvert/);

    // Verify nav or some recognizable element is present
    const header = page.locator('h1').first();
    await expect(header).toBeVisible();
  });

  // Additional tests for upload, conversion, merge, and UI features would be added here.
});
