import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignUpForm } from '@/components/auth/SignUpForm';
import styles from '@/components/auth/auth.module.css';

export default async function SignUpPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className={styles.configError}>
        <h3>Configuration Required</h3>
        <p>
          Please add your <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code> to enable authentication.
        </p>
        <div className={styles.configErrorForm}>
          <SignUpForm />
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect('/');

  return <SignUpForm />;
}
