import type { Metadata } from 'next';
import '../globals.css';
import styles from '@/components/auth/auth.module.css';
import Grainient from '@/components/Grainient';
import { VideoAnimations } from '@/components/auth/VideoAnimations';

export const metadata: Metadata = {
  title: 'DRIP — Sign In',
  description: 'Your weather-smart wardrobe. Sign in to discover outfits curated for your mood and the elements.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.authRoot}>
      <div className={styles.splitContainer}>
        {/* Left Side - Grainient with Video */}
        <div className={styles.visualSide}>
          <div className={styles.grainientBox}>
            {/* Grainient Background */}
            <div className={styles.grainientBackground}>
              <Grainient
                color1="#FF9FFC"
                color2="#5227FF"
                color3="#B19EEF"
                timeSpeed={1.35}
                warpFrequency={0}
                blendAngle={144}
                rotationAmount={500}
                zoom={0.9}
              />
            </div>
            {/* Video on top */}
            <div className={styles.videoOverlay}>
              <VideoAnimations />
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className={styles.formSide}>
          {children}
        </div>
      </div>
    </div>
  );
}
