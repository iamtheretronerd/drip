import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useFormState, useFormStatus } from 'react-dom';

// Mock React DOM hooks
vi.mock('react-dom', () => ({
    useFormState: vi.fn(),
    useFormStatus: vi.fn(),
}));

// Mock Server Actions
vi.mock('@/lib/actions/auth', () => ({
    loginAction: vi.fn(),
}));

describe('LoginForm Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock setup: no error, not pending
        (useFormState as any).mockReturnValue([{ error: null }, vi.fn()]);
        (useFormStatus as any).mockReturnValue({ pending: false });
    });

    it('should render the login form when mounted', () => {
        // Arrange
        render(<LoginForm />);

        // Act & Assert
        expect(screen.getByLabelText(/Email/i)).toBeDefined();
        expect(screen.getByLabelText(/Password/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeDefined();
    });

    it('should display error message when login fails with invalid credentials', () => {
        // Arrange
        (useFormState as any).mockReturnValue([{ error: 'Invalid email or password' }, vi.fn()]);
        render(<LoginForm />);

        // Act & Assert
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeDefined();
        expect(errorMessage.textContent).toBe('Invalid email or password');
    });

    it('should transition to loading state when form is submitted', () => {
        // Arrange
        (useFormStatus as any).mockReturnValue({ pending: true });
        render(<LoginForm />);

        // Act & Assert
        const button = screen.getByRole('button');
        expect(button.textContent).toBe('Signing in...');
        expect(button.hasAttribute('disabled')).toBe(true);
    });
});
