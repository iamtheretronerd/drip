'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StepIndicator } from './StepIndicator';
import { Step1Quiz } from './Step1Quiz';
import { Step2Location } from './Step2Location';
import { Step3Upload } from './Step3Upload';
import { AnalyzingScreen } from './AnalyzingScreen';
import styles from './onboarding.module.css';

export type OnboardingStep = 1 | 2 | 3 | 'analyzing';

export interface OnboardingData {
  step1: {
    lifestyle: string;
    weather_sensitivity: string;
    priority: string;
  } | null;
  step2: {
    lat: number;
    lon: number;
    city_name: string;
  } | null;
  step3: {
    uploads: { id: string; url: string }[];
  };
}

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<OnboardingData>({
    step1: null,
    step2: null,
    step3: { uploads: [] },
  });

  // Update data in real-time as user makes selections
  const handleStep1DataChange = (step1Data: OnboardingData['step1']) => {
    setData((prev) => ({ ...prev, step1: step1Data }));
  };

  const handleStep1Complete = () => {
    setCurrentStep(2);
  };

  const handleStep2DataChange = (step2Data: OnboardingData['step2']) => {
    setData((prev) => ({ ...prev, step2: step2Data }));
  };

  const handleStep2Complete = () => {
    setCurrentStep(3);
  };

  const handleStep3Complete = () => {
    setCurrentStep('analyzing');
  };

  const handleBack = () => {
    if (currentStep === 2) setCurrentStep(1);
    if (currentStep === 3) setCurrentStep(2);
  };

  const visualData = (() => {
    switch (currentStep) {
      case 1:
        return {
          title: 'Your Style Journey Begins',
          subtitle: 'Step 1 of 3',
          description: 'Tell us about your lifestyle so we can curate outfits that match your day-to-day.',
          stats: [
            { label: 'Lifestyle', value: data.step1?.lifestyle ? capitalize(data.step1.lifestyle) : '—' },
            { label: 'Weather', value: data.step1?.weather_sensitivity ? capitalize(data.step1.weather_sensitivity) : '—' },
            { label: 'Priority', value: data.step1?.priority ? capitalize(data.step1.priority) : '—' },
          ],
        };
      case 2:
        return {
          title: 'Weather Intelligence',
          subtitle: 'Step 2 of 3',
          description: 'We use your location to provide real-time outfit recommendations based on actual weather conditions.',
          stats: [
            { label: 'Location', value: data.step2?.city_name || '—' },
            { label: 'Latitude', value: data.step2?.lat ? data.step2.lat.toFixed(2) : '—' },
            { label: 'Longitude', value: data.step2?.lon ? data.step2.lon.toFixed(2) : '—' },
          ],
        };
      case 3:
        return {
          title: 'Build Your Wardrobe',
          subtitle: 'Step 3 of 3',
          description: 'Upload photos of your favorite outfits. Our AI will analyze your style and create personalized recommendations.',
          stats: [
            { label: 'Photos', value: `${data.step3.uploads.length} / 1` },
            { label: 'Status', value: data.step3.uploads.length > 0 ? 'Ready' : 'Waiting' },
          ],
        };
      default:
        return { title: '', subtitle: '', description: '', stats: [] };
    }
  })();

  return (
    <div className={styles.onboardingRoot}>
      {/* Progress Header */}
      {currentStep !== 'analyzing' && (
        <div className={styles.progressHeader}>
          <StepIndicator currentStep={currentStep} />
        </div>
      )}

      {/* Main Layout */}
      <div className={styles.layout}>
        {/* Left Panel - Info & Preview */}
        {currentStep !== 'analyzing' && (
          <motion.div
            className={styles.leftPanel}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.leftContent}>
              <div className={styles.leftHeader}>
                <span className={styles.stepBadge}>{visualData.subtitle}</span>
                <h1 className={styles.leftTitle}>{visualData.title}</h1>
                <p className={styles.leftDescription}>{visualData.description}</p>
              </div>

              <div className={styles.statsGrid}>
                {visualData.stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className={styles.statCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <span className={styles.statLabel}>{stat.label}</span>
                    <span className={styles.statValue}>{stat.value}</span>
                  </motion.div>
                ))}
              </div>

              <div className={styles.decorativeElement}>
                <div className={styles.decoCircle1} />
                <div className={styles.decoCircle2} />
                <div className={styles.decoLine} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Right Panel - Form */}
        <div className={styles.rightPanel}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                className={styles.formContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step1Quiz
                  onDataChange={handleStep1DataChange}
                  onComplete={handleStep1Complete}
                />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                className={styles.formContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step2Location
                  onDataChange={handleStep2DataChange}
                  onComplete={handleStep2Complete}
                  onBack={handleBack}
                />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                className={styles.formContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Step3Upload onComplete={handleStep3Complete} onBack={handleBack} />
              </motion.div>
            )}

            {currentStep === 'analyzing' && (
              <motion.div
                key="analyzing"
                className={styles.formContainer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AnalyzingScreen />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
