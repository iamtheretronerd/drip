import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import Link from 'next/link'

export default function ResetPasswordPage() {
    return (
        <div className="auth-card">
            <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Reset Password</h2>
            <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Enter your email address and we'll send you a link to reset your password.
            </p>
            <ResetPasswordForm />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link href="/login" style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>
                    Back to Login
                </Link>
            </div>
        </div>
    )
}
