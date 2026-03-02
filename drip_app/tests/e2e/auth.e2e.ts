import { test, expect } from '@playwright/test';

// NOTE: These tests require a real Supabase project connected via .env.local
// For CI, set PLAYWRIGHT_BASE_URL and use a test Supabase project

test.describe('Authentication Flows', () => {
    // ─── Unauthenticated redirect ────────────────────────────────────────────
    test('should redirect unauthenticated users from dashboard to /login', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/login/);
    });

    // ─── Sign Up ──────────────────────────────────────────────────────────────
    test('should show validation errors on signup with weak password', async ({ page }) => {
        await page.goto('/signup');
        await page.fill('#fullName', 'Test User');
        await page.fill('#email', 'testuser@drip.app');
        await page.fill('#password', 'weak');
        await page.click('button[type="submit"]');

        // Expect inline password error
        await expect(page.getByRole('alert').first()).toBeVisible();
    });

    // ─── Login ────────────────────────────────────────────────────────────────
    test('should show error on invalid credentials', async ({ page }) => {
        await page.goto('/login');
        await page.fill('#email', 'nobody@drip.app');
        await page.fill('#password', 'WrongPass1');
        await page.click('button[type="submit"]');

        await expect(
            page.getByText('Invalid email or password'),
        ).toBeVisible({ timeout: 8000 });
    });

    // ─── Auth route redirect ──────────────────────────────────────────────────
    test('should display login page at /login', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByText('drip.')).toBeVisible();
    });

    test('should display signup page at /signup', async ({ page }) => {
        await page.goto('/signup');
        await expect(page.getByLabel('Full Name')).toBeVisible();
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
    });

    test('should display reset password page at /reset-password', async ({ page }) => {
        await page.goto('/reset-password');
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    });

    // ─── Reset password success state ─────────────────────────────────────────
    test('should show success state after submitting reset password email', async ({ page }) => {
        await page.goto('/reset-password');
        await page.fill('#email', 'anyone@drip.app');
        await page.click('button[type="submit"]');

        // Always shows success message (to prevent email enumeration)
        await expect(page.getByText('Check your inbox')).toBeVisible({ timeout: 8000 });
    });
});
