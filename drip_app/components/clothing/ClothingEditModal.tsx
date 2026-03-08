'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClothingAnalysis } from './ClothingAnalysisModal';
import styles from './clothing.module.css';

export interface ClothingEditModalProps {
    isOpen: boolean;
    initialData: ClothingAnalysis;
    imageUrl: string;
    onClose: () => void;
    onSave: (data: ClothingAnalysis) => void;
}

const typeOptions: { value: ClothingAnalysis['type']; label: string; hint: string }[] = [
    { value: 'top', label: 'Top', hint: 'T-shirt, shirt, blouse, sweater' },
    { value: 'bottom', label: 'Bottom', hint: 'Jeans, pants, skirt, shorts' },
    { value: 'outerwear', label: 'Outerwear', hint: 'Jacket, coat, hoodie, blazer' },
    { value: 'one_piece', label: 'One Piece', hint: 'Dress, jumpsuit, romper, overalls' },
    { value: 'shoes', label: 'Shoes', hint: 'Sneakers, boots, sandals, heels' },
    { value: 'accessory', label: 'Accessory', hint: 'Hat, scarf, bag, belt, jewelry' },
];

const patternOptions: { value: ClothingAnalysis['pattern']; label: string }[] = [
    { value: 'solid', label: 'Solid' },
    { value: 'striped', label: 'Striped' },
    { value: 'plaid', label: 'Plaid' },
    { value: 'floral', label: 'Floral' },
    { value: 'graphic', label: 'Graphic' },
    { value: 'abstract', label: 'Abstract' },
    { value: 'camo', label: 'Camo' },
    { value: 'polka_dot', label: 'Polka Dot' },
];

const materialOptions = [
    'Cotton', 'Denim', 'Leather', 'Wool', 'Polyester',
    'Silk', 'Linen', 'Knit', 'Fleece', 'Nylon', 'Suede', 'Canvas',
];

const formalityOptions: { value: ClothingAnalysis['formality']; label: string }[] = [
    { value: 'casual', label: 'Casual' },
    { value: 'smart_casual', label: 'Smart Casual' },
    { value: 'business_casual', label: 'Business Casual' },
    { value: 'formal', label: 'Formal' },
    { value: 'athletic', label: 'Athletic' },
];

const warmthOptions = [
    { value: 1, label: 'Very Light (85°F+)' },
    { value: 2, label: 'Light (70–85°F)' },
    { value: 3, label: 'Moderate (55–70°F)' },
    { value: 4, label: 'Warm (35–55°F)' },
    { value: 5, label: 'Heavy Winter (<35°F)' },
];

const seasonOptions: { value: ClothingAnalysis['seasons'][0]; label: string }[] = [
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
];

const layerOptions: { value: ClothingAnalysis['layer_type']; label: string; hint: string }[] = [
    { value: 'base', label: 'Base', hint: 'Worn directly (tee, dress, pants)' },
    { value: 'mid', label: 'Mid', hint: 'Layered over base (sweater, vest)' },
    { value: 'outer', label: 'Outer', hint: 'Outermost layer (jacket, coat)' },
];

const fitOptions: { value: ClothingAnalysis['fit']; label: string }[] = [
    { value: 'slim', label: 'Slim' },
    { value: 'regular', label: 'Regular' },
    { value: 'loose', label: 'Loose' },
    { value: 'oversized', label: 'Oversized' },
];

const occasionOptions = [
    'Everyday', 'Work', 'Date Night', 'Gym', 'Lounge', 'Outdoor', 'Party', 'Travel',
];

