'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Profile, ClothingItem, OutfitLog } from '@/types/database';
import type { WeatherData } from '@/types/weather';
import type { OutfitSuggestion } from '@/types/outfit';
import { logout } from '@/lib/actions/auth';
import {
  RefreshCw,
  Sparkles,
  Plus,
  Shirt,
  Umbrella,
  Send,
  ArrowRight,
  LogOut,
  Home,
  History,
  Settings,
  Check,
  CheckCircle2,
  Thermometer,
  Wind,
  Droplets,
  Undo2,
} from 'lucide-react';
import { Header } from '@/components/shared/Header';
import Grainient from '@/components/Grainient';
import { ForecastBar } from '@/components/weather/ForecastBar';
import { WardrobeSlidePanel } from './WardrobeSlidePanel';
import { PieceSwapModal } from '@/components/outfit/PieceSwapModal';
import { filterWardrobe, getSwapAlternatives, isOnePiece } from '@/lib/outfit-engine';
import { logOutfit, unlogOutfit } from '@/lib/actions/outfit_logs';
import { WeatherSnapshot } from '@/types/database';
import type { ForecastDay } from '@/types/weather';
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

const MANDATORY_SLOTS = [
  { key: 'top' as const, label: 'Top', icon: Shirt },
  { key: 'bottom' as const, label: 'Bottom', icon: Shirt },
  { key: 'shoes' as const, label: 'Shoes', icon: Shirt },
] as const;

const OPTIONAL_SLOTS = [
  { key: 'outerwear' as const, label: 'Outerwear', icon: Umbrella },
  { key: 'accessory1' as const, label: 'Accessory 1', icon: Sparkles },
  { key: 'accessory2' as const, label: 'Accessory 2', icon: Sparkles },
] as const;

const ALL_SLOTS = [...MANDATORY_SLOTS, ...OPTIONAL_SLOTS];



