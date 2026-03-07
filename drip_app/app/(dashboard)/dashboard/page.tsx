import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import type { Profile, OutfitLog, ClothingItem } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#141414', color: '#f55' }}>
        <p>Supabase not configured in .env.local</p>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profileData } = await (supabase.from('profiles') as any)
    .select('*')
    .eq('id', user.id)
    .single();

  const profile = profileData as Profile | null;

  // Check onboarding status
  let onboardingCompleted: boolean | undefined | null = profile?.onboarding_completed;

  if (!onboardingCompleted) {
    // Fallback to RPC (bypasses PostgREST schema cache issues if column is very new)
    const { data } = await supabase.rpc('is_onboarding_completed');
    onboardingCompleted = data;
  }

  if (!onboardingCompleted) {
    redirect('/onboarding');
  }

  // Fetch clothing items and recent outfit logs in parallel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clothingRes, logsRes] = await Promise.all([
    (supabase.from('clothing_items') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'analyzed'),
    // outfit_logs table may not exist yet (migration 004)
    (supabase.from('outfit_logs') as any)
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(3)
      .then((res: { data: OutfitLog[] | null }) => res)
      .catch(() => ({ data: null })),
  ]);

  const clothingItems = (clothingRes.data ?? []) as ClothingItem[];
  const recentLogs = (logsRes.data ?? []) as OutfitLog[];

  return (
    <DashboardClient
      profile={profile as Profile}
      clothingItems={clothingItems}
      recentLogs={recentLogs}
    />
  );
}
