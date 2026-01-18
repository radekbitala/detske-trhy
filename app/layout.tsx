import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dětské trhy – Srdcem pro lepší svět',
  description: 'Registrace na Dětské trhy 24. května 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  )
}
