import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Service role client for server actions that need to bypass RLS.
 * Only use this after manually verifying authentication via getUser().
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
