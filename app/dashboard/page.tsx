'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Moon, BookOpen, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { getMoonPhase } from '@/lib/utils/moon-phase'
import { DailyCheckinWidget } from '@/components/dashboard/daily-checkin-widget'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [recentEntries, setRecentEntries] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    // Get user profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setProfile(profileData)

    // Fetch recent journal entries
    const { data: entries } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    setRecentEntries(entries || [])
  }

  const currentMoonPhase = getMoonPhase(new Date())

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card-mystical">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">
              Welcome back, {profile?.display_name || 'Seeker'}
            </h1>
            <p className="text-gray-400">
              {format(new Date(), 'EEEE, MMMM d, yyyy')} • {currentMoonPhase}
            </p>
          </div>
          <Moon className="w-12 h-12 text-purple-300 moon-icon" />
        </div>
      </div>

      {/* Daily Check-in Widget */}
      <DailyCheckinWidget />

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/dashboard/chat" className="card-mystical hover:scale-105 transition-transform">
          <MessageCircle className="w-10 h-10 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Chat with Beatrice</h3>
          <p className="text-sm text-gray-400">
            Continue your conversation with Beatrice
          </p>
        </Link>

        <Link href="/dashboard/journal" className="card-mystical hover:scale-105 transition-transform">
          <BookOpen className="w-10 h-10 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold mb-1">New Journal Entry</h3>
          <p className="text-sm text-gray-400">
            Document your spiritual insights
          </p>
        </Link>

        <Link href="/dashboard/rituals" className="card-mystical hover:scale-105 transition-transform">
          <Sparkles className="w-10 h-10 text-purple-400 mb-3" />
          <h3 className="text-lg font-semibold mb-1">Log Ritual</h3>
          <p className="text-sm text-gray-400">
            Track your magical workings
          </p>
        </Link>
      </div>

      {/* Recent Journal Entries */}
      {recentEntries.length > 0 && (
        <div className="card-mystical">
          <h2 className="text-xl font-semibold mb-4">Recent Journal Entries</h2>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <Link 
                key={entry.id} 
                href={`/dashboard/journal/${entry.id}`}
                className="block p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
              >
                <h3 className="font-medium mb-1">{entry.title || 'Untitled Entry'}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{entry.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {format(new Date(entry.created_at), 'MMM d, yyyy')}
                  {entry.moon_phase && ` • ${entry.moon_phase}`}
                </p>
              </Link>
            ))}
          </div>
          <Link 
            href="/dashboard/journal" 
            className="text-purple-400 hover:text-purple-300 text-sm mt-4 inline-block"
          >
            View all entries →
          </Link>
        </div>
      )}

      {/* Daily Wisdom */}
      <div className="card-mystical bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Daily Wisdom</h3>
            <p className="text-gray-300 italic">
              "The moon does not fight. It attacks no one. It does not worry. 
              It does not try to crush others. It keeps to its course, 
              but by its very nature, it gently influences."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}