import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WardrobeView } from '@/components/wardrobe/WardrobeView';
import type { ClothingItem } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function WardrobePage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#f55' }}>
        <p>Supabase not configured in .env.local</p>
      </main>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch clothing items and profile in parallel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [itemsRes, profileRes] = await Promise.all([
    (supabase.from('clothing_items') as any)
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'analyzed')
      .order('created_at', { ascending: false }),
    (supabase.from('profiles') as any)
      .select('*')
      .eq('id', user.id)
      .single()
  ]);

  const clothingItems = (itemsRes.data ?? []) as ClothingItem[];
  const profile = profileRes.data;

  if (!profile) redirect('/onboarding');

  return <WardrobeView clothingItems={clothingItems} profile={profile} />;
}
