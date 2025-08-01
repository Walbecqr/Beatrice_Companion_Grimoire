import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Beatrice's Sacred Companion",
  description: 'Your personal spiritual companion and guide',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950">
            <div className="constellation-bg">
              {children}
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}