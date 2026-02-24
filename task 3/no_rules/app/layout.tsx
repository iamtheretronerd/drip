import type { Metadata } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './index.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Drip - Wardrobe Management',
  description: "Let's get dressed.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable}`}>
        {children}
      </body>
    </html>
  )
}
