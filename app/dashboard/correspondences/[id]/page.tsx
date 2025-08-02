'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X,
  Trash2, 
  Star, 
  Sparkles, 
  BookOpen, 
  Eye, 
  Share2,
  AlertCircle,
  Heart,
  Leaf,
  Globe,
  Calendar,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'

interface Correspondence {
  id: string
  user_id: string | null
  name: string
  category: string
  description: string | null
  botanical_name: string | null
  common_names: string[] | null
  magical_properties: string[] | null
  traditional_uses: string[] | null
  medical_uses: string[] | null
  personal_applications: string[] | null
  personal_notes: string | null
  element: string | null
  planet: string | null
  zodiac_sign: string | null
  chakra: string | null
  energy_type: string | null
  deities: string[] | null
  cultural_traditions: any | null
  folklore: string | null
  historical_uses: string[] | null
  source: string | null
  verified: boolean
  is_personal: boolean
  is_favorited: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { value: 'herbs', label: 'Herbs & Plants', icon: '🌿' },
  { value: 'crystals', label: 'Crystals & Stones', icon: '💎' },
  { value: 'colors', label: 'Colors', icon: '🎨' },
  { value: 'elements', label: 'Elements', icon: '🔥' },
  { value: 'tools', label: 'Magical Tools', icon: '🔮' },
  { value: 'incense', label: 'Incense & Resins', icon: '🕯️' },
  { value: 'oils', label: 'Essential Oils', icon: '🫗' },
  { value: 'candles', label: 'Candles', icon: '🕯️' },
  { value: 'symbols', label: 'Symbols & Sigils', icon: '✨' },
  { value: 'deities', label: 'Deities & Spirits', icon: '👑' },
  { value: 'animals', label: 'Animal Spirits', icon: '🦋' },
  { value: 'trees', label: 'Sacred Trees', icon: '🌳' },
  { value: 'other', label: 'Other', icon: '📜' }
]

