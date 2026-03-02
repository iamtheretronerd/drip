'use client';

import { createClient } from '@/lib/supabase/client';
import styles from './auth.module.css';

export function SocialAuthButtons() {
    const handleGoogleSignIn = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    prompt: 'select_account',
                },
            },
        });
    };

    return (
        <div style={{ width: '100%' }}>
            <div className={styles.divider}>OR</div>
            <button
                type="button"
                className={styles.googleButton}
                onClick={handleGoogleSignIn}
            >
                <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className={styles.googleIcon}
                />
                Continue with Google
            </button>
        </div>
    );
}
