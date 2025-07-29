'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Sparkles, Moon, Calendar, Zap, Eye } from 'lucide-react'
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

const RITUAL_TYPES = [
  { icon: Sparkles, label: 'Spell', color: 'text-purple-400' },
  { icon: Eye, label: 'Divination', color: 'text-blue-400' },
  { icon: Moon, label: 'Moon Ritual', color: 'text-indigo-400' },
  { icon: Zap, label: 'Energy Work', color: 'text-yellow-400' },
]

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string | null>(null)
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
      ritual.description?.toLowerCase().includes(searchLower)

    const matchesType = !selectedType || 
      ritual.title.toLowerCase().includes(selectedType.toLowerCase())

    return matchesSearch && matchesType
  })

  const getRitualIcon = (title: string) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('tarot') || titleLower.includes('oracle') || titleLower.includes('divination')) {
      return Eye
    } else if (titleLower.includes('moon')) {
      return Moon
    } else if (titleLower.includes('energy') || titleLower.includes('cleanse')) {
      return Zap
    }
    return Sparkles
  }

  const getRitualColor = (title: string) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('tarot') || titleLower.includes('oracle') || titleLower.includes('divination')) {
      return 'text-blue-400'
    } else if (titleLower.includes('moon')) {
      return 'text-indigo-400'
    } else if (titleLower.includes('energy') || titleLower.includes('cleanse')) {
      return 'text-yellow-400'
    }
    return 'text-purple-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading your magical workings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Ritual & Divination Tracking</h1>
          <p className="text-gray-400 mt-1">Log your spells, readings, and spiritual practices</p>
        </div>
        <Link href="/dashboard/rituals/new" className="btn-mystical">
          <Plus className="w-5 h-5 mr-2" />
          New Ritual
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search your rituals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-mystical w-full pl-10"
          />
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {RITUAL_TYPES.map((type) => (
            <button
              key={type.label}
              onClick={() => setSelectedType(selectedType === type.label ? null : type.label)}
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm transition-all ${
                selectedType === type.label
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <type.icon className="w-4 h-4 mr-2" />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rituals Grid */}
      {filteredRituals.length === 0 ? (
        <div className="card-mystical text-center py-12">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedType
              ? 'No rituals found matching your filters.' 
              : 'Your grimoire awaits its first ritual.'}
          </p>
          {!searchTerm && !selectedType && (
            <Link href="/dashboard/rituals/new" className="text-purple-400 hover:text-purple-300">
              Log your first ritual →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRituals.map((ritual) => {
            const Icon = getRitualIcon(ritual.title)
            const iconColor = getRitualColor(ritual.title)
            
            return (
              <Link
                key={ritual.id}
                href={`/dashboard/rituals/${ritual.id}`}
                className="card-mystical hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {ritual.title}
                    </h3>
                  </div>
                  <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
                </div>
                
                {ritual.intent && (
                  <p className="text-sm text-purple-300 mb-2">
                    Intent: {ritual.intent}
                  </p>
                )}
                
                {ritual.description && (
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {ritual.description}
                  </p>
                )}

                {ritual.tools_used && ritual.tools_used.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {ritual.tools_used.slice(0, 3).map((tool, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full"
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
                  <span>{format(new Date(ritual.performed_at), 'MMM d, yyyy')}</span>
                  {ritual.moon_phase && (
                    <span className="text-purple-300">{ritual.moon_phase}</span>
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