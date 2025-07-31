'use client'

import Link from 'next/link'
import { 
  MessageCircle, 
  BookOpen, 
  Moon, 
  Sparkles, 
  Calendar,
  Hash,
  Settings,
  ArrowRight,
  Heart
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Sacred Dashboard</h1>
        <p className="text-gray-400">Welcome to your mystical companion</p>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Chat with Beatrice Card */}
        <Link href="/dashboard/chat" className="card-mystical p-6 hover:bg-gray-800/70 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Chat with Beatrice</h3>
              <p className="text-gray-400 text-sm">Start a new spiritual conversation</p>
            </div>
            <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Sacred Journal Card */}
        <Link href="/dashboard/journal" className="card-mystical p-6 hover:bg-gray-800/70 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Sacred Journal</h3>
              <p className="text-gray-400 text-sm">Record your spiritual journey</p>
            </div>
            <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Lunar Calendar Card */}
        <Link href="/dashboard/lunar-calendar" className="card-mystical p-6 hover:bg-gray-800/70 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Moon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Lunar Calendar</h3>
              <p className="text-gray-400 text-sm">Moon phases & celestial guidance</p>
            </div>
            <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Correspondences Card */}
        <Link href="/dashboard/correspondences" className="card-mystical p-6 hover:bg-gray-800/70 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Correspondences</h3>
              <p className="text-gray-400 text-sm">Magical associations & meanings</p>
            </div>
            <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Rituals Card */}
        <Link href="/dashboard/rituals" className="card-mystical p-6 hover:bg-gray-800/70 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Rituals</h3>
              <p className="text-gray-400 text-sm">Create & track sacred practices</p>
            </div>
            <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Grimoire Card */}
        <Link href="/dashboard/grimoire" className="card-mystical p-6 hover:bg-gray-800/70 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Grimoire</h3>
              <p className="text-gray-400 text-sm">Your personal book of shadows</p>
            </div>
            <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Check-ins Card */}
        <Link href="/dashboard/checkins" className="card-mystical p-6 hover:bg-gray-800/70 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Energy Check-ins</h3>
              <p className="text-gray-400 text-sm">Track your spiritual wellbeing</p>
            </div>
            <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        {/* Settings Card */}
        <Link href="/dashboard/settings" className="card-mystical p-6 hover:bg-gray-800/70 transition-colors group">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Settings</h3>
              <p className="text-gray-400 text-sm">Customize your experience</p>
            </div>
            <div className="text-purple-400 group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="card-mystical p-6">
          <p className="text-gray-400 text-center py-8">
            Your recent spiritual activities will appear here
          </p>
        </div>
      </div>
    </div>
  )
}