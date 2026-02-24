export default function Dashboard() {
    return (
        <div>
            <h1 style={{ marginBottom: '0.5rem' }}>Your Wardrobe</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your pieces and start glowing.</p>

            <div style={{
                padding: '4rem 2rem',
                border: '2px dashed var(--accent-purple)',
                borderRadius: 'var(--border-radius-lg)',
                backgroundColor: 'rgba(155, 143, 214, 0.05)',
                textAlign: 'center'
            }}>
                <div style={{ color: 'var(--accent-purple)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No items yet</div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add some clothes to your wardrobe to get started.</p>
                <button className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>+ Add Item</button>
            </div>
        </div>
    )
}
