import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Dashboard = () => {
    const { user, signOut } = useAuth();

    return (
        <div className="dashboard-container">
            <nav className="navbar">
                <h1>Drip Wardrobe</h1>
                <button className="btn-secondary" onClick={signOut} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LogOut size={16} />
                    Sign Out
                </button>
            </nav>

            <main>
                <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--input-border)' }}>
                    <h2 style={{ marginBottom: '1rem' }}>Welcome to your Wardrobe!</h2>
                    <p style={{ color: 'var(--text-muted)' }}>You are logged in as: <strong>{user?.email}</strong></p>
                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <p>Your closet features will appear here.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};
