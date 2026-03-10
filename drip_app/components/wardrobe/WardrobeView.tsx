'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Shirt, Trash2, Edit2, Search, FilterX, ChevronDown } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import type { ClothingItem, Profile } from '@/types/database';
import { deleteClothingItem, updateClothingItem } from '@/lib/actions/clothing';
import { ClothingEditModal } from '@/components/clothing/ClothingEditModal';
import type { ClothingAnalysis } from '@/components/clothing/ClothingAnalysisModal';
import { WardrobeSlidePanel } from '@/components/dashboard/WardrobeSlidePanel';
import styles from './wardrobe.module.css';

interface WardrobeViewProps {
  clothingItems: ClothingItem[];
  profile: Profile;
}

const TYPES = ['all', 'top', 'bottom', 'outerwear', 'shoes', 'accessory'];
const SEASONS = ['all', 'spring', 'summer', 'fall', 'winter'];
const WARMTH_LABELS = ['All', 'Very Light', 'Light', 'Medium', 'Warm', 'Very Warm'];
// We'll extract unique colors dynamically from the user's wardrobe for the color filter

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function CustomDropdown({ value, onChange, options }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={styles.customDropdown} ref={dropdownRef}>
      <button
        className={styles.dropdownButton}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className={styles.dropdownText}>{selectedOption.label}</span>
        <ChevronDown size={16} className={`${styles.dropdownIcon} ${isOpen ? styles.dropdownIconOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.dropdownOption} ${value === option.value ? styles.dropdownOptionActive : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WardrobeView({ clothingItems, profile }: WardrobeViewProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [activeSeason, setActiveSeason] = useState('all');
  const [activeColor, setActiveColor] = useState('all');
  const [activeWarmth, setActiveWarmth] = useState('0'); // '0' means all

  // Modal States
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Extract unique colors for the filter dropdown
  const uniqueColors = ['all', ...Array.from(new Set(clothingItems.map(item => item.color).filter(Boolean)))];

  // Apply all filters additively (Intersection logic: Search AND Type AND Season AND Color AND Warmth)
  const filteredItems = clothingItems.filter(item => {
    const matchesSearch = searchQuery === '' ||
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sub_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.type || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = activeType === 'all' || item.type?.toLowerCase() === activeType;

    // items.seasons is assumed to be an array of strings like ['spring', 'summer']
    const matchesSeason = activeSeason === 'all' ||
      (Array.isArray(item.seasons) && item.seasons.includes(activeSeason));

    const matchesColor = activeColor === 'all' || item.color?.toLowerCase() === activeColor.toLowerCase();

    const matchesWarmth = activeWarmth === '0' || item.warmth_rating?.toString() === activeWarmth;

    return matchesSearch && matchesType && matchesSeason && matchesColor && matchesWarmth;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setActiveType('all');
    setActiveSeason('all');
    setActiveColor('all');
    setActiveWarmth('0');
  };

  const hasActiveFilters = searchQuery !== '' || activeType !== 'all' || activeSeason !== 'all' || activeColor !== 'all' || activeWarmth !== '0';

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

  const typeOptions = TYPES.map(t => ({ value: t, label: t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1) }));
  const seasonOptions = SEASONS.map(s => ({ value: s, label: s === 'all' ? 'All Seasons' : s.charAt(0).toUpperCase() + s.slice(1) }));
  const colorOptions = uniqueColors.map(c => ({ value: c as string, label: c === 'all' ? 'All Colors' : (c as string).charAt(0).toUpperCase() + (c as string).slice(1) }));
  const warmthOptions = WARMTH_LABELS.map((lbl, idx) => ({ value: idx.toString(), label: lbl }));

  return (
    <div className={styles.root}>
      <Header profile={profile} />
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a href="/dashboard" className={styles.backButton}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </a>
          <h1 className={styles.title}>Your Wardrobe</h1>
          <button onClick={() => setIsSlidePanelOpen(true)} className={styles.addButton}>
            <Plus size={18} />
            <span>Add</span>
          </button>
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

        {/* Filter Toolbar */}
        <div className={styles.filterToolbar}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterDropdowns}>
            <CustomDropdown
              value={activeType}
              onChange={setActiveType}
              options={typeOptions}
            />

            <CustomDropdown
              value={activeSeason}
              onChange={setActiveSeason}
              options={seasonOptions}
            />

            <CustomDropdown
              value={activeColor}
              onChange={setActiveColor}
              options={colorOptions}
            />

            <CustomDropdown
              value={activeWarmth}
              onChange={setActiveWarmth}
              options={warmthOptions}
            />

            {hasActiveFilters && (
              <button onClick={clearFilters} className={styles.clearFiltersBtn} title="Clear Filters">
                <FilterX size={16} />
              </button>
            )}
          </div>
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
              {hasActiveFilters
                ? 'No items match your selected filters and search.'
                : 'Your wardrobe is empty. Add some items to get started.'}
            </p>
            <button onClick={() => setIsSlidePanelOpen(true)} className={styles.emptyButton}>
              <Plus size={18} />
              Add Items
            </button>
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

      {/* Slide Panel for Uploading New Items */}
      <WardrobeSlidePanel
        isOpen={isSlidePanelOpen}
        onClose={() => setIsSlidePanelOpen(false)}
        onUploadComplete={() => window.location.reload()}
      />

      {/* FAB */}
      <button className={styles.fab} onClick={() => setIsSlidePanelOpen(true)}>
        <Plus size={20} />
        <span>Add to Wardrobe</span>
      </button>
    </div>
  );
}
