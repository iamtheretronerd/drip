import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        setLoading(false);

        if (resetError) {
            setError(resetError.message);
        } else {
            setSuccess(true);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Reset Password</h2>
                <p className="subtitle">Enter your email and we'll send a reset link</p>

                {error && (
                    <div className="alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert-success">
                        <CheckCircle2 size={18} />
                        <span>Check your email for the password reset link!</span>
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleReset}>
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

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <p className="auth-links">
                    Remembered your password? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
};
