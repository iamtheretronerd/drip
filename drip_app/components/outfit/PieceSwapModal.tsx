'use client';

import { X, Search, MinusCircle } from 'lucide-react';
import type { ClothingItem } from '@/types/database';
import styles from './outfit.module.css';

interface PieceSwapModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: string;
    items: { item: ClothingItem; isRecommended: boolean }[];
    currentId?: string;
    onSelect: (item: ClothingItem | null) => void;
}

export function PieceSwapModal({
    isOpen,
    onClose,
    category,
    items,
    currentId,
    onSelect
}: PieceSwapModalProps) {
    if (!isOpen) return null;

    const isOptional = category === 'outerwear' || category === 'accessory1' || category === 'accessory2';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <div className={styles.headerInfo}>
                        <h3 className={styles.modalTitle}>Swap {category}</h3>
                        <p className={styles.modalSubtitle}>{items.length} options available</p>
                    </div>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.itemGrid}>
                    {isOptional && (
                        <button
                            className={`${styles.noneCard} ${!currentId ? styles.itemCardActive : ''}`}
                            onClick={() => onSelect(null)}
                        >
                            <MinusCircle size={24} className={styles.noneIcon} />
                            <span className={styles.noneText}>None</span>
                        </button>
                    )}

                    {items.map(({ item, isRecommended }) => (
                        <button
                            key={item.id}
                            className={`${styles.itemCard} ${item.id === currentId ? styles.itemCardActive : ''}`}
                            onClick={() => onSelect(item)}
                        >
                            <div className={styles.imageWrapper}>
                                <img
                                    src={item.photo_url}
                                    alt={item.name ?? category}
                                    className={styles.itemImage}
                                />
                                {isRecommended && !category.startsWith('accessory') && (
                                    <div className={styles.recommendedBadge}>
                                        Recommended
                                    </div>
                                )}
                            </div>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name ?? 'Unnamed Piece'}</span>
                                <span className={styles.itemMetadata}>
                                    {item.color}
                                    {!category.startsWith('accessory') && ` • ${item.warmth_rating}/5`}
                                </span>
                            </div>
                        </button>
                    ))}

                    {items.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>No suitable alternatives found for this weather.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
