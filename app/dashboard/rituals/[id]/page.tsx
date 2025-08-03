'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Moon, Sparkles, Edit2, Trash2, Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns'
import { formatDetailDate } from '@/lib/utils/date-utils'

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
  updated_at: string
}

export default function RitualEntryPage({ params }: { params: { id: string } }) {
  const [ritual, setRitual] = useState<Ritual | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedIntent, setEditedIntent] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedOutcome, setEditedOutcome] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchRitual()
  }, [params.id])

  const fetchRitual = async () => {
    try {
      const { data, error } = await supabase
        .from('rituals')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      
      setRitual(data)
      setEditedTitle(data.title)
      setEditedIntent(data.intent || '')
      setEditedDescription(data.description || '')
      setEditedOutcome(data.outcome || '')
    } catch (error) {
      console.error('Error fetching ritual:', error)
      router.push('/dashboard/rituals')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!ritual) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('rituals')
        .update({
          title: editedTitle.trim(),
          intent: editedIntent.trim() || null,
          description: editedDescription.trim() || null,
          outcome: editedOutcome.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ritual.id)

      if (error) throw error

      // Refetch to get updated data
      await fetchRitual()
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating ritual:', error)
      alert('Failed to update ritual')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!ritual || !confirm('Are you sure you want to delete this ritual?')) return

    try {
      const { error } = await supabase
        .from('rituals')
        .delete()
        .eq('id', ritual.id)

      if (error) throw error
      router.push('/dashboard/rituals')
    } catch (error) {
      console.error('Error deleting ritual:', error)
      alert('Failed to delete ritual')
    }
  }

  const getRitualIcon = () => {
    if (!ritual) return null
    const title = ritual.title.toLowerCase()
    if (title.includes('tarot') || title.includes('card')) return '🎴'
    if (title.includes('spell')) return '✨'
    if (title.includes('meditation')) return '🧘'
    if (title.includes('ritual')) return '🕯️'
    return '🔮'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading ritual details...</div>
      </div>
    )
  }

  if (!ritual) return null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/dashboard/rituals" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rituals
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="input-mystical w-full max-w-xl text-2xl font-bold"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gradient flex items-center">
                <span className="mr-3 text-4xl">{getRitualIcon()}</span>
                {ritual.title}
              </h1>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-3">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(ritual.performed_at), 'MMMM d, yyyy \'at\' h:mm a')}
              </span>
              {ritual.moon_phase && (
                <>
                  <span>•</span>
                  <span className="flex items-center text-purple-300">
                    <Moon className="w-4 h-4 mr-1" />
                    {ritual.moon_phase}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
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
                  Save
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Main Details Card */}
        <div className="card-mystical">
          {/* Intention */}
          {(ritual.intent || isEditing) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                Intention
              </h3>
              {isEditing ? (
                <input
                  type="text"
                  value={editedIntent}
                  onChange={(e) => setEditedIntent(e.target.value)}
                  placeholder="What was your intention?"
                  className="input-mystical w-full"
                />
              ) : (
                <p className="text-purple-300 font-medium">{ritual.intent}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
            {isEditing ? (
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Describe your ritual..."
                className="input-mystical w-full min-h-[150px] resize-none"
              />
            ) : (
              <p className="text-gray-100 whitespace-pre-wrap">
                {ritual.description || <span className="text-gray-500 italic">No description provided</span>}
              </p>
            )}
          </div>

          {/* Tools Used */}
          {ritual.tools_used && ritual.tools_used.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Tools & Materials</h3>
              <div className="flex flex-wrap gap-2">
                {ritual.tools_used.map((tool, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Outcome */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Outcome & Results
            </h3>
            {isEditing ? (
              <textarea
                value={editedOutcome}
                onChange={(e) => setEditedOutcome(e.target.value)}
                placeholder="What were the results or outcomes?"
                className="input-mystical w-full min-h-[100px] resize-none"
              />
            ) : (
              <div className={`${ritual.outcome ? 'bg-green-900/20 border border-green-500/30 rounded-lg p-4' : ''}`}>
                <p className={`whitespace-pre-wrap ${ritual.outcome ? 'text-green-100' : 'text-gray-500 italic'}`}>
                  {ritual.outcome || 'No outcome recorded yet'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata Card */}
        <div className="card-mystical bg-purple-900/20">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Ritual Metadata</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Performed:</span>
              <p className="text-gray-300">{format(new Date(ritual.performed_at), 'PPpp')}</p>
            </div>
            <div>
              <span className="text-gray-500">Moon Phase:</span>
              <p className="text-purple-300">{ritual.moon_phase || 'Not recorded'}</p>
            </div>
            <div>
              <span className="text-gray-500">Logged on:</span>
              <p className="text-gray-300">{format(new Date(ritual.created_at), 'PPp')}</p>
            </div>
            {ritual.updated_at !== ritual.created_at && (
              <div>
                <span className="text-gray-500">Last updated:</span>
                <p className="text-gray-300">{formatDetailDate(ritual.updated_at)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tips for Future */}
        {!ritual.outcome && !isEditing && (
          <div className="card-mystical bg-indigo-900/20 border-indigo-500/30">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-indigo-300 font-medium mb-1">Remember to add outcomes</p>
                <p className="text-gray-400">
                  Return to this ritual later to document any manifestations, insights, or results 
                  that emerge over time. This helps you track the effectiveness of your practice.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}