'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, User } from 'lucide-react'
import { getMoonPhase } from '@/lib/utils/moon-phase'
import { format } from 'date-fns'

export function Header() {
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(data)
    }

    fetchProfile()
  }, [supabase])

  return (
    <header className="bg-gray-900/30 backdrop-blur-sm border-b border-purple-500/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="text-xs text-purple-300 mt-1">
            {getMoonPhase(new Date())}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium">
                {profile?.display_name || 'Seeker'}
              </p>
              <p className="text-xs text-gray-400">
                {profile?.spiritual_path || 'Exploring the mysteries'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}