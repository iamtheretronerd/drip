import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/lib/actions/auth';

export default async function DashboardPage() {
    const supabase = await createClient();

    if (!supabase) {
        return (
            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDF8F0' }}>
                <p style={{ color: '#D94242', fontFamily: 'Inter, sans-serif' }}>Supabase not configured in .env.local</p>
            </main>
        );
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FDF8F0',
            fontFamily: 'Inter, sans-serif',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h1 style={{
                fontFamily: 'Cooper Black, Georgia, serif',
                fontSize: '4.5rem',
                color: '#1A1A1A',
                margin: 0,
                letterSpacing: '-2px'
            }}>
                Dashboard
            </h1>
            <p style={{
                color: '#4A5C3E',
                fontWeight: '700',
                fontSize: '1.4rem',
                marginTop: '1rem',
                letterSpacing: '0.02em'
            }}>
                youve successfully logged in
            </p>

            <form action={logout} style={{ marginTop: '2.5rem' }}>
                <button
                    type="submit"
                    style={{
                        background: '#9B8FD6',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '1rem 2.5rem',
                        fontSize: '1rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 8px 24px rgba(155, 143, 214, 0.3)',
                    }}
                >
                    Log Out
                </button>
            </form>
        </main>
    );
}