export function ClothingEditModal({
    isOpen,
    initialData,
    imageUrl,
    onClose,
    onSave,
}: ClothingEditModalProps) {
    const [formData, setFormData] = useState<ClothingAnalysis>(initialData);
    const [isSaving, setIsSaving] = useState(false);

    // Sync form data if initialData changes while modal is open (unlikely but safe)
    useEffect(() => {
        if (isOpen) {
            setFormData(initialData);
            setIsSaving(false);
        }
    }, [isOpen, initialData]);

    const handleSeasonToggle = (season: ClothingAnalysis['seasons'][0]) => {
        setFormData((prev) => ({
            ...prev,
            seasons: prev.seasons.includes(season)
                ? prev.seasons.filter((s) => s !== season)
                : [...prev.seasons, season],
        }));
    };

    const handleOccasionToggle = (occasion: string) => {
        setFormData((prev) => ({
            ...prev,
            occasion_tags: prev.occasion_tags.includes(occasion)
                ? prev.occasion_tags.filter((o) => o !== occasion)
                : [...prev.occasion_tags, occasion],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        // Modal will close externally 
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className={styles.modalOverlay}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={styles.modalContent}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    >
                        <form onSubmit={handleSubmit} className={styles.analysisForm}>
                            <div className={styles.modalHeader}>
                                <h3>Edit Clothing Details</h3>
                                <button
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={onClose}
                                    disabled={isSaving}
                                >
                                    ×
                                </button>
                            </div>

                            <div className={styles.modalBody}>
                                {/* Image Preview */}
                                <div className={styles.imagePreview}>
                                    <img src={imageUrl} alt="Clothing item" />
                                </div>

                                {/* Form Fields */}
                                <div className={styles.formFields}>
                                    {/* Name */}
                                    <div className={styles.formGroup}>
                                        <label htmlFor="name">Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Blue Denim Jacket"
                                            required
                                        />
                                    </div>

                                    {/* Type */}
                                    <div className={styles.formGroup}>
                                        <label>Type</label>
                                        <div className={styles.typeGrid}>
                                            {typeOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`${styles.typeButton} ${formData.type === opt.value ? styles.selected : ''}`}
                                                    onClick={() => setFormData({ ...formData, type: opt.value })}
                                                >
                                                    <span className={styles.typeLabel}>{opt.label}</span>
                                                    <span className={styles.typeHint}>{opt.hint}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sub-type */}
                                    <div className={styles.formGroup}>
                                        <label htmlFor="sub_type">Sub-type</label>
                                        <input
                                            type="text"
                                            id="sub_type"
                                            value={formData.sub_type || ''}
                                            onChange={(e) => setFormData({ ...formData, sub_type: e.target.value })}
                                            placeholder="e.g., Hoodie, Maxi Dress, Chelsea Boots"
                                        />
                                    </div>

                                    {/* Colors - side by side */}
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="color">Primary Color</label>
                                            <input
                                                type="text"
                                                id="color"
                                                value={formData.color || ''}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                placeholder="e.g., Navy Blue"
                                                required
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="secondary_color">Secondary Color</label>
                                            <input
                                                type="text"
                                                id="secondary_color"
                                                value={formData.secondary_color || ''}
                                                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>

                                    {/* Pattern */}
                                    <div className={styles.formGroup}>
                                        <label>Pattern</label>
                                        <div className={styles.patternOptions}>
                                            {patternOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`${styles.tagButton} ${formData.pattern === opt.value ? styles.selected : ''}`}
                                                    onClick={() => setFormData({ ...formData, pattern: opt.value })}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Material */}
                                    <div className={styles.formGroup}>
                                        <label htmlFor="material">Material</label>
                                        <select
                                            id="material"
                                            value={formData.material || ''}
                                            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                                        >
                                            <option value="">Select material...</option>
                                            {materialOptions.map((mat) => (
                                                <option key={mat} value={mat.toLowerCase()}>{mat}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Fit & Formality - side by side */}
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="fit">Fit</label>
                                            <select
                                                id="fit"
                                                value={formData.fit || 'regular'}
                                                onChange={(e) => setFormData({ ...formData, fit: e.target.value as ClothingAnalysis['fit'] })}
                                            >
                                                {fitOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="formality">Formality</label>
                                            <select
                                                id="formality"
                                                value={formData.formality || 'casual'}
                                                onChange={(e) => setFormData({ ...formData, formality: e.target.value as ClothingAnalysis['formality'] })}
                                            >
                                                {formalityOptions.map((opt) => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Layer Type */}
                                    <div className={styles.formGroup}>
                                        <label>Layer Type</label>
                                        <div className={styles.layerOptions}>
                                            {layerOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`${styles.layerButton} ${formData.layer_type === opt.value ? styles.selected : ''}`}
                                                    onClick={() => setFormData({ ...formData, layer_type: opt.value })}
                                                >
                                                    <span className={styles.layerLabel}>{opt.label}</span>
                                                    <span className={styles.layerHint}>{opt.hint}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Warmth Rating */}
                                    <div className={styles.formGroup}>
                                        <label>Warmth Rating</label>
                                        <div className={styles.warmthOptions}>
                                            {warmthOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`${styles.warmthButton} ${formData.warmth_rating === opt.value ? styles.selected : ''}`}
                                                    onClick={() => setFormData({ ...formData, warmth_rating: opt.value as 1 | 2 | 3 | 4 | 5 })}
                                                >
                                                    <span className={styles.warmthNumber}>{opt.value}</span>
                                                    <span className={styles.warmthLabel}>{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Seasons */}
                                    <div className={styles.formGroup}>
                                        <label>Seasons</label>
                                        <div className={styles.seasonOptions}>
                                            {seasonOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`${styles.seasonButton} ${formData.seasons.includes(opt.value) ? styles.selected : ''}`}
                                                    onClick={() => handleSeasonToggle(opt.value)}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Occasions */}
                                    <div className={styles.formGroup}>
                                        <label>Occasions</label>
                                        <div className={styles.occasionOptions}>
                                            {occasionOptions.map((occasion) => (
                                                <button
                                                    key={occasion}
                                                    type="button"
                                                    className={`${styles.tagButton} ${formData.occasion_tags?.includes(occasion) ? styles.selected : ''}`}
                                                    onClick={() => handleOccasionToggle(occasion)}
                                                >
                                                    {occasion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalFooter}>
                                <button
                                    type="button"
                                    className={styles.secondaryButton}
                                    onClick={onClose}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.primaryButton} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
