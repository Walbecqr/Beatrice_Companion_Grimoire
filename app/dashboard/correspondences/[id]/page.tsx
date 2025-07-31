'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, Trash2, Star, Sparkles, BookOpen, Eye, Share2, Plus, X } from 'lucide-react'
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

const MAGICAL_PROPERTIES = [
  'protection', 'love', 'abundance', 'healing', 'banishing', 'cleansing',
  'divination', 'wisdom', 'courage', 'peace', 'psychic_abilities', 
  'spiritual_growth', 'grounding', 'transformation', 'communication',
  'prosperity', 'fertility', 'luck', 'success', 'creativity', 'intuition',
  'balance', 'harmony', 'strength', 'clarity', 'manifestation'
]

const ELEMENTS = ['Fire', 'Water', 'Earth', 'Air', 'Spirit']
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
const CHAKRAS = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown']

export default function CorrespondenceDetailPage({ params }: { params: { id: string } }) {
  const [correspondence, setCorrespondence] = useState<Correspondence | null>(null)
  const [relatedEntries, setRelatedEntries] = useState<RelatedEntry[]>([])
  const [isEditing, setIsEditing] = useState(false)
  
  // Edit form state
  const [editedName, setEditedName] = useState('')
  const [editedCategory, setEditedCategory] = useState('')
  const [editedProperties, setEditedProperties] = useState<string[]>([])
  const [editedUses, setEditedUses] = useState<string[]>([''])
  const [editedNotes, setEditedNotes] = useState('')
  const [editedElement, setEditedElement] = useState('')
  const [editedPlanet, setEditedPlanet] = useState('')
  const [editedZodiacSign, setEditedZodiacSign] = useState('')
  const [editedChakra, setEditedChakra] = useState('')
  const [newProperty, setNewProperty] = useState('')
  
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  const fetchCorrespondence = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('correspondences')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      
      setCorrespondence(data)
      // Initialize edit form with current values
      setEditedName(data.name)
      setEditedCategory(data.category)
      setEditedProperties(data.magical_properties || [])
      setEditedUses(data.traditional_uses.length > 0 ? data.traditional_uses : [''])
      setEditedNotes(data.personal_notes || '')
      setEditedElement(data.element || '')
      setEditedPlanet(data.planet || '')
      setEditedZodiacSign(data.zodiac_sign || '')
      setEditedChakra(data.chakra || '')
    } catch (error) {
      console.error('Error fetching correspondence:', error)
      router.push('/dashboard/correspondences')
    } finally {
      setLoading(false)
    }
  }, [params.id, supabase, router])

  const fetchRelatedEntries = useCallback(async () => {
    try {
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

      setRelatedEntries(related.slice(0, 5))
    } catch (error) {
      console.error('Error fetching related entries:', error)
    }
  }, [correspondence?.name, supabase])

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

  const toggleProperty = (property: string) => {
    if (editedProperties.includes(property)) {
      setEditedProperties(editedProperties.filter(p => p !== property))
    } else {
      setEditedProperties([...editedProperties, property])
    }
  }

  const addCustomProperty = () => {
    if (newProperty.trim() && !editedProperties.includes(newProperty.toLowerCase())) {
      setEditedProperties([...editedProperties, newProperty.toLowerCase().replace(' ', '_')])
      setNewProperty('')
    }
  }

  const addTraditionalUse = () => {
    setEditedUses([...editedUses, ''])
  }

  const updateTraditionalUse = (index: number, value: string) => {
    const updated = [...editedUses]
    updated[index] = value
    setEditedUses(updated)
  }

  const removeTraditionalUse = (index: number) => {
    setEditedUses(editedUses.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!correspondence) return
    setSaving(true)

    try {
      const filteredUses = editedUses.filter(use => use.trim())
      
      const response = await fetch(`/api/correspondences/${correspondence.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedName.trim(),
          category: editedCategory,
          magical_properties: editedProperties,
          traditional_uses: filteredUses,
          personal_notes: editedNotes.trim() || null,
          element: editedElement || null,
          planet: editedPlanet || null,
          zodiac_sign: editedZodiacSign.trim() || null,
          chakra: editedChakra || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to update correspondence')
      
      const { correspondence: updatedCorrespondence } = await response.json()
      setCorrespondence(updatedCorrespondence)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating correspondence:', error)
      alert('Failed to update correspondence')
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
      const response = await fetch(`/api/correspondences/${correspondence.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete correspondence')
      router.push('/dashboard/correspondences')
    } catch (error) {
      console.error('Error deleting correspondence:', error)
      alert('Failed to delete correspondence')
    }
  }

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
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
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="input-mystical text-3xl font-bold bg-transparent border-b-2 border-purple-500 px-0"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gradient">{correspondence.name}</h1>
              )}
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
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-mystical px-4 py-2 text-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
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
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Category (Edit Mode) */}
        {isEditing && (
          <div className="card-mystical">
            <h3 className="text-lg font-semibold mb-4">Category</h3>
            <select
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
              className="input-mystical w-full max-w-md"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Magical Properties */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
            Magical Properties
          </h3>
          
          {isEditing ? (
            <div className="space-y-4">
              {/* Selected Properties */}
              <div className="flex flex-wrap gap-2 mb-4">
                {editedProperties.map(property => (
                  <span
                    key={property}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getPropertyColor(property)}`}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {property.replace('_', ' ')}
                    <button
                      type="button"
                      onClick={() => setEditedProperties(editedProperties.filter(p => p !== property))}
                      className="ml-2 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Available Properties */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                {MAGICAL_PROPERTIES.map(property => (
                  <button
                    key={property}
                    type="button"
                    onClick={() => toggleProperty(property)}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      editedProperties.includes(property)
                        ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    {property.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Add Custom Property */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProperty}
                  onChange={(e) => setNewProperty(e.target.value)}
                  placeholder="Add custom property..."
                  className="input-mystical flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomProperty())}
                />
                <button
                  type="button"
                  onClick={addCustomProperty}
                  className="btn-mystical px-4"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {/* Traditional Uses */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-green-400" />
            Traditional Uses
          </h3>
          
          {isEditing ? (
            <div className="space-y-2">
              {editedUses.map((use, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={use}
                    onChange={(e) => updateTraditionalUse(index, e.target.value)}
                    placeholder={`Traditional use ${index + 1}...`}
                    className="input-mystical flex-1"
                  />
                  {editedUses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTraditionalUse(index)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTraditionalUse}
                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add another use
              </button>
            </div>
          ) : (
            correspondence.traditional_uses.length > 0 ? (
              <ul className="space-y-2">
                {correspondence.traditional_uses.map((use, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    <span className="text-gray-300">{use}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No traditional uses listed</p>
            )
          )}
        </div>

        {/* Additional Correspondences */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4">Additional Correspondences</h3>
          
          {isEditing ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Element</label>
                <select
                  value={editedElement}
                  onChange={(e) => setEditedElement(e.target.value)}
                  className="input-mystical w-full"
                >
                  <option value="">Select element</option>
                  {ELEMENTS.map(el => (
                    <option key={el} value={el}>{el}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Planet</label>
                <select
                  value={editedPlanet}
                  onChange={(e) => setEditedPlanet(e.target.value)}
                  className="input-mystical w-full"
                >
                  <option value="">Select planet</option>
                  {PLANETS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Zodiac Sign</label>
                <input
                  type="text"
                  value={editedZodiacSign}
                  onChange={(e) => setEditedZodiacSign(e.target.value)}
                  placeholder="e.g., Leo, Scorpio..."
                  className="input-mystical w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chakra</label>
                <select
                  value={editedChakra}
                  onChange={(e) => setEditedChakra(e.target.value)}
                  className="input-mystical w-full"
                >
                  <option value="">Select chakra</option>
                  {CHAKRAS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Element:</span>
                <p className="text-gray-200 font-medium">{correspondence.element || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-gray-400">Planet:</span>
                <p className="text-gray-200 font-medium">{correspondence.planet || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-gray-400">Zodiac:</span>
                <p className="text-gray-200 font-medium">{correspondence.zodiac_sign || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-gray-400">Chakra:</span>
                <p className="text-gray-200 font-medium">{correspondence.chakra || 'Not specified'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Personal Notes */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-400" />
            Personal Notes & Experiences
          </h3>

          {isEditing ? (
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              placeholder="Share your personal experiences with this correspondence..."
              className="input-mystical w-full min-h-[150px] resize-none"
            />
          ) : (
            <div className={correspondence.personal_notes ? 'bg-purple-900/10 p-4 rounded-lg' : ''}>
              {correspondence.personal_notes ? (
                <p className="text-gray-300 whitespace-pre-wrap italic">
                  &ldquo;{correspondence.personal_notes}&rdquo;
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  {correspondence.is_personal 
                    ? 'No personal notes added yet.'
                    : 'Add your personal experiences with this correspondence.'
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* Related Entries */}
        {relatedEntries.length > 0 && !isEditing && (
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
        {!correspondence.is_personal && !isEditing && (
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