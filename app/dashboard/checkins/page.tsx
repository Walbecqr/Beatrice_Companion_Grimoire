'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Sparkles, CheckCircle, Circle, TrendingUp } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'

interface DailyCheckin {
  id: string
  prompt: string
  response: string | null
  completed: boolean
  created_at: string
}

export default function CheckinsPage() {
  const [checkins, setCheckins] = useState<DailyCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCheckin, setSelectedCheckin] = useState<DailyCheckin | null>(null)
  const [streak, setStreak] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    fetchCheckins()
  }, [])

  const fetchCheckins = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30) // Last 30 days

      if (error) throw error
      
      setCheckins(data || [])
      calculateStreak(data || [])
    } catch (error) {
      console.error('Error fetching check-ins:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStreak = (checkinData: DailyCheckin[]) => {
    let currentStreak = 0
    const today = new Date()
    
    // Sort by date descending and check consecutive days
    const sortedCheckins = checkinData
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].created_at)
      const expectedDate = subDays(today, i)
      
      // Check if dates are on the same day
      if (
        checkinDate.getDate() === expectedDate.getDate() &&
        checkinDate.getMonth() === expectedDate.getMonth() &&
        checkinDate.getFullYear() === expectedDate.getFullYear()
      ) {
        currentStreak++
      } else {
        break
      }
    }
    
    setStreak(currentStreak)
  }

  const getCheckinsByWeek = () => {
    const weeks: { [key: string]: DailyCheckin[] } = {}
    
    checkins.forEach(checkin => {
      const date = new Date(checkin.created_at)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = format(weekStart, 'yyyy-MM-dd')
      
      if (!weeks[weekKey]) weeks[weekKey] = []
      weeks[weekKey].push(checkin)
    })
    
    return weeks
  }

  const completionRate = checkins.length > 0
    ? Math.round((checkins.filter(c => c.completed).length / checkins.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading your check-in history...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Daily Check-ins</h1>
        <p className="text-gray-400 mt-1">Your spiritual journey, one day at a time</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-mystical">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-purple-300">{streak} days</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="card-mystical">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-green-400">{completionRate}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="card-mystical">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Check-ins</p>
              <p className="text-2xl font-bold text-blue-400">{checkins.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Check-ins</h2>
        
        {checkins.length === 0 ? (
          <div className="card-mystical text-center py-12">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">No check-ins yet. Visit your dashboard to start!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {checkins.map((checkin) => (
              <div
                key={checkin.id}
                className="card-mystical hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCheckin(checkin)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {checkin.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500" />
                      )}
                      <span className="text-sm font-medium">
                        {format(new Date(checkin.created_at), 'EEEE, MMMM d')}
                      </span>
                    </div>
                    <p className="text-gray-300 italic mb-2">"{checkin.prompt}"</p>
                    {checkin.response && (
                      <p className="text-sm text-gray-400 line-clamp-2">{checkin.response}</p>
                    )}
                  </div>
                  <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0 ml-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCheckin && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedCheckin(null)}
        >
          <div 
            className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {format(new Date(selectedCheckin.created_at), 'EEEE, MMMM d, yyyy')}
              </h3>
              {selectedCheckin.completed ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-500" />
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Beatrice's Prompt:</p>
                <p className="text-gray-300 italic">"{selectedCheckin.prompt}"</p>
              </div>
              
              {selectedCheckin.response && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Your Response:</p>
                  <p className="text-gray-100 whitespace-pre-wrap">{selectedCheckin.response}</p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setSelectedCheckin(null)}
              className="btn-mystical mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}