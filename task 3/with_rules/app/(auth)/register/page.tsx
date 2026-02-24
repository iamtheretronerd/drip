import { RegisterForm } from '@/components/auth/RegisterForm'
import Link from 'next/link'

export default function RegisterPage() {
    return (
        <div className="auth-card">
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Let's get dressed</h2>
            <RegisterForm />
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    Log in
                </Link>
            </p>
        </div>
    )
}
