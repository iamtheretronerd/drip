import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { UpdatePasswordForm } from '@/components/auth/UpdatePasswordForm';

export default async function UpdatePasswordPage() {
    const supabase = await createClient();

    // If supabase isn't configured, we'll still show the form (it will show a config error on submit)
    // but usually, we want to make sure there's an active session from the reset link.
    if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();

        // If there's no session, they shouldn't be here (reset password link creates a temporary session)
        if (!session) {
            redirect('/login?error=invalid_reset_link');
        }
    }

    return <UpdatePasswordForm />;
}
