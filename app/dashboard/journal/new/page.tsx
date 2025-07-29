'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Moon, Sparkles } from 'lucide-react'
import { getMoonPhase } from '@/lib/utils/moon-phase'
import { TagSelector } from '@/components/ui/tag-selector'

const MOODS = [
  'Peaceful', 'Anxious', 'Grateful', 'Empowered', 
  'Confused', 'Inspired', 'Reflective', 'Energized'
]

export default function NewJournalPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const moonPhase = getMoonPhase(new Date())

      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          user_id: user.id,
          title: title.trim() || null,
          content: content.trim(),
          mood: mood || null,
          moon_phase: moonPhase.replace(/[🌑🌒🌓🌔🌕🌖🌗🌘]/g, '').trim(),
        })
        .select()
        .single()

      if (error) throw error

      // Save tag relationships
      if (data && selectedTags.length > 0) {
        const tagRelations = selectedTags.map(tagId => ({
          journal_entry_id: data.id,
          tag_id: tagId
        }))

        const { error: tagError } = await supabase
          .from('journal_entry_tags')
          .insert(tagRelations)

        if (tagError) {
          console.error('Error saving tags:', tagError)
          // Continue even if tags fail to save
        }
      }

      // Automatically navigate to the entry page and request Beatrice's reflection
      if (data) {
        router.push(`/dashboard/journal/${data.id}?requestReflection=true`)
      } else {
        router.push('/dashboard/journal')
      }
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const currentMoonPhase = getMoonPhase(new Date())

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/journal" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journal
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">New Entry</h1>
            <p className="text-sm text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Current Moon</div>
            <div className="text-purple-300">{currentMoonPhase}</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card-mystical">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title..."
                className="input-mystical w-full"
              />
            </div>

            {/* Mood */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Mood
              </label>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(mood === m ? '' : m)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      mood === m
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags
              </label>
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Reflection
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, experiences, or spiritual insights..."
                className="input-mystical w-full min-h-[300px] resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Prompt Ideas */}
        <div className="card-mystical bg-purple-900/20">
          <div className="flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-2">Reflection Prompts:</p>
              <ul className="space-y-1 text-gray-400">
                <li>• What synchronicities did you notice today?</li>
                <li>• How did the moon's energy affect you?</li>
                <li>• What messages did your intuition share?</li>
                <li>• What are you grateful for in this moment?</li>
              </ul>
              <p className="text-xs text-purple-400 mt-3">
                ✨ Beatrice will automatically provide a reflection on your entry after saving.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link 
            href="/dashboard/journal"
            className="px-6 py-3 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !content.trim()}
            className="btn-mystical disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving & requesting reflection...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  )
}