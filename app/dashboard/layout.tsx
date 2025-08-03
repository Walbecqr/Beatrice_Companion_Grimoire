'use client'

import { useSupabase } from '@/components/providers.tsx'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { PrefetchProvider } from '@/components/dashboard/prefetch-links'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useSupabase()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <PrefetchProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </PrefetchProvider>
  )
}
