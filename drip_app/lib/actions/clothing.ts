'use server';

import { revalidatePath } from 'next/cache';
import { createActionClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ActionResult } from '@/types';
import type { ClothingAnalysis } from '@/components/clothing/ClothingAnalysisModal';

export async function deleteClothingItem(
    itemId: string,
    photoUrl: string
): Promise<ActionResult> {
    const supabase = await createActionClient();
    const serviceClient = createServiceClient();

    if (!supabase || !serviceClient) return { success: false, error: 'Supabase not configured' };

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'Not authenticated' };

    // 1. Delete image from Storage using ServiceClient (so RLS doesn't block path access)
    // The 'publicUrl' format is roughly: .../storage/v1/object/public/wardrobe-raw/user_id/1234.jpg
    // We need to extract just "user_id/1234.jpg"
    try {
        const urlParts = new URL(photoUrl);
        const pathParts = urlParts.pathname.split('/wardrobe-raw/');
        if (pathParts.length > 1) {
            const storagePath = pathParts[1];
            const { error: storageError } = await serviceClient.storage
                .from('wardrobe-raw')
                .remove([storagePath]);

            if (storageError) {
                console.error('Failed to delete storage image:', storageError);
            }
        }
    } catch (err) {
        console.error('Failed to parse storage URL:', err);
    }

    // 2. Delete item from Database
    const { error: dbError } = await (serviceClient.from('clothing_items') as any)
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

    if (dbError) return { success: false, error: dbError.message };

    revalidatePath('/wardrobe');
    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return { success: true };
}

export async function updateClothingItem(
    itemId: string,
    analysis: Partial<ClothingAnalysis>
): Promise<ActionResult> {
    const supabase = await createActionClient();
    const serviceClient = createServiceClient();

    if (!supabase || !serviceClient) return { success: false, error: 'Supabase not configured' };

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: 'Not authenticated' };

    const { error: updateError } = await (serviceClient.from('clothing_items') as any)
        .update({
            ...analysis,
            sub_type: analysis.sub_type || null,
            secondary_color: analysis.secondary_color || null,
            material: analysis.material || null,
        })
        .eq('id', itemId)
        .eq('user_id', user.id);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath('/wardrobe');
    revalidatePath('/dashboard');
    revalidatePath('/onboarding');

    return { success: true };
}
