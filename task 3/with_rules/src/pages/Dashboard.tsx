import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
    const { user, signOut } = useAuth();

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1>Dashboard</h1>
                <button
                    onClick={signOut}
                    style={{ padding: '8px 16px', backgroundColor: '#D94242', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Sign Out
                </button>
            </header>

            <main>
                <h3>Welcome, {user?.email}!</h3>
                <p>This is a protected route. Only authenticated users can see this page.</p>

                <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h4>Your Wardrobe Data (Example RLS Protected Area)</h4>
                    <p>
                        Your ID: <code>{user?.id}</code>
                    </p>
                </div>
            </main>
        </div>
    );
}
