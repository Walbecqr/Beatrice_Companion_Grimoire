'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Moon, Calendar, ArrowRight } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { getUpcomingMoonPhases, getMoonPhaseForDate } from '@/lib/utils/moon-calendar'

export function MoonPhaseWidget() {
  const [currentPhase, setCurrentPhase] = useState<ReturnType<typeof getMoonPhaseForDate> | null>(null)
  const [nextPhases, setNextPhases] = useState<ReturnType<typeof getUpcomingMoonPhases>>([])
  
  useEffect(() => {
    const today = new Date()
    setCurrentPhase(getMoonPhaseForDate(today))
    setNextPhases(getUpcomingMoonPhases(30).slice(0, 3))
  }, [])

  if (!currentPhase) return null

  return (
    <div className="card-mystical bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Moon className="w-5 h-5 text-purple-300" />
          <h3 className="font-semibold">Moon Phases</h3>
        </div>
        <Link 
          href="/dashboard/lunar-calendar"
          className="text-xs text-purple-400 hover:text-purple-300"
        >
          View Calendar →
        </Link>
      </div>

      {/* Current Phase */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">{currentPhase.emoji}</div>
        <p className="font-medium text-lg">{currentPhase.name}</p>
        <p className="text-sm text-gray-400 mt-1">Today</p>
      </div>

      {/* Upcoming Phases */}
      <div className="space-y-3">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Upcoming</p>
        {nextPhases.map(({ date, moonPhase }, index) => {
          const daysUntil = differenceInDays(date, new Date())
          return (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{moonPhase.emoji}</span>
                <div>
                  <p className="text-sm font-medium">{moonPhase.name}</p>
                  <p className="text-xs text-gray-400">{format(date, 'MMM d')}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {daysUntil === 0 ? 'Today' : `${daysUntil} days`}
              </p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Link 
        href="/dashboard/lunar-calendar"
        className="mt-4 w-full flex items-center justify-center text-sm text-purple-400 hover:text-purple-300 p-2 bg-purple-900/20 rounded-lg transition-colors"
      >
        <Calendar className="w-4 h-4 mr-2" />
        Plan by Moon Phase
      </Link>
    </div>
  )
}