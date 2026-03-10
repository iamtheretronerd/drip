'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    X,
    Calendar as CalendarIcon,
    CloudRain,
    Wind,
    Droplets,
    Shirt,
    Sparkles,
    Info,
    Plus,
    Check,
    CheckCircle2
} from 'lucide-react';
import { Header } from '@/components/shared/Header';
import type { ClothingItem, OutfitLog, Profile } from '@/types/database';
import { logOutfit } from '@/lib/actions/outfit_logs';
import styles from './history.module.css';

interface HistoryClientProps {
    profile: Profile;
    clothingItems: ClothingItem[];
    outfitLogs: OutfitLog[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function HistoryClient({ profile, clothingItems, outfitLogs }: HistoryClientProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isLogging, setIsLogging] = useState(false);
    const [selectedLog, setSelectedLog] = useState<OutfitLog | null>(null);
    const [retroLogDate, setRetroLogDate] = useState<string | null>(null);
    const [retroSelectedIds, setRetroSelectedIds] = useState<string[]>([]);
    const [backfilledWeather, setBackfilledWeather] = useState<Record<string, any>>({});

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Calendar calculations
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Map items for easy lookup
    const itemMap = useMemo(() => {
        return new Map(clothingItems.map(item => [item.id, item]));
    }, [clothingItems]);

    // Group logs by date string (YYYY-MM-DD)
    const logsByDate = useMemo(() => {
        const map = new Map<string, OutfitLog>();
        outfitLogs.forEach(log => {
            // date is usually YYYY-MM-DD
            // If multiple logs exist for one day, show the first (newest) one
            if (!map.has(log.date)) {
                map.set(log.date, log);
            }
        });
        return map;
    }, [outfitLogs]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const calendarDays = useMemo(() => {
        const days = [];

        // Padding for start of month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, dateStr: null });
        }

        // Actual days
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            // Format to YYYY-MM-DD manually to avoid timezone shifts
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({ day: i, dateStr });
        }

        return days;
    }, [year, month, firstDayOfMonth, daysInMonth]);

    const closeDetail = () => {
        setSelectedLog(null);
    };

    // Effect to backfill missing weather in the history detail view
    useEffect(() => {
        if (!selectedLog || selectedLog.weather_snapshot || backfilledWeather[selectedLog.id]) return;

        async function fetchMissingWeather() {
            if (!profile.lat || !profile.lon || !selectedLog) return;
            try {
                const unix = Math.floor(new Date(`${selectedLog.date}T12:00:00Z`).getTime() / 1000);
                const res = await fetch(`/api/weather?lat=${profile.lat}&lon=${profile.lon}&dt=${unix}`);
                if (res.ok) {
                    const data = await res.json();
                    setBackfilledWeather(prev => ({ ...prev, [selectedLog!.id]: data }));
                }
            } catch (err) {
                console.error("Failed to backfill missing weather", err);
            }
        }
        fetchMissingWeather();
    }, [selectedLog, profile.lat, profile.lon, backfilledWeather]);

    const closeRetroLog = () => {
        setRetroLogDate(null);
        setRetroSelectedIds([]);
    };

