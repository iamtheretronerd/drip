'use client'

import Link from 'next/link'
import { useFormState } from 'react-dom'
import { loginAction } from '@/app/actions/auth'
import { SubmitButton } from '@/components/auth/submit-button'

export default function Login() {
    const [state, formAction] = useFormState(loginAction, null)

    return (
        <div className="auth-card">
            <h1 className="auth-title">Welcome back.</h1>
            <p className="auth-subtitle">Log in to manage your wardrobe.</p>

            {state?.error && (
                <div className="form-alert-error" role="alert">
                    {state.error}
                </div>
            )}

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

                <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-input"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <div className="form-group" style={{ marginTop: '2rem' }}>
                    <SubmitButton pendingText="Logging in...">Log in</SubmitButton>
                </div>
            </form>

            <div className="form-footer">
                Don&apos;t have an account? <Link href="/register">Sign up</Link>
            </div>
        </div>
    )
}
