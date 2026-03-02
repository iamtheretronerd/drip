import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Drip — Your Weather-Smart Wardrobe',
  description: 'Drip helps you decide what to wear every day based on weather, mood, and your personal style.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
