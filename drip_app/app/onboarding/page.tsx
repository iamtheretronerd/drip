import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Configuration Required</h2>
        <p>Please add your Supabase credentials to enable onboarding.</p>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if already onboarded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('profiles') as any)
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((profile as any)?.onboarding_completed) {
    redirect('/dashboard');
  }

  return <OnboardingFlow />;
}
