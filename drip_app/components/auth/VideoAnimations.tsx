'use client';

import styles from './auth.module.css';

export function VideoAnimations() {
  return (
    <div className={styles.videosContainer}>
      <video
        className={`${styles.videoItem} ${styles.videoWave}`}
        autoPlay
        muted
        playsInline
        loop
      >
        <source src="/assets/characters/animations/2-swing.webm" type="video/webm" />
      </video>
      <video
        className={`${styles.videoItem} ${styles.videoSwing}`}
        autoPlay
        muted
        playsInline
        loop
      >
        <source src="/assets/characters/animations/1-wave.webm" type="video/webm" />
      </video>
    </div>
  );
}
