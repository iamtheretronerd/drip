'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { resetPassword } from '@/lib/actions/auth';
import type { ActionResult } from '@/types';
import styles from './auth.module.css';

const initialState: ActionResult = { success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.submitButton} disabled={pending} aria-busy={pending}>
            {pending ? 'Sending…' : 'Send Reset Link'}
        </button>
    );
}

export function ResetPasswordForm() {
    const [state, formAction] = useActionState(resetPassword, initialState);

    if (state.success) {
        return (
            <>
                <h2 className={styles.formTitle}>Check your inbox</h2>
                <p className={styles.formSubtitle}>
                    If an account exists for that email, a reset link is on its way.
                </p>
                <div className={styles.successBanner} role="status">
                    Password reset email sent. Check your inbox (and spam folder).
                </div>
                <p className={styles.footerText}>
                    <Link href="/login" className={styles.footerLink}>
                        Back to sign in
                    </Link>
                </p>
            </>
        );
    }

    return (
        <>
            <h2 className={styles.formTitle}>Reset password</h2>
            <p className={styles.formSubtitle}>
                We&apos;ll send a reset link to your email
            </p>

            {state.error && (
                <div className={styles.errorBanner} role="alert">
                    {state.error}
                </div>
            )}

            <form action={formAction} className={styles.form} noValidate>
                <div className={styles.fieldGroup}>
                    <label htmlFor="email" className={styles.label}>
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={`${styles.input} ${state.fieldErrors?.email ? styles.inputError : ''}`}
                        aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
                    />
                    {state.fieldErrors?.email && (
                        <p id="email-error" className={styles.fieldError} role="alert">
                            {state.fieldErrors.email}
                        </p>
                    )}
                </div>

                <SubmitButton />
            </form>

            <p className={styles.footerText}>
                Remembered it?{' '}
                <Link href="/login" className={styles.footerLink}>
                    Back to sign in
                </Link>
            </p>
        </>
    );
}
