import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignUpForm } from '@/components/auth/SignUpForm';

export default async function SignUpPage() {
    const supabase = await createClient();

    if (!supabase) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#FDF8F0', borderRadius: '12px' }}>
                <h3 style={{ color: '#D94242' }}>Configuration Required</h3>
                <p style={{ color: '#6B6B6B', marginTop: '0.5rem' }}>
                    Please add your <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> to enable authentication.
                </p>
                <div style={{ marginTop: '1.5rem', opacity: 0.5 }}>
                    <SignUpForm />
                </div>
            </div>
        );
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) redirect('/');

    return <SignUpForm />;
}
