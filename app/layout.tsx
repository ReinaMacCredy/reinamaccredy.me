import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Reina MacCredy - AI Engineering/Software Developer',
  description: 'Reina MacCredy',
  openGraph: {
    siteName: 'Reina MacCredy',
    title: 'Reina MacCredy - AI Engineering &Software Developer',
    description: 'AI Engineering & Software Engineering! Welcome to my digital realm~',
    url: 'https://reinamaccredy.me',
    images: [
      {
        url: 'https://reinamaccredy.me/assets/images/card.webp?v=9ba4655d',
        type: 'image/webp',
        width: 1280,
        height: 800,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: 'https://reinamaccredy.me',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?display=swap&family=Inter:ital,wght@0,300;1,300&family=Inria+Serif:ital,wght@0,700;1,700&family=Alexandria:ital,wght@0,100;1,100&family=Nothing+You+Could+Do:ital,wght@0,400;1,400" rel="stylesheet" type="text/css" />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />
        <link href="/assets/images/apple-touch-icon.webp?v=9ba4655d" rel="apple-touch-icon" />
        <noscript>
          <link rel="stylesheet" href="/css/noscript.css" />
        </noscript>
      </head>
      <body className="is-loading">
        {children}
      </body>
    </html>
  )
}

