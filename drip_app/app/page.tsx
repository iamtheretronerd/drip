import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { logout } from '@/lib/actions/auth';
import Grainient from '@/components/Grainient';
import { Sparkles, ArrowRight, Zap, Shield } from 'lucide-react';
import styles from './landing.module.css';

export default async function LandingPage() {
  const supabase = await createClient();

  if (!supabase) {
    return (
      <div className={styles.root}>
        <div className={styles.background}>
          <Grainient
            color1="#FF9FFC"
            color2="#5227FF"
            color3="#B19EEF"
            timeSpeed={0.15}
            grainAmount={0.08}
          />
        </div>
        <div className={styles.overlay} />
        <div className={styles.content}>
          <div className={styles.card}>
            <h1 className={styles.logo}>DR!P</h1>
            <div className={styles.errorBox}>
              <h3>Configuration Required</h3>
              <p>
                Please add your Supabase credentials to <code>.env.local</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Show landing page for non-authenticated users
    return (
      <div className={styles.root}>
        <div className={styles.background}>
          <Grainient
            color1="#FF9FFC"
            color2="#5227FF"
            color3="#B19EEF"
            timeSpeed={0.15}
            grainAmount={0.08}
          />
        </div>
        <div className={styles.overlay} />
        
        <div className={styles.content}>
          <nav className={styles.nav}>
            <div className={styles.logoSmall}>DR!P</div>
            <div className={styles.navLinks}>
              <a href="/login" className={styles.navLink}>Sign In</a>
              <a href="/signup" className={styles.navButton}>Get Started</a>
            </div>
          </nav>
          
          <main className={styles.hero}>
            <div className={styles.heroBadge}>
              <Sparkles size={14} />
              <span>AI-Powered Style Assistant</span>
            </div>
            
            <h1 className={styles.heroTitle}>
              Never wonder what to wear again
            </h1>
            
            <p className={styles.heroSubtitle}>
              Get personalized outfit recommendations based on your wardrobe, mood, and the weather. 
              Let AI be your personal stylist.
            </p>
            
            <div className={styles.heroActions}>
              <a href="/signup" className={styles.primaryButton}>
                Start Your Style Journey
                <ArrowRight size={18} />
              </a>
              <a href="/login" className={styles.secondaryButton}>
                Already have an account?
              </a>
            </div>
            
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Sparkles size={20} />
                </div>
                <div className={styles.featureText}>
                  <strong>AI-Powered</strong>
                  <span>Smart recommendations</span>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Zap size={20} />
                </div>
                <div className={styles.featureText}>
                  <strong>Weather Aware</strong>
                  <span>Dress for conditions</span>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Shield size={20} />
                </div>
                <div className={styles.featureText}>
                  <strong>Your Wardrobe</strong>
                  <span>Upload your clothes</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // User is authenticated, redirect to dashboard
  redirect('/dashboard');
}
