import { BookOpen, Hash, Sparkles, Moon, TrendingUp, Heart } from 'lucide-react'
import { DashboardStats } from '@/lib/utils/dashboard-data'

interface DashboardStatsProps {
  stats: DashboardStats
}

export function DashboardStatsGrid({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Journal Entries */}
      <div className="card-mystical p-4 text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto mb-3">
          <BookOpen className="w-6 h-6 text-blue-400" />
        </div>
        <div className="text-2xl font-bold text-gradient">{stats.totalJournalEntries}</div>
        <div className="text-sm text-gray-400">Journal Entries</div>
      </div>

      {/* Total Correspondences */}
      <div className="card-mystical p-4 text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-full mx-auto mb-3">
          <Hash className="w-6 h-6 text-green-400" />
        </div>
        <div className="text-2xl font-bold text-gradient">{stats.totalCorrespondences}</div>
        <div className="text-sm text-gray-400">Correspondences</div>
      </div>

      {/* Current Moon Phase */}
      <div className="card-mystical p-4 text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full mx-auto mb-3">
          <Moon className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="text-lg font-bold text-gradient capitalize">{stats.currentMoonPhase.phase}</div>
        <div className="text-xs text-gray-400">{Math.round(stats.currentMoonPhase.illumination)}% Illuminated</div>
      </div>

      {/* Weekly Activity */}
      <div className="card-mystical p-4 text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full mx-auto mb-3">
          <TrendingUp className="w-6 h-6 text-pink-400" />
        </div>
        <div className="text-2xl font-bold text-gradient">{stats.weeklyStats.journalEntries + stats.weeklyStats.checkins}</div>
        <div className="text-sm text-gray-400">This Week</div>
      </div>
    </div>
  )
}

export function WeeklyStatsCard({ stats }: DashboardStatsProps) {
  return (
    <div className="card-mystical p-6">
      <h3 className="text-lg font-semibold mb-4 text-gradient">This Week's Journey</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-gray-300">Journal Entries</span>
          </div>
          <div className="text-lg font-semibold text-gradient">{stats.weeklyStats.journalEntries}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-500/20 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-pink-400" />
            </div>
            <span className="text-gray-300">Energy Check-ins</span>
          </div>
          <div className="text-lg font-semibold text-gradient">{stats.weeklyStats.checkins}</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-gray-300">Rituals Performed</span>
          </div>
          <div className="text-lg font-semibold text-gradient">{stats.weeklyStats.ritualsPerformed}</div>
        </div>
      </div>
    </div>
  )
}

export function MoonPhaseCard({ stats }: DashboardStatsProps) {
  const { currentMoonPhase } = stats
  
  return (
    <div className="card-mystical p-6 text-center">
      <h3 className="text-lg font-semibold mb-4 text-gradient">Lunar Guidance</h3>
      
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="w-full h-full bg-gradient-to-br from-indigo-800/30 to-purple-800/30 rounded-full border-2 border-indigo-400/30 flex items-center justify-center">
          <Moon className="w-8 h-8 text-indigo-400" />
        </div>
        <div className="absolute -inset-1 border border-indigo-400/20 rounded-full animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <div className="text-xl font-bold text-gradient capitalize">{currentMoonPhase.phase} Moon</div>
        <div className="text-sm text-gray-400">{Math.round(currentMoonPhase.illumination)}% Illuminated</div>
        
        {currentMoonPhase.daysUntilNext > 0 && (
          <div className="text-xs text-purple-300">
            {currentMoonPhase.nextPhase} in {currentMoonPhase.daysUntilNext} day{currentMoonPhase.daysUntilNext !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}