import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const UpdatePassword = () => {
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

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validation = validatePassword(password);
        if (validation.length > 0) {
            setPwdErrors(validation);
            return;
        }

        setLoading(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password: password
        });

        setLoading(false);

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Update Password</h2>
                <p className="subtitle">Enter your new password</p>

                {error && (
                    <div className="alert-error">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="alert-success">
                        <CheckCircle2 size={18} />
                        <span>Password updated successfully! Redirecting...</span>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
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
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};