    const handleRetroLogToggle = (id: string) => {
        setRetroSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSaveRetroLog = async () => {
        if (!retroLogDate || retroSelectedIds.length === 0 || isLogging) return;

        setIsLogging(true);
        try {
            // Attempt to fetch historical weather
            let pastWeather = null;
            if (profile.lat && profile.lon) {
                try {
                    // convert YYYY-MM-DD to unix timestamp (noon UTC is safest)
                    const unix = Math.floor(new Date(`${retroLogDate}T12:00:00Z`).getTime() / 1000);
                    const wRes = await fetch(`/api/weather?lat=${profile.lat}&lon=${profile.lon}&dt=${unix}`);
                    if (wRes.ok) {
                        pastWeather = await wRes.json();
                    }
                } catch (e) {
                    console.error("Historical weather fetch failed", e);
                }
            }

            // Pass 'Historical log' so it explicitly marks it as manual
            const result = await logOutfit(retroSelectedIds, pastWeather, 'Historical log', true, retroLogDate);
            if (result.success) {
                closeRetroLog();
                window.location.reload(); // Refresh to show new log
            } else {
                alert(result.error || 'Failed to log outfit');
            }
        } catch (err) {
            console.error('Retro-log error:', err);
        } finally {
            setIsLogging(false);
        }
    };

    const groupedWardrobe = useMemo(() => {
        const groups = {
            top: [] as ClothingItem[],
            bottom: [] as ClothingItem[],
            shoes: [] as ClothingItem[],
            outerwear: [] as ClothingItem[],
            accessory: [] as ClothingItem[],
        };
        clothingItems.forEach(item => {
            if (groups[item.type as keyof typeof groups]) {
                groups[item.type as keyof typeof groups].push(item);
            }
        });
        return groups;
    }, [clothingItems]);

    return (
        <div className={styles.historyRoot}>
            <Header profile={profile} />
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Your History</h1>
                    <p className={styles.subtitle}>Track what you wore and when.</p>
                </header>

                <section className={styles.controls}>
                    <div className={styles.currentMonth}>
                        {MONTHS[month]} {year}
                    </div>
                    <div className={styles.navButtons}>
                        <button className={styles.navButton} onClick={handlePrevMonth}>
                            <ChevronLeft size={20} />
                        </button>
                        <button className={styles.navButton} onClick={handleNextMonth}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </section>

                <main className={styles.calendarGrid}>
                    {WEEKDAYS.map(day => (
                        <div key={day} className={styles.weekdayHeader}>{day}</div>
                    ))}

                    {calendarDays.map((dayObj, index) => {
                        if (!dayObj.day) return <div key={`empty-${index}`} className={styles.dayCell} />;

                        const log = dayObj.dateStr ? logsByDate.get(dayObj.dateStr) : null;

                        const cellDate = new Date(year, month, dayObj.day);
                        const todayDate = new Date();
                        todayDate.setHours(0, 0, 0, 0);

                        const isToday = todayDate.getTime() === cellDate.getTime();
                        const isFuture = cellDate.getTime() > todayDate.getTime();

                        return (
                            <div
                                key={dayObj.dateStr}
                                className={`
                  ${styles.dayCell} 
                  ${isToday ? styles.dayCellToday : ''} 
                  ${log ? styles.dayCellHasOutfit : ''}
                  ${isFuture && !log ? styles.dayCellFuture : ''}
                `}
                                onClick={() => {
                                    if (log) {
                                        setSelectedLog(log);
                                    } else if (dayObj.dateStr && !isFuture) {
                                        setRetroLogDate(dayObj.dateStr);
                                    }
                                }}
                            >
                                <span className={styles.dayNumber}>{dayObj.day}</span>

                                {!log && dayObj.dateStr && !isFuture && (
                                    <Plus size={16} className={styles.addIcon} />
                                )}

                                {log && (
                                    <>
                                        <div className={styles.outfitDot} />
                                        <div className={styles.outfitPreview}>
                                            {log.item_ids.slice(0, 4).map(id => {
                                                const item = itemMap.get(id);
                                                if (!item) return null;
                                                return (
                                                    <img
                                                        key={id}
                                                        src={item.photo_url}
                                                        alt=""
                                                        className={styles.previewThumb}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </main>
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className={styles.detailOverlay} onClick={closeDetail}>
                    <div className={styles.detailContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeButton} onClick={closeDetail}>
                            <X size={24} />
                        </button>

                        <div className={styles.detailHeader}>
                            <h2 className={styles.detailDate}>
                                {new Date(selectedLog.date + 'T00:00:00').toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h2>
                        </div>

                        <div className={styles.detailBody}>
                            <section className={styles.itemsSection}>
                                <div className={styles.sidebarSectionHeader}>The Look</div>
                                <div className={styles.itemsGrid}>
                                    {selectedLog.item_ids.map(id => {
                                        const item = itemMap.get(id);
                                        if (!item) return null;
                                        return (
                                            <div key={id} className={styles.itemCard}>
                                                <img src={item.photo_url} alt={item.name || 'Item'} className={styles.itemImage} />
                                                <div className={styles.itemInfo}>
                                                    <span className={styles.itemType}>{item.type}</span>
                                                    <span className={styles.itemName}>{item.name || item.sub_type || 'Unnamed Piece'}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            <aside className={styles.detailSidebar}>
                                {(selectedLog.weather_snapshot || backfilledWeather[selectedLog.id]) && (
                                    <div>
                                        <div className={styles.sidebarSectionHeader}>Weather Conditions</div>
                                        <div className={styles.weatherBanner}>
                                            <img
                                                src={`https://openweathermap.org/img/wn/${(selectedLog.weather_snapshot || backfilledWeather[selectedLog.id]).icon}@2x.png`}
                                                alt=""
                                                className={styles.weatherIcon}
                                            />
                                            <div className={styles.weatherInfo}>
                                                <span className={styles.weatherTemp}>{Math.round((selectedLog.weather_snapshot || backfilledWeather[selectedLog.id]).temp)}°C</span>
                                                <span className={styles.weatherDesc}>{(selectedLog.weather_snapshot || backfilledWeather[selectedLog.id]).description}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className={styles.sidebarSectionHeader}>Log Details</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                                            <Info size={16} />
                                            <span style={{ fontSize: '0.9rem' }}>
                                                {selectedLog.mood_input === 'Historical log'
                                                    ? 'Logged manually by you'
                                                    : selectedLog.was_modified
                                                        ? 'Personalized choice'
                                                        : 'Original AI suggestion'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            )}

            {/* Retro Log Modal */}
            {retroLogDate && (
                <div className={styles.detailOverlay} onClick={closeRetroLog}>
                    <div
                        className={`${styles.detailContent} ${styles.retroLogModal}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <header className={styles.detailHeader}>
                            <div className={styles.detailHeaderLeft}>
                                <div className={styles.calendarBadge}>
                                    <CalendarIcon size={16} />
                                    <span>What did you wear on {retroLogDate}?</span>
                                </div>
                            </div>
                        </header>

                        <div className={styles.retroLogContent}>
                            {Object.entries(groupedWardrobe).map(([type, items]) => (
                                items.length > 0 && (
                                    <div key={type} className={styles.retroCategory}>
                                        <h3 className={styles.categoryTitle}>
                                            {type === 'top' && <Shirt size={16} />}
                                            {type}s
                                        </h3>
                                        <div className={styles.itemGrid}>
                                            {items.map(item => (
                                                <div
                                                    key={item.id}
                                                    className={`${styles.selectableItem} ${retroSelectedIds.includes(item.id) ? styles.itemSelected : ''}`}
                                                    onClick={() => handleRetroLogToggle(item.id)}
                                                >
                                                    <img src={item.photo_url} alt={item.name || ''} className={styles.itemImg} />
                                                    {retroSelectedIds.includes(item.id) && (
                                                        <div className={styles.selectedIcon}>
                                                            <Check size={14} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        <footer className={styles.retroFooter}>
                            <div className={styles.selectedCount}>
                                {retroSelectedIds.length} items selected
                            </div>
                            <button className={styles.cancelButton} onClick={closeRetroLog}>
                                Cancel
                            </button>
                            <button
                                className={styles.logButton}
                                onClick={handleSaveRetroLog}
                                disabled={isLogging || retroSelectedIds.length === 0}
                            >
                                {isLogging ? 'Logging...' : 'Confirm Log'}
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
