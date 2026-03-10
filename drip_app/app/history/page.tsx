import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HistoryClient } from './HistoryClient';
import type { ClothingItem, OutfitLog, Profile } from '@/types/database';

export const metadata = {
    title: 'Outfit History | DR!P',
    description: 'Track your wardrobe rotation and daily style history.',
};

export default async function HistoryPage() {
    const supabase = await createClient();
    if (!supabase) return redirect('/login');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect('/login');

    // Fetch everything in parallel
    const [profileRes, itemsRes, logsRes] = await Promise.all([
        (supabase.from('profiles') as any).select('*').eq('id', user.id).single(),
        (supabase.from('clothing_items') as any).select('*').eq('user_id', user.id),
        (supabase.from('outfit_logs') as any)
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })
    ]);

    const profile = profileRes.data as Profile;
    const clothingItems = (itemsRes.data ?? []) as ClothingItem[];
    const outfitLogs = (logsRes.data ?? []) as OutfitLog[];

    if (!profile) return redirect('/onboarding');

    return (
        <HistoryClient
            profile={profile}
            clothingItems={clothingItems}
            outfitLogs={outfitLogs}
        />
    );
}
