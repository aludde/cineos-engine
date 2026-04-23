import { test, expect } from '@playwright/test';

test('Guest funnel works and paywall triggers', async ({ page }) => {
  // 1. Go to the homepage
  await page.goto('http://localhost:3000/');

  // 2. Click 'Try for Free'
  await page.getByText('Try for Free').click();

  // 3. We should be on the uploader page (or guest breakdown)
  await expect(page).toHaveURL(/.*project\/new|.*guest\/breakdown/);

  // 4. Try to click a premium feature (Schedule tab)
  // Note: Playwright can handle window alerts automatically
  page.on('dialog', async dialog => {
    expect(dialog.message()).toContain('premium feature');
    await dialog.accept();
  });

  await page.getByText('Schedule').click();

  // 5. Verify it kicked us to the Auth page
  await expect(page).toHaveURL(/.*auth/);
});