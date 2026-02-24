'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ children, pendingText, disabled }: { children: React.ReactNode, pendingText: string, disabled?: boolean }) {
    const { pending } = useFormStatus()
    return (
        <button type="submit" className="btn btn-primary" disabled={pending || disabled} aria-disabled={pending || disabled}>
            {pending ? <span className="spinner" /> : null}
            {pending ? pendingText : children}
        </button>
    )
}
