'use client';

import { useState } from 'react';
import { saveStep1 } from '@/lib/actions/onboarding';
import styles from './onboarding.module.css';
import type { OnboardingData } from './OnboardingFlow';

interface Step1QuizProps {
  onDataChange: (data: OnboardingData['step1']) => void;
  onComplete: () => void;
}

const lifestyleOptions = [
  { id: 'office', title: 'Office', description: 'Professional setting' },
  { id: 'remote', title: 'Remote', description: 'Work from home' },
  { id: 'student', title: 'Student', description: 'Campus life' },
  { id: 'active', title: 'Active', description: 'Always on the move' },
];

const weatherOptions = [
  { id: 'cold', title: 'Cold-prone', description: 'Always chilly' },
  { id: 'neutral', title: 'Neutral', description: 'Comfortable' },
  { id: 'hot', title: 'Runs Hot', description: 'Often warm' },
];

const priorityOptions = [
  { id: 'comfort', title: 'Comfort', description: 'Cozy first' },
  { id: 'style', title: 'Style', description: 'Look good' },
  { id: 'function', title: 'Function', description: 'Practical' },
];

export function Step1Quiz({ onDataChange, onComplete }: Step1QuizProps) {
  const [lifestyle, setLifestyle] = useState('');
  const [weather, setWeather] = useState('');
  const [priority, setPriority] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const canContinue = lifestyle && weather && priority;

  const handleLifestyleChange = (id: string) => {
    setLifestyle(id);
    onDataChange({
      lifestyle: id,
      weather_sensitivity: weather,
      priority: priority,
    });
  };

  const handleWeatherChange = (id: string) => {
    setWeather(id);
    onDataChange({
      lifestyle: lifestyle,
      weather_sensitivity: id,
      priority: priority,
    });
  };

  const handlePriorityChange = (id: string) => {
    setPriority(id);
    onDataChange({
      lifestyle: lifestyle,
      weather_sensitivity: weather,
      priority: id,
    });
  };

  const handleContinue = async () => {
    if (!canContinue) return;

    setIsSaving(true);
    setError('');

    const result = await saveStep1({
      lifestyle,
      weather_sensitivity: weather,
      priority,
    });

    if (result.success) {
      onComplete();
    } else {
      setError(result.error || 'Something went wrong');
    }

    setIsSaving(false);
  };

  return (
    <div>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Tell us about yourself</h2>
        <p className={styles.stepDescription}>
          Help us understand your lifestyle to give you better recommendations.
        </p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <div className={styles.formSection}>
        <label className={styles.sectionLabel}>What&apos;s your lifestyle?</label>
        <div className={styles.quizGrid}>
          {lifestyleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.quizCard} ${lifestyle === option.id ? styles.quizCardSelected : ''}`}
              onClick={() => handleLifestyleChange(option.id)}
            >
              <div className={styles.quizCardTitle}>{option.title}</div>
              <div className={styles.quizCardDescription}>{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formSection}>
        <label className={styles.sectionLabel}>How do you handle weather?</label>
        <div className={styles.quizGrid}>
          {weatherOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.quizCard} ${weather === option.id ? styles.quizCardSelected : ''}`}
              onClick={() => handleWeatherChange(option.id)}
            >
              <div className={styles.quizCardTitle}>{option.title}</div>
              <div className={styles.quizCardDescription}>{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formSection}>
        <label className={styles.sectionLabel}>What matters most?</label>
        <div className={styles.quizGrid}>
          {priorityOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`${styles.quizCard} ${priority === option.id ? styles.quizCardSelected : ''}`}
              onClick={() => handlePriorityChange(option.id)}
            >
              <div className={styles.quizCardTitle}>{option.title}</div>
              <div className={styles.quizCardDescription}>{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.button}
        disabled={!canContinue || isSaving}
        onClick={handleContinue}
      >
        {isSaving ? <span className={styles.spinner} /> : 'Continue'}
      </button>
    </div>
  );
}
