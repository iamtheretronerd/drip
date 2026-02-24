'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { login } from '@/lib/actions/auth'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button type="submit" className="btn btn-primary btn-full" disabled={pending}>
            {pending ? 'Logging in...' : 'Sign In'}
        </button>
    )
}

export function LoginForm() {
    const [state, formAction] = useFormState(login, null)

    return (
        <form action={formAction}>
            {state?.error && (
                <div className="alert-error" role="alert">
                    {state.error}
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
                    aria-invalid={false}
                />
            </div>

            <div className="form-group">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="form-input"
                    placeholder="Enter your password"
                    aria-invalid={!!state?.error}
                />
            </div>

            <SubmitButton />
        </form>
    )
}
