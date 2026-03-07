'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Shirt, Sparkles } from 'lucide-react';
import type { ClothingItem } from '@/types/database';
import styles from './wardrobe.module.css';

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

  const filteredItems = activeFilter === 'all'
    ? clothingItems
    : clothingItems.filter(item => item.type?.toLowerCase() === activeFilter);

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
              <div key={item.id} className={styles.item}>
                <img
                  src={item.photo_url}
                  alt={item.name ?? 'Clothing item'}
                  className={styles.itemImage}
                />
                <div className={styles.itemOverlay}>
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
    </div>
  );
}
