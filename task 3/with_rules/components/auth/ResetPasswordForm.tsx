'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { resetPassword } from '@/lib/actions/auth'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button type="submit" className="btn btn-primary btn-full" disabled={pending}>
            {pending ? 'Sending...' : 'Send Reset Link'}
        </button>
    )
}

export function ResetPasswordForm() {
    const [state, formAction] = useFormState(resetPassword, null)

    return (
        <form action={formAction}>
            {state?.error && (
                <div className="alert-error" role="alert">
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="alert-error" role="alert" style={{ backgroundColor: 'rgba(74, 92, 62, 0.1)', color: '#4A5C3E', borderColor: '#4A5C3E' }}>
                    {state.success}
                </div>
            )}

            <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="you@example.com"
                />
            </div>

            <SubmitButton />
        </form>
    )
}
