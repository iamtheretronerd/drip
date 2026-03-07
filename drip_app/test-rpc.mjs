import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseKey) {
  console.log('No keys');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Testing RPC existence...');
  const { data, error } = await supabase.rpc('is_onboarding_completed');
  console.log('is_onboarding_completed -> data:', data, 'error:', error);
}

main();
