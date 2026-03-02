import { describe, it, expect } from 'vitest';
import {
    SignUpSchema,
    LoginSchema,
    ResetPasswordSchema,
} from '@/lib/validations/auth';

// ─── SignUpSchema ─────────────────────────────────────────────────────────────
describe('SignUpSchema', () => {
    it('should pass with valid input', () => {
        const result = SignUpSchema.safeParse({
            fullName: 'Alex Smith',
            email: 'alex@example.com',
            password: 'Password1',
        });
        expect(result.success).toBe(true);
    });

    it('should fail when fullName is empty', () => {
        const result = SignUpSchema.safeParse({
            fullName: '',
            email: 'alex@example.com',
            password: 'Password1',
        });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors.fullName?.[0]).toBe(
            'Full name is required',
        );
    });

    it('should fail with invalid email', () => {
        const result = SignUpSchema.safeParse({
            fullName: 'Alex',
            email: 'not-an-email',
            password: 'Password1',
        });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors.email?.[0]).toBe(
            'Please enter a valid email address',
        );
    });

    it('should fail when password is too short', () => {
        const result = SignUpSchema.safeParse({
            fullName: 'Alex',
            email: 'alex@example.com',
            password: 'Pa1',
        });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors.password?.[0]).toBe(
            'Password must be at least 8 characters',
        );
    });

    it('should fail when password has no uppercase', () => {
        const result = SignUpSchema.safeParse({
            fullName: 'Alex',
            email: 'alex@example.com',
            password: 'password1',
        });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors.password).toContain(
            'Password must contain at least one uppercase letter',
        );
    });

    it('should fail when password has no lowercase', () => {
        const result = SignUpSchema.safeParse({
            fullName: 'Alex',
            email: 'alex@example.com',
            password: 'PASSWORD1',
        });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors.password).toContain(
            'Password must contain at least one lowercase letter',
        );
    });

    it('should fail when password has no number', () => {
        const result = SignUpSchema.safeParse({
            fullName: 'Alex',
            email: 'alex@example.com',
            password: 'PasswordOnly',
        });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors.password).toContain(
            'Password must contain at least one number',
        );
    });
});

// ─── LoginSchema ──────────────────────────────────────────────────────────────
describe('LoginSchema', () => {
    it('should pass with valid credentials', () => {
        const result = LoginSchema.safeParse({
            email: 'alex@example.com',
            password: 'any-password',
        });
        expect(result.success).toBe(true);
    });

    it('should fail with empty password', () => {
        const result = LoginSchema.safeParse({
            email: 'alex@example.com',
            password: '',
        });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors.password?.[0]).toBe(
            'Password is required',
        );
    });

    it('should fail with invalid email', () => {
        const result = LoginSchema.safeParse({
            email: 'bad',
            password: 'somepassword',
        });
        expect(result.success).toBe(false);
    });
});

// ─── ResetPasswordSchema ──────────────────────────────────────────────────────
describe('ResetPasswordSchema', () => {
    it('should pass with valid email', () => {
        const result = ResetPasswordSchema.safeParse({ email: 'user@drip.app' });
        expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
        const result = ResetPasswordSchema.safeParse({ email: 'not-valid' });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors.email?.[0]).toBe(
            'Please enter a valid email address',
        );
    });
});
