import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.redirect(`${origin}/login?error=supabase_not_configured`);
        }
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Redirect to the intended destination (onboarding, dashboard, etc.)
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Auth failed — redirect back to login with an error indicator
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
