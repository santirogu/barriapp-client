import { expect, test } from '@playwright/test';

test('login page renders the admin form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText('Panel de administración')).toBeVisible();
  await expect(page.getByPlaceholder('+57 300 123 4567')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
});

test('unauthenticated root redirects to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login$/);
});
