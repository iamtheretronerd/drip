import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [pwdErrors, setPwdErrors] = useState<string[]>([]);
    const navigate = useNavigate();

    const validatePassword = (pwd: string) => {
        const errors = [];
        if (pwd.length < 8) errors.push('Minimum 8 characters');
        if (!/[A-Z]/.test(pwd)) errors.push('At least one uppercase letter');
        if (!/[a-z]/.test(pwd)) errors.push('At least one lowercase letter');
        if (!/[0-9]/.test(pwd)) errors.push('At least one number');
        return errors;
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pwd = e.target.value;
        setPassword(pwd);
        if (pwd.length > 0) {
            setPwdErrors(validatePassword(pwd));
        } else {
            setPwdErrors([]);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validation = validatePassword(password);
        if (validation.length > 0) {
            setPwdErrors(validation);
            return;
        }

        setLoading(true);
        const { data, error: registerError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/dashboard`
            }
        });

        setLoading(false);

        if (registerError) {
            setError(registerError.message);
        } else {
            setSuccess(true);
            // Wait a bit before redirecting, but user might need to confirm email based on supabase config.
            if (data?.session) {
                navigate('/dashboard');
            }
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Create an Account</h2>
                <p className="subtitle">Join Drip to manage your wardrobe smartly.</p>

                {error && (
                    <div className="alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && !error && (
                    <div className="alert-success">
                        <CheckCircle2 size={18} />
                        <span>Registration successful! Please check your email to confirm your account if required, or you can now sign in.</span>
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={handlePasswordChange}
                            required
                            placeholder="••••••••"
                        />
                        {pwdErrors.length > 0 && (
                            <ul style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem', paddingLeft: '1.2rem' }}>
                                {pwdErrors.map((err, i) => (
                                    <li key={i} style={{ color: 'var(--error-color)' }}>{err}</li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading || pwdErrors.length > 0}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign Up'}
                    </button>
                </form>

                <p className="auth-links">
                    Already have an account? <Link to="/login">Log in here</Link>
                </p>
            </div>
        </div>
    );
};
