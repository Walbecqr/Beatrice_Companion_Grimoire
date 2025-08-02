// app/dashboard/lunar-calendar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronLeft, ChevronRight, Calendar, Plus, Sparkles, Info } from 'lucide-react'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { getMoonPhaseForDate, getUpcomingMoonPhases, MOON_PHASES } from '@/lib/utils/moon-calendar'

interface Ritual {
  id: string
  title: string
  performed_at: string
  intent: string | null
}

interface DayData {
  date: Date
  moonPhase: ReturnType<typeof getMoonPhaseForDate>
  rituals: Ritual[]
}

export default function LunarCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [monthData, setMonthData] = useState<DayData[]>([])
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [loading, setLoading] = useState(true)
  const [showPhaseInfo, setShowPhaseInfo] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchRituals()
  }, [])

  useEffect(() => {
    generateMonthData()
  }, [currentMonth, rituals])

  const fetchRituals = async () => {
    try {
      const { data, error } = await supabase
        .from('rituals')
        .select('id, title, performed_at, intent')
        .order('performed_at', { ascending: true })

      if (error) throw error
      setRituals(data || [])
    } catch (error) {
      console.error('Error fetching rituals:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthData = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start, end })

    const data = days.map(date => {
      const dayRituals = rituals.filter(ritual => 
        isSameDay(new Date(ritual.performed_at), date)
      )
      
      return {
        date,
        moonPhase: getMoonPhaseForDate(date),
        rituals: dayRituals
      }
    })

    setMonthData(data)
  }

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const goToToday = () => setCurrentMonth(new Date())

  const startingDayOfWeek = getDay(startOfMonth(currentMonth))
  const upcomingPhases = getUpcomingMoonPhases(60)

  const selectedDayData = selectedDate 
    ? monthData.find(day => isSameDay(day.date, selectedDate))
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Lunar Calendar</h1>
          <p className="text-gray-400 mt-1">Plan your rituals in harmony with the moon</p>
        </div>
        <button
          onClick={() => setShowPhaseInfo(!showPhaseInfo)}
          className="btn-mystical px-4 py-2 text-sm"
        >
          <Info className="w-4 h-4 mr-2" />
          Moon Phase Guide
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="card-mystical">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm text-purple-400 hover:text-purple-300"
            >
              Today
            </button>
            <button
              onClick={previousMonth}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for start of month */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {monthData.map(({ date, moonPhase, rituals }) => {
            const isToday = isSameDay(date, new Date())
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const hasRituals = rituals.length > 0

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
                  aspect-square p-2 rounded-lg border transition-all
                  ${isToday ? 'border-purple-500 bg-purple-900/20' : 'border-gray-800'}
                  ${isSelected ? 'ring-2 ring-purple-400 bg-purple-900/30' : ''}
                  ${!isSelected && !isToday ? 'hover:bg-gray-800/50' : ''}
                  relative group
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={`text-sm ${isToday ? 'text-purple-300 font-bold' : 'text-gray-300'}`}>
                    {format(date, 'd')}
                  </span>
                  <span className="text-2xl mt-1">{moonPhase.emoji}</span>
                  {hasRituals && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="flex space-x-0.5">
                        {rituals.slice(0, 3).map((_, i) => (
                          <div key={i} className="w-1 h-1 bg-purple-400 rounded-full" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-xs text-gray-300 px-2 py-1 rounded whitespace-nowrap">
                    {moonPhase.name}
                    {hasRituals && ` • ${rituals.length} ritual${rituals.length > 1 ? 's' : ''}`}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && selectedDayData && (
        <div className="card-mystical">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-3xl">{selectedDayData.moonPhase.emoji}</span>
                <span className="text-purple-300">{selectedDayData.moonPhase.name}</span>
              </div>
            </div>
            <Link
              href={`/dashboard/rituals/new?date=${format(selectedDate, 'yyyy-MM-dd')}`}
              className="btn-mystical px-4 py-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Plan Ritual
            </Link>
          </div>

          <div className="space-y-4">
            {/* Moon Phase Energy */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">Moon Energy</h4>
              <p className="text-gray-300">{selectedDayData.moonPhase.energy}</p>
            </div>

            {/* Ritual Suggestions */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Rituals</h4>
              <div className="space-y-1">
                {selectedDayData.moonPhase.ritualSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-300">
                    <Sparkles className="w-3 h-3 text-purple-400 mr-2 flex-shrink-0" />
                    {suggestion}
                  </div>
                ))}
              </div>
            </div>

            {/* Existing Rituals */}
            {selectedDayData.rituals.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Rituals on this day</h4>
                <div className="space-y-2">
                  {selectedDayData.rituals.map(ritual => (
                    <Link
                      key={ritual.id}
                      href={`/dashboard/rituals/${ritual.id}`}
                      className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                    >
                      <p className="font-medium">{ritual.title}</p>
                      {ritual.intent && (
                        <p className="text-sm text-purple-400 mt-1">{ritual.intent}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Significant Phases */}
      <div className="card-mystical">
        <h3 className="text-lg font-semibold mb-4">Upcoming Moon Phases</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingPhases.slice(0, 8).map(({ date, moonPhase }, index) => (
            <div key={index} className="text-center p-4 bg-gray-800/50 rounded-lg">
              <div className="text-3xl mb-2">{moonPhase.emoji}</div>
              <p className="font-medium text-sm">{moonPhase.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                {format(date, 'MMM d, yyyy')}
              </p>
              <p className="text-xs text-gray-500">
                {Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Moon Phase Guide Modal */}
      {showPhaseInfo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowPhaseInfo(false)}
        >
          <div 
            className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-6">Moon Phase Guide</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {MOON_PHASES && Object.values(MOON_PHASES).map((phase) => (
                <div key={phase.phase} className="card-mystical">
                  <div className="flex items-start space-x-4">
                    <span className="text-4xl">{phase.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{phase.name}</h4>
                      <p className="text-sm text-gray-300 mb-3">{phase.energy}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-400">Best for:</p>
                        {phase.ritualSuggestions.slice(0, 3).map((suggestion, i) => (
                          <p key={i} className="text-xs text-gray-500">• {suggestion}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowPhaseInfo(false)}
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
