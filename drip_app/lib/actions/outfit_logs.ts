'use server';

import { revalidatePath } from 'next/cache';
import { createActionClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ActionResult } from '@/types';
import type { WeatherSnapshot } from '@/types/database';

export async function logOutfit(
    itemIds: string[],
    weather: WeatherSnapshot | null,
    mood: string | null,
    wasModified: boolean,
    customDate?: string // YYYY-MM-DD
): Promise<ActionResult> {
    const supabase = await createActionClient();
    const serviceClient = createServiceClient();

    if (!supabase || !serviceClient) return { success: false, error: 'Supabase not configured' };

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'Not authenticated' };

    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const targetDate = customDate || todayStr;
        const targetDateTime = customDate ? `${customDate}T12:00:00Z` : new Date().toISOString();

        // 1. Create or Update the Outfit Log for today
        const { error: logError } = await (serviceClient.from('outfit_logs') as any)
            .upsert({
                user_id: user.id,
                date: targetDate,
                item_ids: itemIds,
                mood_input: mood,
                weather_snapshot: weather,
                was_modified: wasModified
            }, {
                onConflict: 'user_id,date'
            });

        if (logError) throw logError;

        // 2. Update each clothing item's stats
        // We'll fetch them first to get current stats for incremental updates
        const { data: items, error: fetchError } = await (serviceClient.from('clothing_items') as any)
            .select('id, last_worn, times_worn, consecutive_days_worn')
            .in('id', itemIds);

        if (fetchError) throw fetchError;

        const updatePromises = items.map(async (item: any) => {
            const lastWornDate = item.last_worn ? new Date(item.last_worn).toISOString().split('T')[0] : null;
            const currentTargetDate = new Date(targetDate);
            const targetYesterday = new Date(currentTargetDate);
            targetYesterday.setDate(targetYesterday.getDate() - 1);
            const yesterdayStr = targetYesterday.toISOString().split('T')[0];

            let newConsecutive = 1;
            if (lastWornDate === yesterdayStr) {
                newConsecutive = (item.consecutive_days_worn || 0) + 1;
            } else if (lastWornDate === targetDate) {
                // If they already logged it on this date, don't double count stats
                newConsecutive = item.consecutive_days_worn || 1;
            }

            return (serviceClient
                .from('clothing_items') as any)
                .update({
                    last_worn: targetDateTime,
                    times_worn: (item.times_worn || 0) + 1,
                    consecutive_days_worn: newConsecutive
                })
                .eq('id', item.id);
        });

        await Promise.all(updatePromises);

        revalidatePath('/dashboard');
        revalidatePath('/history');
        revalidatePath('/wardrobe');

        return { success: true };
    } catch (err: any) {
        console.error('Failed to log outfit:', err);
        return { success: false, error: err.message || 'Failed to log outfit' };
    }
}

export async function unlogOutfit(): Promise<ActionResult> {
    const supabase = await createActionClient();
    const serviceClient = createServiceClient();

    if (!supabase || !serviceClient) return { success: false, error: 'Supabase not configured' };

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'Not authenticated' };

    try {
        const today = new Date().toISOString().split('T')[0];

        // 1. Find the latest log for today
        const { data: log, error: logError } = await (serviceClient.from('outfit_logs') as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('date', today)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (logError || !log) return { success: false, error: 'No log found for today' };

        // 2. Delete it
        const { error: deleteError } = await (serviceClient.from('outfit_logs') as any)
            .delete()
            .eq('id', log.id);

        if (deleteError) throw deleteError;

        // 3. Revert item increments (approximate)
        const { data: items } = await (serviceClient.from('clothing_items') as any)
            .select('id, times_worn')
            .in('id', log.item_ids);

        if (items) {
            const updatePromises = items.map(async (item: any) => {
                return (serviceClient.from('clothing_items') as any)
                    .update({
                        times_worn: Math.max(0, (item.times_worn || 1) - 1)
                    })
                    .eq('id', item.id);
            });
            await Promise.all(updatePromises);
        }

        revalidatePath('/dashboard');
        revalidatePath('/history');
        revalidatePath('/wardrobe');

        return { success: true };
    } catch (err: any) {
        console.error('Failed to unlog outfit:', err);
        return { success: false, error: err.message || 'Failed to unlog' };
    }
}
