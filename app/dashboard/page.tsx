import { Suspense } from 'react'
import { fetchDashboardData } from '@/lib/utils/dashboard-data'
import { DashboardStatsGrid, WeeklyStatsCard, MoonPhaseCard } from '@/components/dashboard/dashboard-stats'
import { RecentActivityCard } from '@/components/dashboard/recent-activity'
import { SmartNavCard } from '@/components/dashboard/prefetch-links'

// Navigation cards data with icon names instead of components
const navigationCards = [
  {
    href: '/dashboard/chat',
    title: 'Chat with Beatrice',
    description: 'Start a new spiritual conversation',
    iconName: 'MessageCircle' as const,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    href: '/dashboard/journal',
    title: 'Sacred Journal',
    description: 'Record your spiritual journey',
    iconName: 'BookOpen' as const,
    gradient: 'from-blue-500 to-purple-500',
  },
  {
    href: '/dashboard/lunar-calendar',
    title: 'Lunar Calendar',
    description: 'Moon phases & celestial guidance',
    iconName: 'Moon' as const,
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    href: '/dashboard/correspondences',
    title: 'Correspondences',
    description: 'Magical associations & meanings',
    iconName: 'Hash' as const,
    gradient: 'from-green-500 to-teal-500',
  },
  {
    href: '/dashboard/rituals',
    title: 'Rituals',
    description: 'Create & track sacred practices',
    iconName: 'Sparkles' as const,
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    href: '/dashboard/grimoire',
    title: 'Grimoire',
    description: 'Your personal book of shadows',
    iconName: 'BookOpen' as const,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    href: '/dashboard/checkins',
    title: 'Energy Check-ins',
    description: 'Track your spiritual wellbeing',
    iconName: 'Heart' as const,
    gradient: 'from-red-500 to-pink-500',
  },
  {
    href: '/dashboard/settings',
    title: 'Settings',
    description: 'Customize your experience',
    iconName: 'Settings' as const,
    gradient: 'from-gray-500 to-gray-600',
  },
]

// Loading components for Suspense boundaries
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card-mystical p-4 text-center animate-pulse">
          <div className="w-12 h-12 bg-purple-600/30 rounded-full mx-auto mb-3" />
          <div className="w-16 h-6 bg-purple-600/30 rounded mx-auto mb-2" />
          <div className="w-20 h-4 bg-purple-600/20 rounded mx-auto" />
        </div>
      ))}
    </div>
  )
}

function ActivityLoading() {
  return (
    <div className="card-mystical p-6">
      <div className="w-32 h-6 bg-purple-600/30 rounded animate-pulse mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
            <div className="w-8 h-8 bg-purple-600/30 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="w-32 h-4 bg-purple-600/30 rounded" />
              <div className="w-48 h-3 bg-purple-600/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


// Server component for sidebar stats
async function SidebarStats() {
  const stats = await fetchDashboardData()
  
  return (
    <div className="space-y-6">
      <MoonPhaseCard stats={stats} />
      <WeeklyStatsCard stats={stats} />
    </div>
  )

}

export default async function DashboardPage() {
  // Fetch once and pass to components via props to avoid multiple fetches
  const stats = await fetchDashboardData()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Sacred Dashboard</h1>
        <p className="text-gray-400">Welcome to your mystical companion</p>
      </div>

      {/* Dashboard Stats */}
      <Suspense fallback={<StatsLoading />}>
        <DashboardStatsGrid stats={stats} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Primary Actions Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {navigationCards.map((card) => (
                <SmartNavCard
                  key={card.href}
                  href={card.href}
                  title={card.title}
                  description={card.description}
                  iconName={card.iconName}
                  gradient={card.gradient}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Suspense fallback={<ActivityLoading />}>
              <RecentActivityCard activities={stats.recentActivity} />
            </Suspense>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="card-mystical p-6 animate-pulse">
                  <div className="w-32 h-6 bg-purple-600/30 rounded mb-4" />
                  <div className="w-20 h-20 bg-purple-600/20 rounded-full mx-auto mb-4" />
                  <div className="w-24 h-4 bg-purple-600/30 rounded mx-auto" />
                </div>
                <div className="card-mystical p-6 animate-pulse">
                  <div className="w-36 h-6 bg-purple-600/30 rounded mb-4" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div className="w-20 h-4 bg-purple-600/20 rounded" />
                        <div className="w-8 h-4 bg-purple-600/30 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
          >
            <SidebarStats />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
