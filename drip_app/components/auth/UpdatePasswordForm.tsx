'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updatePassword } from '@/lib/actions/auth';
import type { ActionResult } from '@/types';
import styles from './auth.module.css';

const initialState: ActionResult = { success: false };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button type="submit" className={styles.submitButton} disabled={pending} aria-busy={pending}>
            {pending ? 'Updating…' : 'Update Password'}
        </button>
    );
}

export function UpdatePasswordForm() {
    const [state, formAction] = useActionState(updatePassword, initialState);

    return (
        <>
            <h2 className={styles.formTitle}>Set new password</h2>
            <p className={styles.formSubtitle}>Choose a strong password for your account</p>

            {state.error && (
                <div className={styles.errorBanner} role="alert">
                    {state.error}
                </div>
            )}

            <form action={formAction} className={styles.form} noValidate>
                <div className={styles.fieldGroup}>
                    <label htmlFor="password" className={styles.label}>
                        New Password
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

                <div className={styles.fieldGroup}>
                    <label htmlFor="confirmPassword" className={styles.label}>
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        className={`${styles.input} ${state.fieldErrors?.confirmPassword ? styles.inputError : ''}`}
                        aria-describedby={state.fieldErrors?.confirmPassword ? 'confirmPassword-error' : undefined}
                    />
                    {state.fieldErrors?.confirmPassword && (
                        <p id="confirmPassword-error" className={styles.fieldError} role="alert">
                            {state.fieldErrors.confirmPassword}
                        </p>
                    )}
                </div>

                <SubmitButton />
            </form>
        </>
    );
}
