'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { signup } from '@/lib/actions/auth'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button type="submit" className="btn btn-primary btn-full" disabled={pending}>
            {pending ? 'Creating Account...' : 'Sign Up'}
        </button>
    )
}

export function RegisterForm() {
    const [state, formAction] = useFormState(signup, null)
    const [password, setPassword] = useState('')

    // Validation rules pattern check
    const rules = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    }

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
                    placeholder="create@example.com"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters with numbers & mixed case"
                />
                <div style={{ marginTop: '8px' }}>
                    <div className="validation-hint" data-valid={rules.length}>
                        {rules.length ? '✓' : '○'} At least 8 characters
                    </div>
                    <div className="validation-hint" data-valid={rules.uppercase}>
                        {rules.uppercase ? '✓' : '○'} One uppercase letter
                    </div>
                    <div className="validation-hint" data-valid={rules.lowercase}>
                        {rules.lowercase ? '✓' : '○'} One lowercase letter
                    </div>
                    <div className="validation-hint" data-valid={rules.number}>
                        {rules.number ? '✓' : '○'} One number
                    </div>
                </div>
            </div>

            <SubmitButton />
        </form>
    )
}
