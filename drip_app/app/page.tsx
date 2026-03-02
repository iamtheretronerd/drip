import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/lib/actions/auth';

export default async function DashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cooper Black, Georgia, serif', fontSize: '2.5rem' }}>drip.</h1>
        <div style={{ marginTop: '2rem', padding: '2rem', background: '#FDF8F0', borderRadius: '12px', display: 'inline-block' }}>
          <h3 style={{ color: '#D94242' }}>Configuration Required</h3>
          <p style={{ color: '#6B6B6B', marginTop: '0.5rem' }}>
            Please add your Supabase credentials to <code>.env.local</code>.
          </p>
        </div>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return (
    <main style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ fontFamily: 'Cooper Black, Georgia, serif', fontSize: '2.5rem' }}>
        drip.
      </h1>
      <p style={{ marginTop: '1rem', color: '#6B6B6B' }}>
        Welcome, {user.email}! 👋
      </p>
      <p style={{ marginTop: '0.5rem', color: '#6B6B6B' }}>
        Dashboard coming soon — auth is working ✓
      </p>
      <form action={logout} style={{ marginTop: '2rem' }}>
        <button
          type="submit"
          style={{
            background: '#F7E24A',
            border: 'none',
            borderRadius: '10px',
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sign Out
        </button>
      </form>
    </main>
  );
}
