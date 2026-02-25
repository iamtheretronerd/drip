import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../app/(auth)/login/page';
import '@testing-library/jest-dom';

// Note: Generic test generated without rules
describe('Login Page', () => {
    it('renders login form', () => {
        render(<Login />);

        expect(screen.getByText('Welcome back.')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it('submits the form', () => {
        render(<Login />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        // Assert submission side effects here
    });
});
