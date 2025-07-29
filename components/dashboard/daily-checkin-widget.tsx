'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface DailyCheckin {
  id: string
  prompt: string
  response: string | null
  completed: boolean
  created_at: string
}

export function DailyCheckinWidget() {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null)
  const [loading, setLoading] = useState(true)
  const [quickResponse, setQuickResponse] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchTodaysCheckin()
  }, [])

  const fetchTodaysCheckin = async () => {
    try {
      const response = await fetch('/api/checkin')
      if (!response.ok) throw new Error('Failed to fetch check-in')
      
      const data = await response.json()
      setCheckin(data.checkin)
    } catch (error) {
      console.error('Error fetching check-in:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!checkin || !quickResponse.trim() || saving) return

    setSaving(true)
    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkinId: checkin.id,
          response: quickResponse.trim(),
        }),
      })

      if (!response.ok) throw new Error('Failed to save response')
      
      const data = await response.json()
      setCheckin(data.checkin)
      setQuickResponse('')
    } catch (error) {
      console.error('Error saving response:', error)
      alert('Failed to save your response')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="card-mystical">
        <div className="animate-pulse">
          <div className="h-4 bg-purple-800/30 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-purple-800/30 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!checkin) return null

  return (
    <div className="card-mystical bg-gradient-to-br from-purple-900/20 to-indigo-900/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <h3 className="font-semibold">Daily Check-in</h3>
        </div>
        {checkin.completed && (
          <div className="flex items-center text-green-400 text-sm">
            <Check className="w-4 h-4 mr-1" />
            Complete
          </div>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-gray-300 italic">"{checkin.prompt}"</p>

        {checkin.completed ? (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-300">{checkin.response}</p>
            <Link 
              href="/dashboard/checkins"
              className="text-xs text-purple-400 hover:text-purple-300 mt-2 inline-block"
            >
              View all check-ins →
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleQuickResponse} className="space-y-3">
              <textarea
                value={quickResponse}
                onChange={(e) => setQuickResponse(e.target.value)}
                placeholder="Share your thoughts..."
                className="input-mystical w-full min-h-[80px] resize-none text-sm"
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {quickResponse.length}/500
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/chat?checkin=${checkin.id}`}
                    className="text-sm text-purple-400 hover:text-purple-300 px-3 py-1"
                  >
                    Chat with Beatrice
                  </Link>
                  <button
                    type="submit"
                    disabled={saving || !quickResponse.trim()}
                    className="btn-mystical px-4 py-1 text-sm disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}