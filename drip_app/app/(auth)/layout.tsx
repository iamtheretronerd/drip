import type { Metadata } from 'next';
import '../globals.css';
import styles from '../../components/auth/auth.module.css';

export const metadata: Metadata = {
    title: 'Drip — Sign In',
    description: 'Sign in or create your Drip account',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.authRoot}>
            <div className={styles.authCard}>
                <div className={styles.brand}>
                    <h1 className={styles.brandName}>drip.</h1>
                    <p className={styles.brandTagline}>Your weather-smart wardrobe</p>
                </div>
                {children}
            </div>
        </div>
    );
}
