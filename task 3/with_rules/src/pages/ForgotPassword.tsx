import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'An error occurred while sending the reset email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Reset Password</h2>
            {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '16px' }}>Check your email for the password reset link!</div>}
            <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '4px' }}>Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#3B4B9E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.9em' }}>
                Remember your password? <Link to="/login">Log in</Link>
            </div>
        </div>
    );
}
