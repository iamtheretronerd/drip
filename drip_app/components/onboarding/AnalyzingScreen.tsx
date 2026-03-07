'use client';

import { useEffect } from 'react';
import styles from './onboarding.module.css';

export function AnalyzingScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Hard navigation to bypass client-side RSC cache.
      // completeOnboarding() already set onboarding_completed = true,
      // so a full page load ensures the dashboard server component
      // reads fresh data from the DB.
      window.location.href = '/dashboard';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.analyzingContainer}>
      <div className={styles.analyzingSpinner} />
      <h2 className={styles.analyzingTitle}>Analyzing your style...</h2>
      <p className={styles.analyzingText}>
        We&apos;re learning your preferences to give you personalized outfit recommendations.
      </p>
    </div>
  );
}
