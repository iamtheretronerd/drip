import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { session } = useAuth();

    useEffect(() => {
        // Listen for the hash fragment containing the recovery token
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
            // Supabase automatically parses and handles the session
        }
    }, []);

    const validatePassword = (pwd: string) => {
        const minLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /\d/.test(pwd);
        return minLength && hasUpper && hasLower && hasNumber;
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!validatePassword(password)) {
            setError('Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number.');
            return;
        }

        setIsLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 3000);
        } catch (err: any) {
            setError(err.message || 'An error occurred while updating the password.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!session) {
        return <div style={{ textAlign: 'center', marginTop: '40px' }}>Waiting for authentication token...</div>;
    }

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Enter New Password</h2>
            {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: '16px' }}>Password updated successfully! Redirecting...</div>}

            <form onSubmit={handleUpdatePassword}>
                <div style={{ marginBottom: '16px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '4px' }}>New Password</label>
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
                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#3B4B9E', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    {isLoading ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
