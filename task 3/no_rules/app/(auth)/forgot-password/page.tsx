'use client'

import Link from 'next/link'
import { useFormState } from 'react-dom'
import { forgotPasswordAction } from '@/app/actions/auth'
import { SubmitButton } from '@/components/auth/submit-button'

export default function ForgotPassword() {
    const [state, formAction] = useFormState(forgotPasswordAction, null)

    return (
        <div className="auth-card">
            <h1 className="auth-title">Forgot password.</h1>
            <p className="auth-subtitle">We'll email a link to reset your password.</p>

            {state?.error && (
                <div className="form-alert-error" role="alert">
                    {state.error}
                </div>
            )}

            {state?.success ? (
                <div style={{ padding: '1.5rem', backgroundColor: '#ECFDF5', color: '#065F46', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid #A7F3D0' }}>
                    {state.success}
                    <div style={{ marginTop: '1rem' }}>
                        <Link href="/login" style={{ fontWeight: 600, color: '#047857' }}>Return to login</Link>
                    </div>
                </div>
            ) : (
                <form action={formAction}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: '2rem' }}>
                        <SubmitButton pendingText="Sending...">Send reset link</SubmitButton>
                    </div>
                </form>
            )}

            {!state?.success && (
                <div className="form-footer">
                    Remembered your password? <Link href="/login">Log in</Link>
                </div>
            )}
        </div>
    )
}
