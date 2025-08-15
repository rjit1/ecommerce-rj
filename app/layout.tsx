import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'RJ4WEAR - Premium Fashion & Lifestyle Store',
    template: '%s | RJ4WEAR'
  },
  description: 'Discover premium quality fashion and lifestyle products at RJ4WEAR. Shop the latest trends in clothing, accessories, and more with fast delivery and great prices.',
  keywords: ['fashion', 'clothing', 'lifestyle', 'premium', 'online shopping', 'RJ4WEAR'],
  authors: [{ name: 'RJ4WEAR' }],
  creator: 'RJ4WEAR',
  publisher: 'RJ4WEAR',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'RJ4WEAR - Premium Fashion & Lifestyle Store',
    description: 'Discover premium quality fashion and lifestyle products at RJ4WEAR. Shop the latest trends with fast delivery.',
    siteName: 'RJ4WEAR',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RJ4WEAR - Premium Fashion Store',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RJ4WEAR - Premium Fashion & Lifestyle Store',
    description: 'Discover premium quality fashion and lifestyle products at RJ4WEAR.',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="theme-color" content="#87CEEB" />
        <meta name="msapplication-TileColor" content="#87CEEB" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}