'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  Trash2, 
  Star, 
  Sparkles, 
  BookOpen, 
  Heart,
  Shield,
  Scroll,
  Brain,
  Gem,
  Calendar,
  Clock,
  User,
  Tag,
  Package,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

// ✅ Interface matching database schema
interface GrimoireEntry {
  id: string
  user_id: string
  title: string
  type: string
  category: string | null
  subcategory: string | null
  content: string | null
  description: string | null
  purpose: string | null
  intent: string | null
  ingredients: string[] | null
  instructions: string
  notes: string | null
  source: string | null
  best_timing: string | null
  difficulty_level: number | null
  moon_phase: string | null
  moon_phase_compatibility: string[] | null
  season: string | null
  element: string | null
  planet: string | null
  chakra: string | null
  tags: string[] | null
  is_favorite: boolean
  is_tested: boolean
  is_public: boolean
  effectiveness_rating: number | null
  created_at: string
  updated_at: string
}

const TYPE_CONFIG = {
  spell: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-900/20' },
  ritual: { icon: Star, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  chant: { icon: Scroll, color: 'text-green-400', bg: 'bg-green-900/20' },
  blessing: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-900/20' },
  invocation: { icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
  meditation: { icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
  divination: { icon: Gem, color: 'text-amber-400', bg: 'bg-amber-900/20' },
  other: { icon: BookOpen, color: 'text-gray-400', bg: 'bg-gray-900/20' },
}

export default function GrimoireEntryDetailPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<GrimoireEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchEntry()
  }, [params.id])

  const fetchEntry = async () => {
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('grimoire_entries')
        .select('*')
        .eq('id', params.id)
        .single()

      if (fetchError) {
        console.error('Grimoire entry fetch error:', fetchError)
        setError(fetchError.message)
        return
      }

      setEntry(data)
    } catch (error: any) {
      console.error('Error fetching grimoire entry:', error)
      setError(error.message || 'Failed to load grimoire entry')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!entry || !confirm('Are you sure you want to delete this grimoire entry? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('grimoire_entries')
        .delete()
        .eq('id', entry.id)

      if (error) throw error

      router.push('/dashboard/grimoire')
    } catch (error: any) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const toggleFavorite = async () => {
    if (!entry) return

    try {
      const { error } = await supabase
        .from('grimoire_entries')
        .update({ is_favorite: !entry.is_favorite })
        .eq('id', entry.id)

      if (error) throw error

      setEntry({ ...entry, is_favorite: !entry.is_favorite })
    } catch (error: any) {
      console.error('Error updating favorite:', error)
    }
  }

  const toggleTested = async () => {
    if (!entry) return

    try {
      const { error } = await supabase
        .from('grimoire_entries')
        .update({ is_tested: !entry.is_tested })
        .eq('id', entry.id)

      if (error) throw error

      setEntry({ ...entry, is_tested: !entry.is_tested })
    } catch (error: any) {
      console.error('Error updating tested status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading grimoire entry...</div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-2">Entry Not Found</div>
          <div className="text-gray-400 text-sm mb-4">
            {error || 'This grimoire entry could not be found.'}
          </div>
          <Link href="/dashboard/grimoire" className="btn-mystical">
            Back to Grimoire
          </Link>
        </div>
      </div>
    )
  }

  const typeConfig = TYPE_CONFIG[entry.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.other
  const TypeIcon = typeConfig.icon

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard/grimoire" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grimoire
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              entry.is_favorite 
                ? 'text-yellow-400 bg-yellow-400/10' 
                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
            }`}
          >
            <Star className={`w-5 h-5 ${entry.is_favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={toggleTested}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              entry.is_tested
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {entry.is_tested ? 'Tested ✓' : 'Mark as Tested'}
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="card-mystical space-y-6">
        {/* Title and Type */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
              <span className={`px-3 py-1 rounded-full text-sm ${typeConfig.bg} ${typeConfig.color} capitalize`}>
                {entry.type}
              </span>
              {entry.category && (
                <span className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300 capitalize">
                  {entry.category}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{entry.title}</h1>
            {(entry.purpose || entry.description) && (
              <p className="text-gray-300 text-lg">
                {entry.purpose || entry.description}
              </p>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entry.intent && (
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <div>
                <div className="text-xs text-gray-400">Intent</div>
                <div className="text-sm text-gray-300">{entry.intent}</div>
              </div>
            </div>
          )}

          {entry.best_timing && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs text-gray-400">Best Timing</div>
                <div className="text-sm text-gray-300">{entry.best_timing}</div>
              </div>
            </div>
          )}

          {entry.source && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-xs text-gray-400">Source</div>
                <div className="text-sm text-gray-300">{entry.source}</div>
              </div>
            </div>
          )}

          {entry.element && (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs text-gray-400">Element</div>
                <div className="text-sm text-gray-300">{entry.element}</div>
              </div>
            </div>
          )}

          {entry.planet && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs text-gray-400">Planet</div>
                <div className="text-sm text-gray-300">{entry.planet}</div>
              </div>
            </div>
          )}

          {entry.moon_phase && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs text-gray-400">Moon Phase</div>
                <div className="text-sm text-gray-300">{entry.moon_phase}</div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">Instructions</h2>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
              {entry.instructions}
            </pre>
          </div>
        </div>

        {/* Ingredients */}
        {entry.ingredients && entry.ingredients.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Ingredients & Materials
            </h2>
            <div className="flex flex-wrap gap-2">
              {entry.ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-green-900/20 text-green-300"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-purple-900/20 text-purple-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Notes</h2>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{entry.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-700 pt-4 flex items-center justify-between text-sm text-gray-400">
          <div>
            Created: {format(new Date(entry.created_at), 'MMM d, yyyy')}
          </div>
          {entry.updated_at !== entry.created_at && (
            <div>
              Updated: {format(new Date(entry.updated_at), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}