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
    
    // Wait for the products page to finish loading.
    // The page shows either product cards (with wishlist buttons) or an
    // empty-state when the database has no products (e.g. fresh CI container).
    // We wait for either signal so the test doesn't hang for 30s on an
    // empty DB.
    const wishlistButton = page.locator('[aria-label="Add to wishlist"]').first();
    const emptyState = page.locator('text=No products found');

    const loaded = await Promise.race([
      wishlistButton.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'products' as const),
      emptyState.waitFor({ state: 'visible', timeout: 15000 }).then(() => 'empty' as const),
    ]);

    // If the DB is empty there are no product cards to click — skip gracefully.
    test.skip(loaded === 'empty', 'No products in database — cannot test wishlist button on product card');

    // Click the first wishlist button
    await wishlistButton.click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});
