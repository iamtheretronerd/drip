'use client';

import { Home, Shirt, History, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/lib/actions/auth';
import type { Profile } from '@/types/database';
import styles from './header.module.css';

interface HeaderProps {
  profile: Profile;
}

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname();
  const userInitial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : (profile.email ? profile.email.charAt(0).toUpperCase() : 'U');

  const navLinks = [
    { href: '/dashboard', label: 'Today', icon: Home },
    { href: '/wardrobe', label: 'Wardrobe', icon: Shirt },
    { href: '/history', label: 'History', icon: History },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/dashboard" className={styles.logo}>DR!P</Link>

        <nav className={styles.navLinks}>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ''}`}
            >
              <Icon size={16} className={styles.navIcon} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <div className={styles.userMenu}>
            <span className={styles.userName}>{profile.full_name || 'My Wardrobe'}</span>
            <div className={styles.userAvatar}>{userInitial}</div>
          </div>

          <form action={async () => {
            localStorage.removeItem('drip_weekly_outfits');
            localStorage.removeItem('drip_current_outfit');
            await logout();
          }}>
            <button type="submit" className={styles.logoutButton}>
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
