import { logout } from '@/lib/actions/auth'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dashboard-layout">
            <header style={{
                padding: '16px 24px',
                backgroundColor: 'var(--color-bg)',
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Drip</h1>
                <form action={logout}>
                    <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                        Sign Out
                    </button>
                </form>
            </header>
            <main className="container" style={{ padding: '40px 24px', flex: 1 }}>
                {children}
            </main>
        </div>
    );
}
