'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signUp } from '@/lib/actions/auth';
import type { ActionResult } from '@/types';
import styles from './auth.module.css';
import { SocialAuthButtons } from './SocialAuthButtons';

const initialState: ActionResult = { success: false };

// Icons
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 6l9.6 5.3a2 2 0 002.8 0L22 6" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
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
        'Create Account'
      )}
    </motion.button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, initialState);

  return (
    <motion.div
      className={styles.formWrapper}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className={styles.formHeader}>
        <h1 className={styles.formTitle}>Create account</h1>
        <p className={styles.formSubtitle}>Sign up to get started</p>
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
          <label htmlFor="fullName" className={styles.inputLabel}>
            <UserIcon />
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            className={`${styles.input} ${state.fieldErrors?.fullName ? styles.inputError : ''}`}
            placeholder="John Doe"
          />
          {state.fieldErrors?.fullName && (
            <p className={styles.fieldError}>{state.fieldErrors.fullName}</p>
          )}
        </div>

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
          />
          {state.fieldErrors?.email && (
            <p className={styles.fieldError}>{state.fieldErrors.email}</p>
          )}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.inputLabel}>
            <LockIcon />
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={`${styles.input} ${state.fieldErrors?.password ? styles.inputError : ''}`}
            placeholder="••••••••"
          />
          {state.fieldErrors?.password && (
            <p className={styles.fieldError}>{state.fieldErrors.password}</p>
          )}
          <p className={styles.passwordHint}>Min. 8 characters with uppercase, lowercase, and a number</p>
        </div>

        <SubmitButton />
      </form>

      {/* Social Auth */}
      <SocialAuthButtons />

      {/* Footer */}
      <p className={styles.footerText}>
        Already have an account?{' '}
        <Link href="/login" className={styles.footerLink}>
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
