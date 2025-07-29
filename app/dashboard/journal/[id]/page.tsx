'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Save, Trash2, Moon, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'

interface JournalEntry {
  id: string
  title: string | null
  content: string
  mood: string | null
  moon_phase: string | null
  beatrice_reflection: string | null
  created_at: string
  updated_at: string
}

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [requestingReflection, setRequestingReflection] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    fetchEntry()
  }, [params.id])

  useEffect(() => {
    // Request Beatrice's reflection after entry is loaded
    if (entry && searchParams.get('requestReflection') === 'true' && !entry.beatrice_reflection) {
      requestBeatriceReflection()
    }
  }, [entry])

  const fetchEntry = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      
      setEntry(data)
      setEditedTitle(data.title || '')
      setEditedContent(data.content)
    } catch (error) {
      console.error('Error fetching entry:', error)
      router.push('/dashboard/journal')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!entry) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title: editedTitle.trim() || null,
          content: editedContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', entry.id)

      if (error) throw error

      setEntry({
        ...entry,
        title: editedTitle.trim() || null,
        content: editedContent.trim(),
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating entry:', error)
      alert('Failed to update entry')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!entry || !confirm('Are you sure you want to delete this entry?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entry.id)

      if (error) throw error
      router.push('/dashboard/journal')
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry')
    }
  }

  const requestBeatriceReflection = async () => {
    if (!entry || entry.beatrice_reflection) return
    
    setRequestingReflection(true)

    try {
      // Create a special prompt for Beatrice to reflect on the journal entry
      const prompt = `I'd like you to offer a gentle reflection on my journal entry. Please provide spiritual insights, encouragement, or wisdom that might help me on my path. 

My journal entry:
Title: ${entry.title || 'Untitled'}
Mood: ${entry.mood || 'Not specified'}
Moon Phase: ${entry.moon_phase || 'Unknown'}

Content:
${entry.content}

Please offer your reflection in 2-3 paragraphs.`

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          sessionId: null, // Create a new session for reflections
        }),
      })

      if (!response.ok) throw new Error('Failed to get reflection')

      const data = await response.json()
      
      // Save Beatrice's reflection to the journal entry
      const { error } = await supabase
        .from('journal_entries')
        .update({
          beatrice_reflection: data.message,
        })
        .eq('id', entry.id)

      if (error) throw error

      setEntry({
        ...entry,
        beatrice_reflection: data.message,
      })
    } catch (error) {
      console.error('Error getting reflection:', error)
      alert('Failed to get Beatrice\'s reflection')
    } finally {
      setRequestingReflection(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading entry...</div>
      </div>
    )
  }

  if (!entry) return null

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/dashboard/journal" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Entry title..."
                className="input-mystical w-full max-w-xl text-2xl font-bold"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gradient">
                {entry.title || 'Untitled Entry'}
              </h1>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
              <span>{format(new Date(entry.created_at), 'MMMM d, yyyy')}</span>
              {entry.mood && (
                <>
                  <span>•</span>
                  <span className="text-purple-400">{entry.mood}</span>
                </>
              )}
              {entry.moon_phase && (
                <>
                  <span>•</span>
                  <span className="text-purple-300">{entry.moon_phase}</span>
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
        <div className="card-mystical">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="input-mystical w-full min-h-[300px] resize-none"
            />
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-100">{entry.content}</p>
            </div>
          )}
        </div>

        {/* Beatrice's Reflection */}
        {entry.beatrice_reflection ? (
          <div className="card-mystical bg-purple-900/20 border-purple-500/30">
            <div className="flex items-start space-x-3">
              <Moon className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-300 mb-2">
                  Beatrice's Reflection
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap">
                  {entry.beatrice_reflection}
                </p>
              </div>
            </div>
          </div>
        ) : requestingReflection ? (
          <div className="card-mystical bg-purple-900/20 border-purple-500/30">
            <div className="flex items-start space-x-3">
              <Moon className="w-6 h-6 text-purple-300 flex-shrink-0 mt-1 animate-pulse" />
              <div className="flex-1">
                <h3 className="font-semibold text-purple-300 mb-2">
                  Beatrice is reading your entry...
                </h3>
                <div className="space-y-2">
                  <div className="h-4 bg-purple-800/30 rounded animate-pulse"></div>
                  <div className="h-4 bg-purple-800/30 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-purple-800/30 rounded animate-pulse w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <button
              onClick={requestBeatriceReflection}
              disabled={requestingReflection}
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Ask Beatrice for a reflection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}