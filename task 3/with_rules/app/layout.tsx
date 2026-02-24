import type { Metadata } from 'next';
import { Inter, Abril_Fatface } from 'next/font/google';
import './index.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-ui' });
const displayFont = Abril_Fatface({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-fallback-serif'
});

export const metadata: Metadata = {
    title: 'Drip | Your Wardrobe App',
    description: 'Weather and mood-based outfit suggestions.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${displayFont.variable}`}>
                {children}
            </body>
        </html>
    );
}
