import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div>
            <h2 style={{ color: 'var(--color-primary)' }}>Your Wardrobe Calendar</h2>
            <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)' }}>
                Welcome back, {user?.email}! This is your protected dashboard.
            </p>

            <div style={{
                marginTop: '32px',
                padding: '24px',
                borderRadius: 'var(--shape-radius)',
                backgroundColor: 'var(--color-bg)',
                boxShadow: 'var(--shadow-soft)',
                border: '1px solid rgba(0,0,0,0.05)'
            }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Dashboard Overview</h3>
                <p>Your wardrobe items will appear here.</p>

                <div style={{ marginTop: '24px' }}>
                    <button className="btn btn-primary">Add New Item</button>
                </div>
            </div>
        </div>
    )
}
