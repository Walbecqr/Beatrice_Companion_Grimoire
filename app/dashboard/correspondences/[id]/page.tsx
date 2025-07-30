'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, Trash2, Star, Sparkles, BookOpen, Eye, Share2 } from 'lucide-react'
import { format } from 'date-fns'

interface Correspondence {
  id: string
  name: string
  category: string
  magical_properties: string[]
  traditional_uses: string[]
  personal_notes: string | null
  element: string | null
  planet: string | null
  zodiac_sign: string | null
  chakra: string | null
  is_personal: boolean
  is_favorited: boolean
  user_id: string | null
  created_at: string
  updated_at: string
}

interface RelatedEntry {
  id: string
  title: string
  type: 'ritual' | 'journal'
  created_at: string
}

export default function CorrespondenceDetailPage({ params }: { params: { id: string } }) {
  const [correspondence, setCorrespondence] = useState<Correspondence | null>(null)
  const [relatedEntries, setRelatedEntries] = useState<RelatedEntry[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedNotes, setEditedNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCorrespondence()
    fetchRelatedEntries()
  }, [params.id])

  const fetchCorrespondence = async () => {
    try {
      const { data, error } = await supabase
        .from('correspondences')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      
      setCorrespondence(data)
      setEditedNotes(data.personal_notes || '')
    } catch (error) {
      console.error('Error fetching correspondence:', error)
      router.push('/dashboard/correspondences')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedEntries = async () => {
    try {
      // This would search for mentions of the correspondence in rituals and journal entries
      // For now, we'll implement a simple search by name
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const correspondence_name = correspondence?.name.toLowerCase()
      if (!correspondence_name) return

      // Search rituals
      const { data: rituals } = await supabase
        .from('rituals')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .ilike('description', `%${correspondence_name}%`)

      // Search journal entries
      const { data: journals } = await supabase
        .from('journal_entries')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .ilike('content', `%${correspondence_name}%`)

      const related: RelatedEntry[] = [
        ...(rituals || []).map(r => ({ ...r, type: 'ritual' as const })),
        ...(journals || []).map(j => ({ ...j, type: 'journal' as const, title: j.title || 'Untitled Entry' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setRelatedEntries(related.slice(0, 5)) // Show up to 5 related entries
    } catch (error) {
      console.error('Error fetching related entries:', error)
    }
  }

  const toggleFavorite = async () => {
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
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleSaveNotes = async () => {
    if (!correspondence) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('correspondences')
        .update({
          personal_notes: editedNotes.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', correspondence.id)

      if (error) throw error

      setCorrespondence({
        ...correspondence,
        personal_notes: editedNotes.trim() || null,
        updated_at: new Date().toISOString()
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating notes:', error)
      alert('Failed to update notes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!correspondence || !correspondence.is_personal) return
    
    if (!confirm(`Are you sure you want to delete "${correspondence.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('correspondences')
        .delete()
        .eq('id', correspondence.id)

      if (error) throw error
      router.push('/dashboard/correspondences')
    } catch (error) {
      console.error('Error deleting correspondence:', error)
      alert('Failed to delete correspondence')
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      'herbs': '🌿',
      'crystals': '💎',
      'colors': '🎨',
      'elements': '🔥',
      'tools': '🔮',
      'incense': '🕯️',
      'oils': '🫗',
      'candles': '🕯️',
      'symbols': '✨',
      'deities': '👑',
      'animals': '🦋',
      'trees': '🌳',
      'other': '📜'
    }
    return iconMap[category] || '📜'
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

  if (!correspondence) return null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/dashboard/correspondences" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Correspondences
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-5xl">{getCategoryIcon(correspondence.category)}</span>
            <div>
              <h1 className="text-3xl font-bold text-gradient">{correspondence.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                <span className="capitalize">{correspondence.category}</span>
                {correspondence.is_personal && (
                  <>
                    <span>•</span>
                    <span className="text-purple-400">Personal Entry</span>
                  </>
                )}
                <span>•</span>
                <span>Added {format(new Date(correspondence.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFavorite}
              className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <Star className={`w-6 h-6 ${correspondence.is_favorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </button>
            
            {correspondence.is_personal && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Magical Properties */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            Magical Properties
          </h3>
          <div className="flex flex-wrap gap-2">
            {correspondence.magical_properties.map(property => (
              <span
                key={property}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getPropertyColor(property)}`}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {property.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Traditional Uses */}
        {correspondence.traditional_uses.length > 0 && (
          <div className="card-mystical">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-green-400" />
              Traditional Uses
            </h3>
            <ul className="space-y-2">
              {correspondence.traditional_uses.map((use, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span className="text-gray-300">{use}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Correspondences */}
        {(correspondence.element || correspondence.planet || correspondence.zodiac_sign || correspondence.chakra) && (
          <div className="card-mystical">
            <h3 className="text-lg font-semibold mb-4">Additional Correspondences</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {correspondence.element && (
                <div>
                  <span className="text-gray-400">Element:</span>
                  <p className="text-gray-200 font-medium">{correspondence.element}</p>
                </div>
              )}
              {correspondence.planet && (
                <div>
                  <span className="text-gray-400">Planet:</span>
                  <p className="text-gray-200 font-medium">{correspondence.planet}</p>
                </div>
              )}
              {correspondence.zodiac_sign && (
                <div>
                  <span className="text-gray-400">Zodiac:</span>
                  <p className="text-gray-200 font-medium">{correspondence.zodiac_sign}</p>
                </div>
              )}
              {correspondence.chakra && (
                <div>
                  <span className="text-gray-400">Chakra:</span>
                  <p className="text-gray-200 font-medium">{correspondence.chakra}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Personal Notes */}
        <div className="card-mystical">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Eye className="w-5 h-5 mr-2 text-blue-400" />
              Personal Notes & Experiences
            </h3>
            {correspondence.is_personal && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Add/Edit Notes
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Share your personal experiences with this correspondence..."
                className="input-mystical w-full min-h-[150px] resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="btn-mystical px-4 py-2 text-sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          ) : (
            <div className={correspondence.personal_notes ? 'bg-purple-900/10 p-4 rounded-lg' : ''}>
              {correspondence.personal_notes ? (
                <p className="text-gray-300 whitespace-pre-wrap italic">
                  "{correspondence.personal_notes}"
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  {correspondence.is_personal 
                    ? 'No personal notes added yet. Click "Add/Edit Notes" to share your experiences.'
                    : 'This is a traditional correspondence. You can add your personal experiences if you have used it in your practice.'
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* Related Entries */}
        {relatedEntries.length > 0 && (
          <div className="card-mystical">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Share2 className="w-5 h-5 mr-2 text-indigo-400" />
              Related Entries
            </h3>
            <div className="space-y-3">
              {relatedEntries.map(entry => (
                <Link
                  key={`${entry.type}-${entry.id}`}
                  href={`/dashboard/${entry.type === 'ritual' ? 'rituals' : 'journal'}/${entry.id}`}
                  className="block p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-200">{entry.title}</p>
                      <p className="text-sm text-gray-400 capitalize">
                        {entry.type} • {format(new Date(entry.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <span className="text-purple-400">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tips */}
        {!correspondence.is_personal && (
          <div className="card-mystical bg-indigo-900/20 border-indigo-500/30">
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-indigo-300 font-medium mb-1">Traditional Correspondence</p>
                <p className="text-gray-400">
                  This is a traditional correspondence entry. As you work with {correspondence.name} in your practice, 
                  consider adding your personal notes and experiences to build your own magical reference library.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}