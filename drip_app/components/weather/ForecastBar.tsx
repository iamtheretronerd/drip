'use client';

import { useState } from 'react';
import type { ForecastDay } from '@/types/weather';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ForecastBar.module.css';

interface ForecastBarProps {
    forecast: ForecastDay[];
    selectedDate: string | null; // null = today
    onSelectDay: (day: ForecastDay | null) => void;
}

export function ForecastBar({ forecast, selectedDate, onSelectDay }: ForecastBarProps) {
    const [startIndex, setStartIndex] = useState(0);

    if (!forecast || forecast.length === 0) return null;

    const itemsPerPage = 5;
    const maxStartIndex = Math.max(0, forecast.length - itemsPerPage);
    const visibleForecast = forecast.slice(startIndex, startIndex + itemsPerPage);

    const handleNext = () => setStartIndex(i => Math.min(i + 1, maxStartIndex));
    const handlePrev = () => setStartIndex(i => Math.max(i - 1, 0));

    return (
        <div className={styles.wrapper}>
            <p className={styles.label}>Plan ahead ✨</p>
            <div className={styles.carouselContainer}>
                {startIndex > 0 ? (
                    <button className={styles.navButton} onClick={handlePrev} aria-label="Previous days">
                        <ChevronLeft size={16} />
                    </button>
                ) : (
                    <div className={styles.navPlaceholder} />
                )}

                <div className={styles.strip}>
                    {visibleForecast.map((day) => {
                        const isSelected = selectedDate === day.date || (selectedDate === null && day.isToday);
                        return (
                            <button
                                key={day.date}
                                className={`${styles.pill} ${day.isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                                onClick={() => onSelectDay(day.isToday ? null : day)}
                                aria-label={`View outfit for ${day.day}, high ${day.tempMax}°`}
                            >
                                <span className={styles.dayLabel}>{day.day}</span>
                                <img
                                    src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                                    alt={day.description}
                                    className={styles.icon}
                                />
                                <span className={styles.high}>{day.tempMax}°</span>
                                <span className={styles.low}>{day.tempMin}°</span>
                                {day.precipChance > 30 && (
                                    <span className={styles.rain}>💧 {day.precipChance}%</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {startIndex < maxStartIndex ? (
                    <button className={styles.navButton} onClick={handleNext} aria-label="Next days">
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <div className={styles.navPlaceholder} />
                )}
            </div>
        </div>
    );
}
