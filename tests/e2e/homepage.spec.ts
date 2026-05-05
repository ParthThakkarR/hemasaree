import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage', () => {
  test('should load correctly and show brand name', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hema Sarees/);
    // Be specific about which "Hema Sarees" text we want to see (e.g., in the header)
    await expect(page.locator('header').getByText('Hema Sarees')).toBeVisible();
  });

  test('should not have detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .analyze();
    
    // We expect some violations in a prototype, but let's at least check for critical ones
    const criticalViolations = accessibilityScanResults.violations.filter(v => v.impact === 'critical');
    expect(criticalViolations).toEqual([]);
  });
});

test.describe('Navigation', () => {
  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    // Click "All Sarees" in the navigation
    await page.getByRole('link', { name: 'All Sarees' }).first().click();
    await expect(page).toHaveURL(/\/products/);
    // The actual heading is "All Sarees"
    await expect(page.getByRole('heading', { name: 'All Sarees' })).toBeVisible();
  });
});
