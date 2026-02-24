'use client'

import { useState } from 'react'
import { useFormState } from 'react-dom'
import { resetPasswordAction } from '@/app/actions/auth'
import { SubmitButton } from '@/components/auth/submit-button'

export default function ResetPassword() {
    const [state, formAction] = useFormState(resetPasswordAction, null)
    const [password, setPassword] = useState('')

    const hasLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    const isValid = hasLength && hasUpper && hasLower && hasNumber

    return (
        <div className="auth-card">
            <h1 className="auth-title">Reset password.</h1>
            <p className="auth-subtitle">Enter a new secure password.</p>

            {state?.error && (
                <div className="form-alert-error" role="alert">
                    {state.error}
                </div>
            )}

            <form action={formAction}>
                <div className="form-group">
                    <label className="form-label" htmlFor="password">New Password</label>
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
                    <SubmitButton pendingText="Updating..." disabled={!isValid}>Update password</SubmitButton>
                </div>
            </form>
        </div>
    )
}
