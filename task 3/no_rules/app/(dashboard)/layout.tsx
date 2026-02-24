import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-headline)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        Drip
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>{user.email}</span>
                        <form action={signOutAction}>
                            <button className="btn" style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>Sign out</button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
                {children}
            </main>
        </div>
    )
}
