'use client';

import { useState } from 'react';
import { saveStep2 } from '@/lib/actions/onboarding';
import styles from './onboarding.module.css';
import type { OnboardingData } from './OnboardingFlow';

interface Step2LocationProps {
  onDataChange: (data: OnboardingData['step2']) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function Step2Location({ onDataChange, onComplete, onBack }: Step2LocationProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [cityName, setCityName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const saveLocation = async (lat: number, lon: number, city: string) => {
    setIsSaving(true);
    onDataChange({ lat, lon, city_name: city });

    const result = await saveStep2({
      lat,
      lon,
      city_name: city,
    });

    if (result.success) {
      onComplete();
    } else {
      setError(result.error || 'Something went wrong');
    }

    setIsSaving(false);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const city = data.city || data.locality || 'Unknown Location';

          setIsLocating(false);
          await saveLocation(latitude, longitude, city);
        } catch {
          setIsLocating(false);
          await saveLocation(latitude, longitude, 'Current Location');
        }
      },
      (err) => {
        setIsLocating(false);
        console.error('Geolocation error:', err);
        
        let errorMessage = 'Unable to get your location';
        if (err.code === 1) {
          errorMessage = 'Location access denied. Please enter your city manually.';
        } else if (err.code === 2) {
          errorMessage = 'Position unavailable. Please try again or enter your city manually.';
        } else if (err.code === 3) {
          errorMessage = 'Location request timed out. Please try again or enter your city manually.';
        }
        
        setError(errorMessage);
      },
      { timeout: 15000, enableHighAccuracy: false, maximumAge: 60000 }
    );
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;

    setIsSaving(true);
    setError('');
    await saveLocation(0, 0, cityName.trim());
  };

  const handleCityNameChange = (value: string) => {
    setCityName(value);
    if (value.trim()) {
      onDataChange({ lat: 0, lon: 0, city_name: value.trim() });
    }
  };

  return (
    <div>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Where are you?</h2>
        <p className={styles.stepDescription}>
          We use your location to get accurate weather data for outfit recommendations.
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

      <div className={styles.locationContainer}>
        <div className={styles.locationIcon}>📍</div>

        <button
          type="button"
          className={styles.button}
          onClick={handleGeolocation}
          disabled={isLocating || isSaving}
        >
          {isLocating ? (
            <>
              <span className={styles.spinner} />
              Getting location...
            </>
          ) : (
            'Use my current location'
          )}
        </button>

        <div className={styles.locationFallback}>
          <p className={styles.locationText}>Or enter your city manually:</p>
          <form onSubmit={handleManualSubmit}>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g., New York, London, Tokyo"
              value={cityName}
              onChange={(e) => handleCityNameChange(e.target.value)}
              disabled={isSaving}
              style={{ marginBottom: '0.75rem' }}
            />
            <div className={styles.navButtons}>
              <button
                type="button"
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={onBack}
                disabled={isSaving}
              >
                Back
              </button>
              <button
                type="submit"
                className={styles.button}
                disabled={!cityName.trim() || isSaving}
              >
                {isSaving ? <span className={styles.spinner} /> : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
