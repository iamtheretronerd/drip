import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from '@/components/auth/LoginForm';
import styles from '@/components/auth/auth.module.css';

export default async function LoginPage() {
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
          <LoginForm />
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Already logged in — middleware handles this too, but belt-and-suspenders
  if (user) redirect('/');

  return <LoginForm />;
}
