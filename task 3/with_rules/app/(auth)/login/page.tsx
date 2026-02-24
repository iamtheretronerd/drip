import { LoginForm } from '@/components/auth/LoginForm'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="auth-card">
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Welcome Back</h2>
            <LoginForm />
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                Don't have an account?{' '}
                <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    Sign up
                </Link>
            </p>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <Link href="/reset-password" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    Forgot your password?
                </Link>
            </div>
        </div>
    )
}
