'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Profile, ClothingItem, OutfitLog } from '@/types/database';
import type { WeatherData } from '@/types/weather';
import type { OutfitSuggestion } from '@/types/outfit';
import { logout } from '@/lib/actions/auth';
import { 
  Sparkles, 
  RefreshCw, 
  Plus, 
  Send,
  Thermometer,
  Wind,
  Droplets,
  ArrowRight,
  LogOut,
  Shirt,
  Umbrella,
  Home,
  History,
  Settings
} from 'lucide-react';
import Grainient from '@/components/Grainient';
import { WardrobeSlidePanel } from './WardrobeSlidePanel';
import styles from './dashboard.module.css';

interface DashboardClientProps {
  profile: Profile;
  clothingItems: ClothingItem[];
  recentLogs: OutfitLog[];
}

const MOODS = [
  { id: 'cozy', label: 'Cozy', emoji: '☕', gradient: 'linear-gradient(135deg, #ff9a9e, #fecfef)', description: 'Warm & relaxed' },
  { id: 'professional', label: 'Professional', emoji: '💼', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', description: 'Business ready' },
  { id: 'bold', label: 'Bold', emoji: '🔥', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', description: 'Make a statement' },
  { id: 'chill', label: 'Chill', emoji: '🌊', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', description: 'Laid back' },
  { id: 'romantic', label: 'Date Night', emoji: '✨', gradient: 'linear-gradient(135deg, #fa709a, #fee140)', description: 'Special evening' },
  { id: 'sporty', label: 'Sporty', emoji: '⚡', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)', description: 'Active & comfy' },
] as const;

const SLOTS = [
  { key: 'outerwear' as const, label: 'Outerwear', icon: Umbrella },
  { key: 'top' as const, label: 'Top', icon: Shirt },
  { key: 'bottom' as const, label: 'Bottom', icon: Shirt },
  { key: 'shoes' as const, label: 'Shoes', icon: Shirt },
];

export function DashboardClient({ profile, clothingItems, recentLogs }: DashboardClientProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [outfit, setOutfit] = useState<OutfitSuggestion | null>(null);
  const [outfitLoading, setOutfitLoading] = useState(false);
  const [mood, setMood] = useState('');
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);

  useEffect(() => {
    async function fetchWeather() {
      if (!profile.lat || !profile.lon) {
        setWeatherLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/weather?lat=${profile.lat}&lon=${profile.lon}`);
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        }
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      } finally {
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, [profile.lat, profile.lon]);

  const generateOutfit = useCallback(
    async (moodText?: string) => {
      if (clothingItems.length === 0) return;
      setOutfitLoading(true);
      try {
        const res = await fetch('/api/generate-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: moodText, weather }),
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.error) setOutfit(data);
        }
      } catch (err) {
        console.error('Failed to generate outfit:', err);
      } finally {
        setOutfitLoading(false);
      }
    },
    [weather, clothingItems.length]
  );

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) generateOutfit(mood.trim());
  };

  const userInitial = profile.full_name?.charAt(0).toUpperCase() || 'U';

  if (clothingItems.length === 0) {
    return (
      <div className={styles.dashboardRoot}>
        <Header userInitial={userInitial} />
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Sparkles size={40} />
          </div>
          <h2 className={styles.emptyStateTitle}>Your wardrobe is empty</h2>
          <p className={styles.emptyStateText}>
            Upload some clothing items to get personalized outfit suggestions.
          </p>
          <button className={styles.button} onClick={() => setIsSlidePanelOpen(true)}>
            <Plus size={18} />
            Add Your First Item
          </button>
        </div>
        <WardrobeSlidePanel
          isOpen={isSlidePanelOpen}
          onClose={() => setIsSlidePanelOpen(false)}
          onUploadComplete={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={styles.dashboardRoot}>
      <Header userInitial={userInitial} />
      
      <div className={styles.layout}>
        {/* Left Panel - Grainient + Weather + Outfit */}
        <div className={styles.leftPanel}>
          <div className={styles.grainientContainer}>
            <Grainient
              color1="#FF9FFC"
              color2="#5227FF"
              color3="#B19EEF"
              timeSpeed={0.2}
              grainAmount={0.08}
            />
          </div>
          
          <div className={styles.leftContent}>
            {/* Weather - Icon & Temp Left/Big, Details Below */}
            <div className={styles.weatherHorizontal}>
              {weatherLoading ? (
                <div className={styles.spinner} style={{ width: '24px', height: '24px', borderWidth: '2px' }} />
              ) : weather ? (
                <>
                  <div className={styles.weatherMain}>
                    <img 
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt={weather.description}
                      className={styles.weatherIconBig}
                    />
                    <span className={styles.weatherTempHuge}>{Math.round(weather.temp)}°</span>
                  </div>
                  <span className={styles.weatherDesc}>{weather.description}</span>
                  <div className={styles.weatherDetailsRow}>
                    <span>Feels {Math.round(weather.feels_like)}°</span>
                    <span className={styles.weatherDot}>•</span>
                    <span>{weather.precipitation_chance}% rain</span>
                    <span className={styles.weatherDot}>•</span>
                    <span>{Math.round(weather.wind_speed)} m/s</span>
                  </div>
                </>
              ) : (
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                  Weather unavailable
                </span>
              )}
            </div>
            
            {/* Outfit Display - Only when generated */}
            {(outfitLoading || outfit) && (
              <div className={styles.outfitContainer}>
                {outfitLoading ? (
                  <div className={styles.loadingState}>
                    <div className={styles.spinner} />
                    <p className={styles.loadingText}>Creating your outfit...</p>
                  </div>
                ) : outfit ? (
                  <>
                    {SLOTS.map(({ key, label, icon: Icon }) => {
                      const item = outfit?.[key] ?? null;
                      return (
                        <div 
                          key={key} 
                          className={`${styles.outfitSlot} ${item ? styles.outfitSlotFilled : ''}`}
                        >
                          {item ? (
                            <>
                              <img
                                src={item.photo_url}
                                alt={item.name ?? label}
                                className={styles.outfitSlotImage}
                              />
                              <div className={styles.outfitSlotLabel}>
                                {item.name ?? label}
                              </div>
                            </>
                          ) : (
                            <div className={styles.outfitSlotEmpty}>
                              <Icon size={20} className={styles.outfitSlotEmptyIcon} />
                              <span>{label}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : null}
              </div>
            )}
            
            {/* Regenerate Button */}
            {outfit && !outfitLoading && (
              <div className={styles.regenerateBar}>
                <button className={styles.button} onClick={() => generateOutfit()}>
                  <RefreshCw size={16} />
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Mood + Wardrobe + FAB */}
        <div className={styles.rightPanel}>
          {/* Mood Card */}
          <div className={styles.moodCardWrapper}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>How are you feeling?</span>
            </div>
            
            <form className={styles.moodForm} onSubmit={handleMoodSubmit}>
              <div className={styles.moodInputRow}>
                <input
                  type="text"
                  className={styles.moodInput}
                  placeholder="Cozy, professional, adventurous..."
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  disabled={outfitLoading}
                />
                <button 
                  type="submit" 
                  className={`${styles.button} ${styles.buttonAccent} ${styles.moodSubmitButton}`}
                  disabled={outfitLoading || !mood.trim()}
                >
                  <Send size={16} />
                  {outfitLoading ? '...' : 'Style'}
                </button>
              </div>
              <div className={styles.moodGrid}>
                {MOODS.map((moodItem) => (
                  <button
                    key={moodItem.id}
                    type="button"
                    className={`${styles.moodCard} ${mood === moodItem.label ? styles.moodCardActive : ''}`}
                    onClick={() => {
                      setMood(moodItem.label);
                      generateOutfit(moodItem.label);
                    }}
                    disabled={outfitLoading}
                    style={{ '--mood-gradient': moodItem.gradient } as React.CSSProperties}
                  >
                    <span className={styles.moodEmoji}>{moodItem.emoji}</span>
                    <div className={styles.moodText}>
                      <span className={styles.moodLabel}>{moodItem.label}</span>
                      <span className={styles.moodDesc}>{moodItem.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Wardrobe Card */}
          <div className={styles.wardrobeCardWrapper}>
            <div className={styles.wardrobeHeader}>
              <div className={styles.wardrobeTitleGroup}>
                <span className={styles.cardTitle}>Your Wardrobe</span>
                <div className={styles.wardrobeStats}>
                  <span>{clothingItems.filter(i => i.type === 'top').length} tops</span>
                  <span className={styles.wardrobeDot}>•</span>
                  <span>{clothingItems.filter(i => i.type === 'bottom').length} bottoms</span>
                  <span className={styles.wardrobeDot}>•</span>
                  <span>{clothingItems.filter(i => i.type === 'outerwear').length} outer</span>
                </div>
              </div>
              <a href="/wardrobe" className={styles.viewAllButton}>
                View All
                <ArrowRight size={14} />
              </a>
            </div>
            <div className={styles.wardrobeMasonry}>
              {clothingItems.slice(0, 10).map((item) => (
                <div 
                  key={item.id} 
                  className={styles.wardrobeItem}
                >
                  <img
                    src={item.photo_url}
                    alt={item.name ?? 'Item'}
                    className={styles.wardrobeItemImage}
                  />
                  <div className={styles.wardrobeItemOverlay}>
                    <span className={styles.wardrobeItemType}>{item.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* FAB */}
      <button className={styles.fab} onClick={() => setIsSlidePanelOpen(true)}>
        <Plus size={20} />
        Add to Wardrobe
      </button>
      
      {/* Slide Panel */}
      <WardrobeSlidePanel
        isOpen={isSlidePanelOpen}
        onClose={() => setIsSlidePanelOpen(false)}
        onUploadComplete={() => window.location.reload()}
      />
    </div>
  );
}

function Header({ userInitial }: { userInitial: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <a href="/dashboard" className={styles.logo}>DR!P</a>
        
        <nav className={styles.navLinks}>
          <a href="/dashboard" className={`${styles.navLink} ${styles.navLinkActive}`}>
            <Home size={16} className={styles.navIcon} />
            Today
          </a>
          <a href="/wardrobe" className={styles.navLink}>
            <Shirt size={16} className={styles.navIcon} />
            Wardrobe
          </a>
          <a href="/history" className={styles.navLink}>
            <History size={16} className={styles.navIcon} />
            History
          </a>
        </nav>
        
        <div className={styles.headerActions}>
          <div className={styles.userMenu}>
            <span className={styles.userName}>My Wardrobe</span>
            <div className={styles.userAvatar}>{userInitial}</div>
          </div>
          
          <form action={logout}>
            <button type="submit" className={styles.logoutButton}>
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
