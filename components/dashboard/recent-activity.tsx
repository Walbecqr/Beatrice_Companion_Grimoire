import { BookOpen, Hash, Heart, MessageCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { RecentActivity } from '@/lib/utils/dashboard-data'

interface RecentActivityProps {
  activities: RecentActivity[]
}

export function RecentActivityCard({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'journal':
        return <BookOpen className="w-4 h-4 text-blue-400" />
      case 'correspondence':
        return <Hash className="w-4 h-4 text-green-400" />
      case 'ritual':
        return <Sparkles className="w-4 h-4 text-purple-400" />
      case 'checkin':
        return <Heart className="w-4 h-4 text-pink-400" />
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-indigo-400" />
      default:
        return <BookOpen className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'journal':
        return 'bg-blue-500/20'
      case 'correspondence':
        return 'bg-green-500/20'
      case 'ritual':
        return 'bg-purple-500/20'
      case 'checkin':
        return 'bg-pink-500/20'
      case 'chat':
        return 'bg-indigo-500/20'
      default:
        return 'bg-gray-500/20'
    }
  }

  if (activities.length === 0) {
    return (
      <div className="card-mystical p-6">
        <h3 className="text-lg font-semibold mb-4 text-gradient">Recent Activity</h3>
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-gray-400 mb-4">Your spiritual journey is just beginning</p>
          <p className="text-sm text-gray-500">Start exploring to see your activities here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card-mystical p-6">
      <h3 className="text-lg font-semibold mb-4 text-gradient">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <Link
            key={`${activity.type}-${activity.id}`}
            href={activity.href}
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 capitalize">
                  {activity.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {activities.length >= 8 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <Link 
            href="/dashboard/history" 
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all activity →
          </Link>
        </div>
      )}
    </div>
  )
}