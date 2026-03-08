'use client';

import { useState, useTransition } from 'react';
import { ArrowLeft, Plus, Shirt, Trash2, Edit2 } from 'lucide-react';
import type { ClothingItem } from '@/types/database';
import styles from './wardrobe.module.css';
import { deleteClothingItem, updateClothingItem } from '@/lib/actions/clothing';
import { ClothingEditModal } from '@/components/clothing/ClothingEditModal';
import type { ClothingAnalysis } from '@/components/clothing/ClothingAnalysisModal';

interface WardrobeViewProps {
  clothingItems: ClothingItem[];
}

const FILTERS = [
  { key: 'all', label: 'All Items' },
  { key: 'top', label: 'Tops' },
  { key: 'bottom', label: 'Bottoms' },
  { key: 'outerwear', label: 'Outerwear' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'accessory', label: 'Accessories' },
];

export function WardrobeView({ clothingItems }: WardrobeViewProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredItems = activeFilter === 'all'
    ? clothingItems
    : clothingItems.filter(item => item.type?.toLowerCase() === activeFilter);

  const confirmDelete = () => {
    if (!itemToDelete || !itemToDelete.photo_url) return;

    startTransition(async () => {
      try {
        const result = await deleteClothingItem(itemToDelete.id, itemToDelete.photo_url!);
        if (result.success) {
          setItemToDelete(null);
        } else {
          console.error('Failed to delete item:', result.error);
          alert('Failed to delete item: ' + result.error);
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert('An unexpected error occurred while deleting.');
      }
    });
  };

  const handleEditSave = async (data: ClothingAnalysis) => {
    if (!editingItem) return;

    try {
      const result = await updateClothingItem(editingItem.id, data);
      if (result.success) {
        setEditingItem(null);
      } else {
        console.error('Failed to update item:', result.error);
        alert('Failed to update item: ' + result.error);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('An unexpected error occurred while updating.');
    }
  };

  // Convert DB ClothingItem format to ClothingAnalysis format for the edit form
  const getEditingData = (): ClothingAnalysis | null => {
    if (!editingItem) return null;
    return {
      name: editingItem.name || '',
      type: (editingItem.type as ClothingAnalysis['type']) || 'top',
      sub_type: editingItem.sub_type || undefined,
      color: editingItem.color || '',
      secondary_color: editingItem.secondary_color || undefined,
      pattern: (editingItem.pattern as ClothingAnalysis['pattern']) || 'solid',
      material: editingItem.material || undefined,
      formality: (editingItem.formality as ClothingAnalysis['formality']) || 'casual',
      warmth_rating: (editingItem.warmth_rating as ClothingAnalysis['warmth_rating']) || 3,
      seasons: (editingItem.seasons as ClothingAnalysis['seasons']) || ['spring', 'summer', 'fall', 'winter'],
      layer_type: (editingItem.layer_type as ClothingAnalysis['layer_type']) || 'base',
      fit: (editingItem.fit as ClothingAnalysis['fit']) || 'regular',
      occasion_tags: editingItem.occasion_tags || ['Everyday'],
    };
  };

  const editingData = getEditingData();

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a href="/dashboard" className={styles.backButton}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </a>
          <h1 className={styles.title}>Your Wardrobe</h1>
          <a href="/onboarding" className={styles.addButton}>
            <Plus size={18} />
            <span>Add</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{clothingItems.length}</span>
            <span className={styles.statLabel}>Total Items</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {clothingItems.filter(i => i.type === 'top').length}
            </span>
            <span className={styles.statLabel}>Tops</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {clothingItems.filter(i => i.type === 'bottom').length}
            </span>
            <span className={styles.statLabel}>Bottoms</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {clothingItems.filter(i => i.type === 'outerwear').length}
            </span>
            <span className={styles.statLabel}>Outerwear</span>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              className={`${styles.filterButton} ${activeFilter === filter.key ? styles.filterButtonActive : ''}`}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filteredItems.length > 0 ? (
          <div className={styles.grid}>
            {filteredItems.map((item) => (
              <div key={item.id} className={styles.item} style={{ opacity: isPending ? 0.7 : 1 }}>
                <img
                  src={item.photo_url || ''}
                  alt={item.name ?? 'Clothing item'}
                  className={styles.itemImage}
                />
                <div className={styles.itemOverlay}>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                      }}
                      title="Edit Item"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete(item);
                      }}
                      title="Delete Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <span className={styles.itemName}>
                    {item.name ?? item.sub_type ?? item.type ?? 'Item'}
                  </span>
                  <span className={styles.itemType}>
                    {item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Shirt size={48} />
            </div>
            <h3 className={styles.emptyTitle}>No items found</h3>
            <p className={styles.emptyText}>
              {activeFilter === 'all'
                ? 'Your wardrobe is empty. Add some items to get started.'
                : `No ${activeFilter} items in your wardrobe.`}
            </p>
            <a href="/onboarding" className={styles.emptyButton}>
              <Plus size={18} />
              Add Items
            </a>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingItem && editingData && (
        <ClothingEditModal
          isOpen={!!editingItem}
          initialData={editingData}
          imageUrl={editingItem.photo_url || ''}
          onClose={() => setEditingItem(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className={styles.modalOverlay} onClick={() => !isPending && setItemToDelete(null)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3>Delete this item?</h3>
            <p>Are you sure you want to delete <strong>{itemToDelete.name || itemToDelete.sub_type || itemToDelete.type || 'this item'}</strong> from your wardrobe? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setItemToDelete(null)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                className={styles.dangerButton}
                onClick={confirmDelete}
                disabled={isPending}
              >
                {isPending ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
