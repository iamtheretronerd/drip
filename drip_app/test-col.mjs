import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.log('No keys');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Testing column existence by updating a fake user...');
    const { data, error } = await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', '00000000-0000-0000-0000-000000000000');
    console.log('update -> data:', data, 'error:', error);

    const { data: rpcData, error: rpcError } = await supabase.rpc('is_onboarding_completed');
    console.log('rpc -> data:', rpcData, 'error:', rpcError);
}

main();
