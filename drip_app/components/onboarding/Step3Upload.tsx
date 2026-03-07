'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadClothingItem, updateClothingItemAnalysis, completeOnboarding } from '@/lib/actions/onboarding';
import { ClothingAnalysisModal, type ClothingAnalysis } from '@/components/clothing/ClothingAnalysisModal';
import styles from './onboarding.module.css';

interface Step3UploadProps {
  onComplete: (uploads: { id: string; url: string }[]) => void;
  onBack: () => void;
}

interface UploadSlot {
  id: string | null;
  url: string | null;
  isLoading: boolean;
}

export function Step3Upload({ onComplete, onBack }: Step3UploadProps) {
  const [slots, setSlots] = useState<UploadSlot[]>([
    { id: null, url: null, isLoading: false },
    { id: null, url: null, isLoading: false },
    { id: null, url: null, isLoading: false },
  ]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState('');
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [currentAnalysisItem, setCurrentAnalysisItem] = useState<{ id: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  const filledSlots = slots.filter((s) => s.url !== null).length;
  const canComplete = filledSlots >= 1;

  const handleSlotClick = (index: number) => {
    if (slots[index].isLoading) return;

    if (slots[index].url) {
      // Remove the item
      setSlots((prev) =>
        prev.map((slot, i) =>
          i === index ? { id: null, url: null, isLoading: false } : slot
        )
      );
    } else {
      // Open file picker
      setActiveSlotIndex(index);
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || activeSlotIndex === null) return;

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setError('');
      setSlots((prev) =>
        prev.map((slot, i) =>
          i === activeSlotIndex ? { ...slot, isLoading: true } : slot
        )
      );

      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadClothingItem(formData);

      if (result.success && result.data) {
        // Update slot with uploaded image
        setSlots((prev) =>
          prev.map((slot, i) =>
            i === activeSlotIndex
              ? { id: result.data!.id, url: result.data!.url, isLoading: false }
              : slot
          )
        );

        // Open analysis modal for this item
        setCurrentAnalysisItem(result.data);
        setAnalysisModalOpen(true);
      } else {
        setError(result.error || 'Upload failed');
        setSlots((prev) =>
          prev.map((slot, i) =>
            i === activeSlotIndex ? { ...slot, isLoading: false } : slot
          )
        );
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setActiveSlotIndex(null);
    },
    [activeSlotIndex]
  );

  const handleAnalysisSave = async (analysis: ClothingAnalysis) => {
    if (!currentAnalysisItem) return;

    const result = await updateClothingItemAnalysis(currentAnalysisItem.id, analysis);

    if (!result.success) {
      setError(result.error || 'Failed to save analysis');
    }

    setAnalysisModalOpen(false);
    setCurrentAnalysisItem(null);
  };

  const handleAnalysisClose = () => {
    // If user closes without saving, we keep the upload but it's not fully analyzed
    // The item exists in DB with status 'pending_analysis'
    setAnalysisModalOpen(false);
    setCurrentAnalysisItem(null);
  };

  const handleComplete = async () => {
    if (!canComplete) return;

    setIsCompleting(true);
    setError('');

    const uploads = slots
      .filter((slot) => slot.id && slot.url)
      .map((slot) => ({ id: slot.id!, url: slot.url! }));

    const result = await completeOnboarding();

    if (result.success) {
      onComplete(uploads);
    } else {
      setError(result.error || 'Something went wrong');
      setIsCompleting(false);
    }
  };

  return (
    <div>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Upload your starter kit</h2>
        <p className={styles.stepDescription}>
          Show us one complete outfit you&apos;d wear. This helps us understand your style.
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

      <p style={{ fontSize: '0.85rem', color: '#666666', marginBottom: '1rem' }}>
        Minimum 1 photo required, maximum 3 photos
      </p>

      <div className={styles.uploadGrid}>
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`${styles.uploadSlot} ${slot.url ? styles.uploadSlotFilled : ''}`}
            onClick={() => handleSlotClick(index)}
          >
            {slot.isLoading ? (
              <span className={styles.spinner} style={{ width: '24px', height: '24px' }} />
            ) : slot.url ? (
              <>
                <img
                  src={slot.url}
                  alt={`Upload ${index + 1}`}
                  className={styles.uploadPreview}
                />
                <button
                  type="button"
                  className={styles.uploadRemove}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSlotClick(index);
                  }}
                >
                  ×
                </button>
              </>
            ) : (
              <>
                <span className={styles.uploadPlus}>+</span>
                <span className={styles.uploadText}>Add photo</span>
              </>
            )}
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp, image/heic"
        className={styles.fileInput}
        onChange={handleFileChange}
      />

      <div className={styles.navButtons}>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={onBack}
          disabled={isCompleting}
        >
          Back
        </button>
        <button
          type="button"
          className={styles.button}
          disabled={!canComplete || isCompleting}
          onClick={handleComplete}
        >
          {isCompleting ? (
            <span className={styles.spinner} />
          ) : (
            `Complete (${filledSlots}/1)`
          )}
        </button>
      </div>

      {/* Analysis Modal */}
      {currentAnalysisItem && (
        <ClothingAnalysisModal
          isOpen={analysisModalOpen}
          imageUrl={currentAnalysisItem.url}
          onClose={handleAnalysisClose}
          onSave={handleAnalysisSave}
        />
      )}
    </div>
  );
}
