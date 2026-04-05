import type { Metadata } from 'next'
import { Instrument_Serif, Inter } from 'next/font/google'

import './globals.css'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-instrument',
})

const inter = Inter({
  weight: '300',
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Snapd — Instant Alertness',
  description: 'Instant alertness. No caffeine. No crash.',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${instrumentSerif.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
