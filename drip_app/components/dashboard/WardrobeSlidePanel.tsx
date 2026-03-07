'use client';

import { useState, useRef, useCallback } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { uploadClothingItem, updateClothingItemAnalysis } from '@/lib/actions/onboarding';
import { ClothingAnalysisModal, type ClothingAnalysis } from '@/components/clothing/ClothingAnalysisModal';
import styles from './dashboard.module.css';

interface UploadSlot {
  id: string | null;
  url: string | null;
  isLoading: boolean;
}

interface WardrobeSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export function WardrobeSlidePanel({ isOpen, onClose, onUploadComplete }: WardrobeSlidePanelProps) {
  const [slots, setSlots] = useState<UploadSlot[]>([
    { id: null, url: null, isLoading: false },
    { id: null, url: null, isLoading: false },
    { id: null, url: null, isLoading: false },
  ]);
  const [error, setError] = useState('');
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [currentAnalysisItem, setCurrentAnalysisItem] = useState<{ id: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  const filledSlots = slots.filter((s) => s.url !== null).length;

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
    setAnalysisModalOpen(false);
    setCurrentAnalysisItem(null);
  };

  const handleDone = () => {
    if (filledSlots > 0) {
      onUploadComplete();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`${styles.slidePanelOverlay} ${isOpen ? styles.slidePanelOverlayOpen : ''}`}
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div className={`${styles.slidePanel} ${isOpen ? styles.slidePanelOpen : ''}`}>
        <div className={styles.slidePanelHeader}>
          <h2 className={styles.slidePanelTitle}>Add to Wardrobe</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        
        <div className={styles.slidePanelContent}>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
            Upload photos of your clothing items. Our AI will analyze them and add them to your wardrobe.
          </p>

          {error && (
            <div style={{ 
              padding: '0.75rem 1rem', 
              background: 'rgba(255, 68, 68, 0.1)', 
              border: '1px solid rgba(255, 68, 68, 0.3)',
              borderRadius: '10px',
              color: '#ff8888',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          <div className={styles.uploadGrid}>
            {slots.map((slot, index) => (
              <div
                key={index}
                className={`${styles.uploadSlot} ${slot.url ? styles.uploadSlotFilled : ''}`}
                onClick={() => handleSlotClick(index)}
              >
                {slot.isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={styles.spinner} style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Uploading...</span>
                  </div>
                ) : slot.url ? (
                  <>
                    <img src={slot.url} alt="Upload preview" className={styles.uploadPreview} />
                    <button
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

          <div style={{ 
            padding: '1rem', 
            background: 'rgba(99, 102, 241, 0.1)', 
            border: '1px solid rgba(99, 102, 241, 0.2)', 
            borderRadius: '12px',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={16} style={{ color: '#6366f1' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ffffff' }}>AI Analysis</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Our AI will automatically identify the type, color, material, and style of your clothing items.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
            <button 
              className={`${styles.button} ${styles.buttonAccent}`} 
              onClick={handleDone}
              disabled={filledSlots === 0}
              style={{ flex: 1 }}
            >
              Done ({filledSlots})
            </button>
          </div>
        </div>
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
    </>
  );
}
