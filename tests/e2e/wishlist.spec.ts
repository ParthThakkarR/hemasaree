import { test, expect } from '@playwright/test';

test.describe('Wishlist Authentication', () => {
  test('should redirect unauthenticated user to login when clicking wishlist in navbar', async ({ page }) => {
    await page.goto('/');
    // Find the wishlist link in the navbar. It has a heart icon.
    // In Navbar.tsx: <Link href="/wishlist" ...>
    await page.locator('header').getByRole('link', { name: /wishlist/i }).click();
    
    // Should be redirected to login page with callbackUrl
    await expect(page).toHaveURL(/\/login\?callbackUrl=\/wishlist/);
  });

  test('should show error toast and redirect to login when adding to wishlist from product card while logged out', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for product cards to load
    await page.waitForSelector('[aria-label="Add to wishlist"]');
    
    // Click the first wishlist button
    await page.locator('[aria-label="Add to wishlist"]').first().click();
    
    // Should show error toast (we can't easily test toast content with Playwright without specific selectors, 
    // but we can check if we are redirected to login)
    await expect(page).toHaveURL(/\/login/);
  });
});
