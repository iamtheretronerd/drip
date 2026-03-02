'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signUp } from '@/lib/actions/auth';
import type { ActionResult } from '@/types';
import styles from './auth.module.css';
import { SocialAuthButtons } from './SocialAuthButtons';

const initialState: ActionResult = { success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.submitButton} disabled={pending} aria-busy={pending}>
            {pending ? 'Creating account…' : 'Create Account'}
        </button>
    );
}

export function SignUpForm() {
    const [state, formAction] = useActionState(signUp, initialState);

    return (
        <>
            <h2 className={styles.formTitle}>Create your account</h2>
            <p className={styles.formSubtitle}>Start building your smart wardrobe</p>

            {state.error && (
                <div className={styles.errorBanner} role="alert">
                    {state.error}
                </div>
            )}

            <form action={formAction} className={styles.form} noValidate>
                <div className={styles.fieldGroup}>
                    <label htmlFor="fullName" className={styles.label}>
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        className={`${styles.input} ${state.fieldErrors?.fullName ? styles.inputError : ''}`}
                        aria-describedby={state.fieldErrors?.fullName ? 'fullName-error' : undefined}
                    />
                    {state.fieldErrors?.fullName && (
                        <p id="fullName-error" className={styles.fieldError} role="alert">
                            {state.fieldErrors.fullName}
                        </p>
                    )}
                </div>

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
                        autoComplete="new-password"
                        required
                        className={`${styles.input} ${state.fieldErrors?.password ? styles.inputError : ''}`}
                        aria-describedby="password-hint password-error"
                    />
                    <p id="password-hint" className={styles.passwordHint}>
                        Min. 8 characters with uppercase, lowercase, and a number
                    </p>
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
                Already have an account?{' '}
                <Link href="/login" className={styles.footerLink}>
                    Sign in
                </Link>
            </p>
        </>
    );
}
