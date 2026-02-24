'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useFormState } from 'react-dom'
import { registerAction } from '@/app/actions/auth'
import { SubmitButton } from '@/components/auth/submit-button'

export default function Register() {
    const [state, formAction] = useFormState(registerAction, null)
    const [password, setPassword] = useState('')

    const hasLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    const isValid = hasLength && hasUpper && hasLower && hasNumber

    return (
        <div className="auth-card">
            <h1 className="auth-title">Create account.</h1>
            <p className="auth-subtitle">Join us and manage your wardrobe.</p>

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
                        className={`form-input ${password && !isValid ? 'error' : ''}`}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <ul className="password-requirements">
                        <li className={hasLength ? 'req-met' : 'req-pending'}>
                            {hasLength ? '✓' : '○'} At least 8 characters
                        </li>
                        <li className={hasUpper ? 'req-met' : 'req-pending'}>
                            {hasUpper ? '✓' : '○'} One uppercase letter
                        </li>
                        <li className={hasLower ? 'req-met' : 'req-pending'}>
                            {hasLower ? '✓' : '○'} One lowercase letter
                        </li>
                        <li className={hasNumber ? 'req-met' : 'req-pending'}>
                            {hasNumber ? '✓' : '○'} One number
                        </li>
                    </ul>
                </div>

                <div className="form-group" style={{ marginTop: '2rem' }}>
                    <SubmitButton pendingText="Creating account..." disabled={!isValid}>Sign up</SubmitButton>
                </div>
            </form>

            <div className="form-footer">
                Already have an account? <Link href="/login">Log in</Link>
            </div>
        </div>
    )
}