export function DashboardClient({ profile, clothingItems, recentLogs }: DashboardClientProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [outfit, setOutfit] = useState<OutfitSuggestion | null>(null);
  const [outfitLoading, setOutfitLoading] = useState(false);
  const [mood, setMood] = useState('');
  const [isSlidePanelOpen, setIsSlidePanelOpen] = useState(false);
  const [currentSwapSlot, setCurrentSwapSlot] = useState<typeof ALL_SLOTS[number]['key'] | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [wasModified, setWasModified] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [lastLoggedDate, setLastLoggedDate] = useState<string | null>(null);
  const [isLoggedOutfitCurrent, setIsLoggedOutfitCurrent] = useState(true);
  // null = viewing today, ForecastDay = viewing a future day
  const [selectedDay, setSelectedDay] = useState<ForecastDay | null>(null);

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

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const log = recentLogs.find(l => l.date === today);

    if (log) {
      setLastLoggedDate(today);
      // Reconstruct outfit from log item IDs
      const items = log.item_ids.map(id => clothingItems.find(i => i.id === id)).filter(Boolean) as ClothingItem[];
      const reconstructed: OutfitSuggestion = {
        reasoning: "The outfit you're wearing today!",
        top: items.find(i => i.type === 'top') || null,
        bottom: items.find(i => i.type === 'bottom') || null,
        shoes: items.find(i => i.type === 'shoes') || null,
        outerwear: items.find(i => i.type === 'outerwear') || null,
        accessory1: items.filter(i => i.type === 'accessory')[0] || null,
        accessory2: items.filter(i => i.type === 'accessory')[1] || null,
      };
      setOutfit(reconstructed);
      setIsLoggedOutfitCurrent(true);
    } else {
      // If no log, try to load from localStorage (last generated suggestion)
      const saved = localStorage.getItem('drip_current_outfit');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Only use if outfit is not already set
          if (!outfit) {
            setOutfit(parsed);
            setIsLoggedOutfitCurrent(false);
          }
        } catch (e) {
          console.error("Failed to parse saved outfit", e);
        }
      }
    }
  }, [recentLogs, clothingItems]);

  // Save to localStorage whenever outfit changes manually or by AI
  useEffect(() => {
    if (outfit && !outfitLoading) {
      localStorage.setItem('drip_current_outfit', JSON.stringify(outfit));
    }
  }, [outfit, outfitLoading]);

  // When a future day is selected, generate outfit using that day's weather
  const generateOutfit = useCallback(
    async (moodText?: string, forecastDay?: ForecastDay | null) => {
      if (clothingItems.length === 0) return;
      setOutfitLoading(true);
      const weatherForGeneration = forecastDay
        ? { ...weather, temp: (forecastDay.tempMax + forecastDay.tempMin) / 2, description: forecastDay.description, icon: forecastDay.icon }
        : weather;
      try {
        const res = await fetch('/api/generate-outfit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mood: moodText,
            weather: weatherForGeneration,
            seed: Math.random()
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.error) {
            setOutfit(data);
            setWasModified(false);
            setIsLoggedOutfitCurrent(false);
          }
        }
      } catch (err) {
        console.error('Failed to generate outfit:', err);
      } finally {
        setOutfitLoading(false);
      }
    },
    [weather, clothingItems.length]
  );

  // When the user taps a day in the forecast bar
  const handleSelectDay = (day: ForecastDay | null) => {
    setSelectedDay(day);
    // Immediately generate an outfit optimised for that day
    generateOutfit(mood || undefined, day);
  };

  const handleSwapPiece = (slot: typeof ALL_SLOTS[number]['key']) => {
    setCurrentSwapSlot(slot);
    setIsSwapModalOpen(true);
  };

  const getAlternatives = () => {
    if (!currentSwapSlot || !weather) return [];

    const recentItemIds = recentLogs.flatMap((log) => log.item_ids);
    return getSwapAlternatives(clothingItems, currentSwapSlot, {
      weather,
      lifestyle: profile.lifestyle ?? null,
      recentItemIds,
      lat: profile.lat ?? 40,
    });
  };

  const handleSelectAlternative = (item: ClothingItem | null) => {
    if (!outfit || !currentSwapSlot) return;

    setOutfit({
      ...outfit,
      [currentSwapSlot]: item,
    });
    setWasModified(true);
    setIsLoggedOutfitCurrent(false);
    setIsSwapModalOpen(false);
  };

  const handleLogOutfit = async () => {
    if (!outfit || isLogging) return;

    setIsLogging(true);
    try {
      const itemIds = [
        outfit.top?.id,
        outfit.bottom?.id,
        outfit.shoes?.id,
        outfit.outerwear?.id,
        outfit.accessory1?.id,
        outfit.accessory2?.id,
      ].filter(Boolean) as string[];

      const weatherSnapshot: WeatherSnapshot | null = weather ? {
        temp: weather.temp,
        feels_like: weather.feels_like,
        description: weather.description,
        icon: weather.icon,
        precipitation_chance: weather.precipitation_chance
      } : null;

      const result = await logOutfit(itemIds, weatherSnapshot, mood || null, wasModified);
      if (result.success) {
        setLastLoggedDate(new Date().toISOString().split('T')[0]);
        setIsLoggedOutfitCurrent(true);
        // Toast or success state?
      } else {
        alert(result.error || 'Failed to log outfit');
      }
    } catch (err) {
      console.error('Logging error:', err);
    } finally {
      setIsLogging(false);
    }
  };

  const handleUnlog = async () => {
    if (isLogging) return;
    setIsLogging(true);
    try {
      const result = await unlogOutfit();
      if (result.success) {
        setLastLoggedDate(null);
      } else {
        alert(result.error || 'Failed to undo');
      }
    } catch (err) {
      console.error('Unlog error:', err);
    } finally {
      setIsLogging(false);
    }
  };

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mood.trim()) generateOutfit(mood.trim());
  };



  if (clothingItems.length === 0) {
    return (
      <div className={styles.dashboardRoot}>
        <Header profile={profile} />
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
      <Header profile={profile} />

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
            {/* Top Weather Section */}
            <div className={styles.weatherSection}>
              {/* Today's Weather */}
              <div className={styles.currentWeatherContainer}>
                <div className={styles.todayWeatherHeader}>
                  <span className={styles.todayWeatherLabel}>Today's Weather</span>
                  {weather?.city && (
                    <>
                      <span className={styles.weatherDot}>•</span>
                      <span className={styles.cityLabel}>{weather.city}</span>
                    </>
                  )}
                </div>
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
              </div>

              {/* 7-Day Forecast Bar */}
              {weather?.forecast && weather.forecast.length > 0 && (
                <div className={styles.forecastContainer}>
                  <ForecastBar
                    forecast={weather.forecast}
                    selectedDate={selectedDay?.date ?? null}
                    onSelectDay={handleSelectDay}
                  />
                </div>
              )}
            </div>

            {/* Planning banner for future days */}
            {selectedDay && (
              <div className={styles.planningBanner}>
                <span className={styles.planningEmoji}>
                  {selectedDay.description.includes('rain') || selectedDay.description.includes('drizzle') ? '🌧️'
                    : selectedDay.description.includes('cloud') ? '☁️'
                      : selectedDay.description.includes('snow') ? '❄️'
                        : '☀️'}
                </span>
                <div className={styles.planningText}>
                  <span className={styles.planningTitle}>Planning for {selectedDay.day}</span>
                  <span className={styles.planningSubtitle}>{selectedDay.tempMax}° high • {selectedDay.description}</span>
                </div>
              </div>
            )}

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
                    <div className={styles.outfitGrid}>
                      <div className={styles.mandatoryColumn}>
                        {MANDATORY_SLOTS.map(({ key, label, icon: Icon }) => {
                          const item = (outfit as any)?.[key] ?? null;

                          // Smart Hiding: Skip bottom slot if top is a one-piece
                          if (key === 'bottom' && isOnePiece((outfit as any)?.top ?? null)) {
                            return null;
                          }

                          return (
                            <div
                              key={key}
                              className={`
                                ${styles.outfitSlot} 
                                ${item ? styles.outfitSlotFilled : ''} 
                                ${!outfitLoading ? styles.outfitSlotClickable : ''}
                                ${isOnePiece(item) ? styles.outfitSlotOnePiece : ''}
                              `}
                              onClick={() => !outfitLoading && handleSwapPiece(key)}
                              title={`Swap ${label}`}
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
                      </div>

                      <div className={styles.optionalColumn}>
                        {OPTIONAL_SLOTS.map(({ key, label, icon: Icon }) => {
                          const item = (outfit as any)?.[key] ?? null;
                          return (
                            <div
                              key={key}
                              className={`
                                ${styles.outfitSlot} 
                                ${styles.outfitSlotOptional}
                                ${item ? styles.outfitSlotFilled : ''} 
                                ${!outfitLoading ? styles.outfitSlotClickable : ''}
                              `}
                              onClick={() => !outfitLoading && handleSwapPiece(key)}
                              title={`Swap ${label}`}
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
                                  <Icon size={16} className={styles.outfitSlotEmptyIcon} />
                                  <span style={{ fontSize: '0.65rem' }}>{label}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}

            {/* Action Bar */}
            {outfit && !outfitLoading && (
              <div className={styles.actionSection}>
                {/* Future day: show a friendly note instead of log buttons */}
                {selectedDay ? (
                  <div className={styles.planningNote}>
                    <span>This is a preview for {selectedDay.day} — come back on the day to log it! 🗓️</span>
                    <button className={styles.unlogButton} onClick={() => handleSelectDay(null)}>
                      Back to Today
                    </button>
                  </div>
                ) : lastLoggedDate === new Date().toISOString().split('T')[0] && isLoggedOutfitCurrent ? (
                  <div className={styles.loggedState}>
                    <div className={styles.loggedBadge}>
                      <CheckCircle2 size={18} />
                      <span>Outfit Logged for Today!</span>
                    </div>
                    <button
                      className={styles.unlogButton}
                      onClick={handleUnlog}
                      disabled={isLogging}
                    >
                      <Undo2 size={14} />
                      <span>Changed my mind</span>
                    </button>
                  </div>
                ) : (
                  <div className={styles.actionGrid}>
                    <button
                      className={`${styles.button} ${styles.buttonOutline}`}
                      onClick={() => generateOutfit()}
                      disabled={isLogging}
                    >
                      <RefreshCw size={16} />
                      Regenerate
                    </button>

                    <button
                      className={`${styles.button} ${styles.buttonAccent}`}
                      onClick={handleLogOutfit}
                      disabled={isLogging}
                    >
                      {isLogging ? (
                        <div className={styles.spinnerSmall} />
                      ) : (
                        <Check size={16} />
                      )}
                      {lastLoggedDate === new Date().toISOString().split('T')[0] ? 'Change to this outfit' : "I'm Wearing This"}
                    </button>
                  </div>
                )}
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

      {/* Piece Swap Modal */}
      <PieceSwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        category={currentSwapSlot || ''}
        items={getAlternatives()}
        currentId={currentSwapSlot ? outfit?.[currentSwapSlot]?.id : undefined}
        onSelect={handleSelectAlternative}
      />
    </div>
  );
}


