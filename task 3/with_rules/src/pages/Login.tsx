import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { session } = useAuth();

    // If already authenticated, redirect away from login
    if (session) {
        return <Navigate to="/dashboard" replace />;
    }

    const from = location.state?.from?.pathname || '/dashboard';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Successful login will trigger AuthContext update, but we also navigate
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'An error occurred during login.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Login</h2>
            {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleLogin}>
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
                </div>
                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#9B8FD6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {isLoading ? 'Logging in...' : 'Log In'}
                </button>
            </form>
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9em' }}>
                <Link to="/register">Create an account</Link>
                <Link to="/forgot-password">Forgot password?</Link>
            </div>
        </div>
    );
}
