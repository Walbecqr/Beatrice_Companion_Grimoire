'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Sparkles, Moon, Calendar, Wand2, Star } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Ritual {
  id: string
  title: string
  intent: string | null
  description: string | null
  moon_phase: string | null
  tools_used: string[] | null
  outcome: string | null
  performed_at: string
  created_at: string
}

const RITUAL_TYPES = {
  spell: { icon: Wand2, color: 'text-purple-400' },
  tarot: { icon: Star, color: 'text-blue-400' },
  meditation: { icon: Moon, color: 'text-indigo-400' },
  ritual: { icon: Sparkles, color: 'text-pink-400' },
}

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [filterIntent, setFilterIntent] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    fetchRituals()
  }, [])

  const fetchRituals = async () => {
    try {
      const { data, error } = await supabase
        .from('rituals')
        .select('*')
        .order('performed_at', { ascending: false })

      if (error) throw error
      setRituals(data || [])
    } catch (error) {
      console.error('Error fetching rituals:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRituals = rituals.filter(ritual => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      ritual.title.toLowerCase().includes(searchLower) ||
      ritual.intent?.toLowerCase().includes(searchLower) ||
      ritual.description?.toLowerCase().includes(searchLower) ||
      ritual.tools_used?.some(tool => tool.toLowerCase().includes(searchLower))

    const matchesIntent = !filterIntent || ritual.intent === filterIntent

    return matchesSearch && matchesIntent
  })

  const uniqueIntents = [...new Set(rituals.map(r => r.intent).filter(Boolean))] as string[]

  const getRitualIcon = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('tarot') || lowerTitle.includes('card')) return RITUAL_TYPES.tarot
    if (lowerTitle.includes('spell')) return RITUAL_TYPES.spell
    if (lowerTitle.includes('meditation')) return RITUAL_TYPES.meditation
    return RITUAL_TYPES.ritual
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading your magical practices...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Ritual & Divination Tracking</h1>
          <p className="text-gray-400 mt-1">Log your spells, readings, and sacred practices</p>
        </div>
        <Link href="/dashboard/rituals/new" className="btn-mystical">
          <Plus className="w-5 h-5 mr-2" />
          New Ritual
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search rituals, tools, or intentions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mystical w-full pl-10"
            />
          </div>
          {uniqueIntents.length > 0 && (
            <select
              value={filterIntent}
              onChange={(e) => setFilterIntent(e.target.value)}
              className="input-mystical min-w-[150px]"
            >
              <option value="">All Intentions</option>
              {uniqueIntents.map(intent => (
                <option key={intent} value={intent}>{intent}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-purple-300">{rituals.length}</p>
          <p className="text-sm text-gray-400">Total Rituals</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-blue-300">
            {rituals.filter(r => r.title.toLowerCase().includes('tarot')).length}
          </p>
          <p className="text-sm text-gray-400">Tarot Readings</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-pink-300">
            {rituals.filter(r => r.title.toLowerCase().includes('spell')).length}
          </p>
          <p className="text-sm text-gray-400">Spells Cast</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-indigo-300">
            {rituals.filter(r => r.outcome).length}
          </p>
          <p className="text-sm text-gray-400">With Outcomes</p>
        </div>
      </div>

      {/* Rituals Grid */}
      {filteredRituals.length === 0 ? (
        <div className="card-mystical text-center py-12">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            {searchTerm || filterIntent
              ? 'No rituals found matching your filters.' 
              : 'No rituals logged yet. Start tracking your magical practice!'}
          </p>
          {!searchTerm && !filterIntent && (
            <Link href="/dashboard/rituals/new" className="text-purple-400 hover:text-purple-300">
              Log your first ritual →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRituals.map((ritual) => {
            const ritualType = getRitualIcon(ritual.title)
            const Icon = ritualType.icon
            
            return (
              <Link
                key={ritual.id}
                href={`/dashboard/rituals/${ritual.id}`}
                className="card-mystical hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg line-clamp-1 flex-1">
                    {ritual.title}
                  </h3>
                  <Icon className={`w-5 h-5 ${ritualType.color} flex-shrink-0 ml-2`} />
                </div>
                
                {ritual.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {ritual.description}
                  </p>
                )}

                {ritual.intent && (
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-900/20 text-purple-400 mb-3">
                    {ritual.intent}
                  </div>
                )}

                {ritual.tools_used && ritual.tools_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {ritual.tools_used.slice(0, 3).map((tool, index) => (
                      <span
                        key={index}
                        className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded"
                      >
                        {tool}
                      </span>
                    ))}
                    {ritual.tools_used.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{ritual.tools_used.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-3">
                    <span>{format(new Date(ritual.performed_at), 'MMM d, yyyy')}</span>
                    {ritual.moon_phase && (
                      <>
                        <span>•</span>
                        <span className="text-purple-300">{ritual.moon_phase}</span>
                      </>
                    )}
                  </div>
                  {ritual.outcome && (
                    <span className="text-green-400">✓ Outcome</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}