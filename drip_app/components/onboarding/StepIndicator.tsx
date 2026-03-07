'use client';

import styles from './StepIndicator.module.css';
import type { OnboardingStep } from './OnboardingFlow';

interface StepIndicatorProps {
  currentStep: OnboardingStep;
}

const steps = [
  { number: 1, label: 'Profile' },
  { number: 2, label: 'Location' },
  { number: 3, label: 'Style' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const current = currentStep === 'analyzing' ? 3 : currentStep;

  return (
    <div className={styles.stepIndicator}>
      {steps.map((step, index) => {
        const isCompleted = step.number < current;
        const isActive = step.number === current;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.number} className={styles.stepItem}>
            <div
              className={`${styles.stepCircle} ${
                isActive ? styles.active : ''
              } ${isCompleted ? styles.completed : ''}`}
            >
              {isCompleted ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <span className={`${styles.stepLabel} ${isActive ? styles.active : ''}`}>
              {step.label}
            </span>
            {!isLast && (
              <div className={`${styles.stepLine} ${isCompleted ? styles.completed : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
