'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login } from '@/lib/actions/auth';
import type { ActionResult } from '@/types';
import styles from './auth.module.css';
import { SocialAuthButtons } from './SocialAuthButtons';

const initialState: ActionResult = { success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.submitButton} disabled={pending} aria-busy={pending}>
            {pending ? 'Signing in…' : 'Sign In'}
        </button>
    );
}

export function LoginForm() {
    const [state, formAction] = useActionState(login, initialState);

    return (
        <>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your Drip account</p>

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

                <div className={styles.fieldGroup}>
                    <label htmlFor="password" className={styles.label}>
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className={`${styles.input} ${state.fieldErrors?.password ? styles.inputError : ''}`}
                        aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
                    />
                    {state.fieldErrors?.password && (
                        <p id="password-error" className={styles.fieldError} role="alert">
                            {state.fieldErrors.password}
                        </p>
                    )}
                </div>

                <SubmitButton />
            </form>

            <SocialAuthButtons />

            <p className={styles.footerText}>
                <Link href="/reset-password" className={styles.footerLink}>
                    Forgot your password?
                </Link>
            </p>
            <p className={styles.footerText}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className={styles.footerLink}>
                    Sign up
                </Link>
            </p>
        </>
    );
}
