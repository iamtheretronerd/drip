'use client';

import type { ForecastDay } from '@/types/weather';
import styles from './ForecastBar.module.css';

interface ForecastBarProps {
    forecast: ForecastDay[];
    selectedDate: string | null; // null = today
    onSelectDay: (day: ForecastDay | null) => void;
}

export function ForecastBar({ forecast, selectedDate, onSelectDay }: ForecastBarProps) {
    if (!forecast || forecast.length === 0) return null;

    return (
        <div className={styles.wrapper}>
            <p className={styles.label}>Plan ahead ✨</p>
            <div className={styles.strip}>
                {forecast.map((day) => {
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
        </div>
    );
}
