'use server';

import { revalidatePath } from 'next/cache';
import { createActionClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import type { ActionResult } from '@/types';

interface Step1Data {
  lifestyle: string;
  weather_sensitivity: string;
  priority: string;
}

interface Step2Data {
  lat: number;
  lon: number;
  city_name: string;
}

// Internal helper to ensure the user has a profile record before updating it
async function ensureProfile(user: any) {
  const serviceClient = createServiceClient();
  if (!serviceClient) return;

  const { data, error } = await (serviceClient.from('profiles') as any)
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!data && !error) {
    // missing profile
    await (serviceClient.from('profiles') as any).insert({
      id: user.id,
      email: user.email || 'unknown@example.com',
      full_name: user.user_metadata?.full_name || 'User',
      onboarding_completed: false
    });
  }
}

export async function saveStep1(data: Step1Data): Promise<ActionResult> {
  const supabase = await createActionClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: 'Not authenticated' };

  await ensureProfile(user);

  const { error } = await (supabase.from('profiles') as any)
    .update({
      lifestyle: data.lifestyle,
      weather_sensitivity: data.weather_sensitivity,
      priority: data.priority,
    })
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/onboarding');
  return { success: true };
}

export async function saveStep2(data: Step2Data): Promise<ActionResult> {
  const supabase = await createActionClient();
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: 'Not authenticated' };

  await ensureProfile(user);

  const { error } = await (supabase.from('profiles') as any)
    .update({
      lat: data.lat,
      lon: data.lon,
      city_name: data.city_name,
    })
    .eq('id', user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath('/onboarding');
  return { success: true };
}

export async function uploadClothingItem(
  formData: FormData
): Promise<ActionResult<{ id: string; url: string }>> {
  const supabase = await createActionClient();
  const serviceClient = createServiceClient();

  if (!supabase) return { success: false, error: 'Supabase not configured' };
  if (!serviceClient) return { success: false, error: 'Service client not configured' };

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: 'Not authenticated' };

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: 'No file provided' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${user.id}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('wardrobe-raw')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) return { success: false, error: 'Storage: ' + uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from('wardrobe-raw').getPublicUrl(filePath);

  const { data: item, error: dbError } = await (serviceClient.from('clothing_items') as any)
    .insert({
      user_id: user.id,
      photo_url: publicUrl,
      status: 'pending_analysis',
      is_onboarding_item: true,
    })
    .select('id')
    .single();

  if (dbError) return { success: false, error: 'Database: ' + dbError.message };

  revalidatePath('/onboarding');
  return { success: true, data: { id: (item as any).id, url: publicUrl } };
}

export async function updateClothingItemAnalysis(
  itemId: string,
  analysis: any
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
      status: 'analyzed',
    })
    .eq('id', itemId)
    .eq('user_id', user.id);

  if (updateError) return { success: false, error: updateError.message };

  revalidatePath('/onboarding');
  return { success: true };
}

export async function completeOnboarding(): Promise<ActionResult> {
  const supabase = await createActionClient();
  const serviceClient = createServiceClient();

  if (!supabase) return { success: false, error: 'Supabase not configured' };

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { success: false, error: 'Not authenticated' };

  await ensureProfile(user);

  if (serviceClient) {
    // Safely delete any existing responses to avoid duplicates (no UNIQUE constraint!)
    await (serviceClient.from('onboarding_responses') as any)
      .delete()
      .eq('user_id', user.id);

    // Re-insert responses (they were mainly stored in profiles anyway, but as a scaffold)
    await (serviceClient.from('onboarding_responses') as any)
      .insert({ user_id: user.id });

    // Mark completed via ServiceClient to guarantee 100% success bypass
    const { error: serviceError } = await (serviceClient.from('profiles') as any)
      .update({ onboarding_completed: true })
      .eq('id', user.id);

    if (serviceError) {
      return { success: false, error: 'Failed to update profile completion: ' + serviceError.message };
    }
  }

  // Backup RPC
  await supabase.rpc('complete_onboarding');

  revalidatePath('/');
  revalidatePath('/dashboard');
  return { success: true };
}
