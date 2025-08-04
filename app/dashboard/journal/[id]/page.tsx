"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ArrowLeft, Moon, Heart, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TagSelector } from '@/components/ui/tag-selector'
import type { JournalEntry, JournalEntryTag } from '@/types/beatrice'
export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  useEffect(() => {
    fetchEntry()
  }, [params.id])
  const fetchEntry = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          journal_entry_tags (
            tags (
              id,
              name,
              category
            )
          )
        `)
        .eq('id', params.id)
        .single()
      if (error) throw error
      if (!data) throw new Error('Entry not found')
      
      setEntry(data)
      if (data.journal_entry_tags) {
        setSelectedTags(data.journal_entry_tags.map((jet: JournalEntryTag) => jet.tags.id))
      }
    } catch (error) {
      console.error('Error fetching entry:', error)
      router.push('/dashboard/journal')
    } finally {
      setLoading(false)
    }
  }
  const deleteEntry = async () => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return

    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', params.id)
      if (error) throw error
      router.push('/dashboard/journal')
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="mb-6">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!entry) return null

  const getMoonPhaseIcon = (phase: string) => {
    const iconClass = "w-12 h-12 text-purple-600 dark:text-purple-400"
    return <Moon className={iconClass} />
  }

  const getMoodIcon = (mood: string) => {
    const iconClass = "w-5 h-5"
    return <Heart className={iconClass} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Link 
            href="/dashboard/journal" 
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {format(new Date(entry.created_at), 'MMMM d, yyyy')}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={deleteEntry}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {entry.moon_phase && (
              <div className="flex items-center gap-4">
                {getMoonPhaseIcon(entry.moon_phase)}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Moon Phase</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {entry.moon_phase.replace('_', ' ')}
                  </p>
                </div>
              </div>
            )}

            {entry.mood && (
              <div className="flex items-center gap-2">
                {getMoodIcon(entry.mood)}
                <span className="text-gray-700 dark:text-gray-300 capitalize">
                  Feeling {entry.mood}
                </span>
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {entry.content}
              </p>
            </div>

            {entry.journal_entry_tags && entry.journal_entry_tags.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {entry.journal_entry_tags.map((jet) => (
                    <span 
                      key={jet.tags.id}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                    >
                      {jet.tags.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}