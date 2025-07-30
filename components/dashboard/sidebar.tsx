'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  MessageCircle, 
  BookOpen, 
  Sparkles, 
  Moon,
  Calendar,
  Settings,
  LogOut,
  Search
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/chat', icon: MessageCircle, label: 'Chat with Beatrice' },
  { href: '/dashboard/journal', icon: BookOpen, label: 'Journal' },
  { href: '/dashboard/checkins', icon: Calendar, label: 'Daily Check-ins' },
  { href: '/dashboard/lunar-calendar', icon: Moon, label: 'Lunar Calendar' },
  { href: '/dashboard/rituals', icon: Sparkles, label: 'Rituals' },
  { href: '/dashboard/correspondences', icon: Search, label: 'Correspondences' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="w-64 bg-gray-900/50 backdrop-blur-md border-r border-purple-500/20 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-purple-500/20">
        <div className="flex items-center space-x-3">
          <Moon className="w-8 h-8 text-purple-300" />
          <span className="text-xl font-semibold text-gradient">Beatrice</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-purple-500/20">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 w-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}