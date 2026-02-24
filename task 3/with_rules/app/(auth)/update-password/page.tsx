import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm'

export default function UpdatePasswordPage() {
    return (
        <div className="auth-card">
            <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Set New Password</h2>
            <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                Please enter your new password below.
            </p>
            <UpdatePasswordForm />
        </div>
    )
}
