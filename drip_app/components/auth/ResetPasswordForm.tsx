'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { resetPassword } from '@/lib/actions/auth';
import type { ActionResult } from '@/types';
import styles from './auth.module.css';

const initialState: ActionResult = { success: false };

// Icons
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 6l9.6 5.3a2 2 0 002.8 0L22 6" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      className={styles.submitButton}
      disabled={pending}
      whileHover={{ scale: pending ? 1 : 1.02 }}
      whileTap={{ scale: pending ? 1 : 0.98 }}
    >
      {pending ? (
        <span className={styles.spinner}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </span>
      ) : (
        'Send Reset Link'
      )}
    </motion.button>
  );
}

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPassword, initialState);

  if (state.success) {
    return (
      <motion.div
        className={styles.formWrapper}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.formHeader}>
          <div className={styles.successIcon}>
            <CheckCircleIcon />
          </div>
          <h1 className={styles.formTitle}>Check your inbox</h1>
          <p className={styles.formSubtitle}>
            If an account exists for that email, a reset link is on its way.
          </p>
        </div>

        <div className={styles.successMessage} role="status">
          <p>Password reset email sent. Check your inbox (and spam folder).</p>
        </div>

        <div className={styles.footerText}>
          <Link href="/login" className={styles.footerLink}>
            <ArrowLeftIcon /> Back to sign in
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.formWrapper}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Reset password</h1>
        <p className={styles.formSubtitle}>We&apos;ll send a reset link to your email</p>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            className={styles.errorBanner}
            role="alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AlertCircleIcon />
            <span>{state.error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form action={formAction} className={styles.form} noValidate>
        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.inputLabel}>
            <MailIcon />
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`${styles.input} ${state.fieldErrors?.email ? styles.inputError : ''}`}
            placeholder="you@example.com"
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

      {/* Footer */}
      <p className={styles.footerText}>
        <Link href="/login" className={styles.footerLink}>
          <ArrowLeftIcon /> Back to sign in
        </Link>
      </p>
    </motion.div>
  );
}
