import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { session } = useAuth();

    // If already authenticated, redirect
    if (session) {
        return <Navigate to="/dashboard" replace />;
    }

    const validatePassword = (pwd: string) => {
        const minLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        return minLength && hasUpper && hasLower && hasNumber;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number.');
            return;
        }

        setIsLoading(true);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (signUpError) throw signUpError;

            // Note: Depending on Supabase config, this might require email confirmation.
            // If auto-confirm is enabled, they will be logged in immediately.
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Create Account</h2>
            {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleRegister}>
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
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '4px' }}>Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                    <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                        Min. 8 chars, 1 uppercase, 1 lowercase, 1 number.
                    </small>
                </div>
                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#F7E24A', color: '#1A1A1A', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isLoading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.9em' }}>
                Already have an account? <Link to="/login">Log in</Link>
            </div>
        </div>
    );
}