export default function CorrespondenceDetailPage({ params }: { params: { id: string } }) {
  const [correspondence, setCorrespondence] = useState<Correspondence | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedNotes, setEditedNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCorrespondence()
  }, [params.id])

  const fetchCorrespondence = async () => {
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('correspondences')
        .select('*')
        .eq('id', params.id)
        .single()

      if (fetchError) {
        console.error('Correspondence fetch error:', fetchError)
        if (fetchError.code === 'PGRST116') {
          setError('Correspondence not found')
        } else {
          setError(fetchError.message)
        }
        return
      }

      setCorrespondence(data)
      setEditedNotes(data.personal_notes || '')
    } catch (error: any) {
      console.error('Error fetching correspondence:', error)
      setError(error.message || 'Failed to load correspondence')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!correspondence) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('correspondences')
        .update({ personal_notes: editedNotes.trim() || null })
        .eq('id', correspondence.id)

      if (error) throw error

      setCorrespondence({
        ...correspondence,
        personal_notes: editedNotes.trim() || null
      })
      setIsEditing(false)
      alert('Notes saved successfully!')
    } catch (error: any) {
      console.error('Error saving notes:', error)
      alert('Failed to save notes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!correspondence) return

    try {
      const { error } = await supabase
        .from('correspondences')
        .update({ is_favorited: !correspondence.is_favorited })
        .eq('id', correspondence.id)

      if (error) throw error

      setCorrespondence({
        ...correspondence,
        is_favorited: !correspondence.is_favorited
      })
    } catch (error: any) {
      console.error('Error updating favorite:', error)
    }
  }

  const handleDelete = async () => {
    if (!correspondence || !correspondence.is_personal) {
      alert('Only personal correspondences can be deleted')
      return
    }

    if (!confirm(`Are you sure you want to delete "${correspondence.name}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('correspondences')
        .delete()
        .eq('id', correspondence.id)

      if (error) throw error

      router.push('/dashboard/correspondences')
    } catch (error: any) {
      console.error('Error deleting correspondence:', error)
      alert('Failed to delete correspondence. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryConfig = CATEGORIES.find(c => c.value === category)
    return categoryConfig?.icon || '📜'
  }

  const getPropertyColor = (property: string) => {
    const colorMap: Record<string, string> = {
      'protection': 'text-blue-400 bg-blue-900/20',
      'love': 'text-pink-400 bg-pink-900/20',
      'abundance': 'text-green-400 bg-green-900/20',
      'healing': 'text-emerald-400 bg-emerald-900/20',
      'banishing': 'text-red-400 bg-red-900/20',
      'cleansing': 'text-cyan-400 bg-cyan-900/20',
      'divination': 'text-purple-400 bg-purple-900/20',
      'wisdom': 'text-indigo-400 bg-indigo-900/20',
      'courage': 'text-orange-400 bg-orange-900/20',
      'peace': 'text-sky-400 bg-sky-900/20',
      'psychic_abilities': 'text-violet-400 bg-violet-900/20',
      'spiritual_growth': 'text-amber-400 bg-amber-900/20',
      'grounding': 'text-stone-400 bg-stone-900/20',
      'transformation': 'text-fuchsia-400 bg-fuchsia-900/20',
      'communication': 'text-yellow-400 bg-yellow-900/20'
    }
    return colorMap[property] || 'text-gray-400 bg-gray-900/20'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading correspondence details...</div>
      </div>
    )
  }

  if (error || !correspondence) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-2">Correspondence Not Found</div>
          <div className="text-gray-400 text-sm mb-4">
            {error || 'This correspondence entry could not be found.'}
          </div>
          <Link href="/dashboard/correspondences" className="btn-mystical">
            Back to Correspondences
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard/correspondences" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Correspondences
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              correspondence.is_favorited 
                ? 'text-yellow-400 bg-yellow-400/10' 
                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
            }`}
          >
            <Star className={`w-5 h-5 ${correspondence.is_favorited ? 'fill-current' : ''}`} />
          </button>

          {correspondence.is_personal && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="card-mystical space-y-6">
        {/* Title and Category */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{getCategoryIcon(correspondence.category)}</span>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="px-3 py-1 rounded-full text-sm bg-purple-900/20 text-purple-300 capitalize">
                  {correspondence.category}
                </span>
                {correspondence.is_personal && (
                  <span className="px-3 py-1 rounded-full text-sm bg-green-900/20 text-green-300">
                    Personal
                  </span>
                )}
                {correspondence.verified && (
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-900/20 text-blue-300">
                    Verified
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{correspondence.name}</h1>
              {correspondence.botanical_name && (
                <p className="text-gray-400 italic">{correspondence.botanical_name}</p>
              )}
              {correspondence.description && (
                <p className="text-gray-300 mt-2">{correspondence.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Common Names */}
        {correspondence.common_names && correspondence.common_names.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Leaf className="w-5 h-5 mr-2" />
              Common Names
            </h2>
            <div className="flex flex-wrap gap-2">
              {correspondence.common_names.map((name, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Magical Properties */}
        {correspondence.magical_properties && correspondence.magical_properties.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              Magical Properties
            </h2>
            <div className="flex flex-wrap gap-2">
              {correspondence.magical_properties.map((property, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm ${getPropertyColor(property.toLowerCase())}`}
                >
                  {property.charAt(0).toUpperCase() + property.slice(1).replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Correspondences Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {correspondence.element && (
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs text-gray-400">Element</div>
                <div className="text-sm text-gray-300">{correspondence.element}</div>
              </div>
            </div>
          )}

          {correspondence.planet && (
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs text-gray-400">Planet</div>
                <div className="text-sm text-gray-300">{correspondence.planet}</div>
              </div>
            </div>
          )}

          {correspondence.zodiac_sign && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs text-gray-400">Zodiac</div>
                <div className="text-sm text-gray-300">{correspondence.zodiac_sign}</div>
              </div>
            </div>
          )}

          {correspondence.chakra && (
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <div>
                <div className="text-xs text-gray-400">Chakra</div>
                <div className="text-sm text-gray-300">{correspondence.chakra}</div>
              </div>
            </div>
          )}
        </div>

        {/* Traditional Uses */}
        {correspondence.traditional_uses && correspondence.traditional_uses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Traditional Uses
            </h2>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {correspondence.traditional_uses.map((use, index) => (
                  <li key={index}>{use}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Medical Uses */}
        {correspondence.medical_uses && correspondence.medical_uses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Medical Uses
            </h2>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {correspondence.medical_uses.map((use, index) => (
                  <li key={index}>{use}</li>
                ))}
              </ul>
              <div className="mt-3 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <p className="text-amber-300 text-sm">
                  <strong>Disclaimer:</strong> This information is for educational purposes only. 
                  Consult a healthcare professional before using any substances for medical purposes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personal Applications */}
        {correspondence.personal_applications && correspondence.personal_applications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Personal Applications
            </h2>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {correspondence.personal_applications.map((app, index) => (
                  <li key={index}>{app}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Folklore */}
        {correspondence.folklore && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Folklore & Legends
            </h2>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{correspondence.folklore}</p>
            </div>
          </div>
        )}

        {/* Deities */}
        {correspondence.deities && correspondence.deities.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
              👑 Associated Deities
            </h2>
            <div className="flex flex-wrap gap-2">
              {correspondence.deities.map((deity, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-amber-900/20 text-amber-300"
                >
                  {deity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personal Notes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Edit2 className="w-5 h-5 mr-2" />
              Personal Notes
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                {correspondence.personal_notes ? 'Edit Notes' : 'Add Notes'}
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="text-sm text-purple-400 hover:text-purple-300 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Share your personal experiences with this correspondence..."
              className="input-mystical w-full min-h-[120px] resize-none"
            />
          ) : (
            <div className="bg-gray-900/50 rounded-lg p-4">
              {correspondence.personal_notes ? (
                <p className="text-gray-300 whitespace-pre-wrap italic">
                  &ldquo;{correspondence.personal_notes}&rdquo;
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  No personal notes added yet. Share your experiences with this correspondence!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 pt-4 flex items-center justify-between text-sm text-gray-400">
          <div>
            {correspondence.source && (
              <span>Source: {correspondence.source}</span>
            )}
          </div>
          <div>
            Added: {format(new Date(correspondence.created_at), 'MMM d, yyyy')}
          </div>
        </div>
      </div>
    </div>
  )
}