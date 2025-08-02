'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, Moon, Calendar, Hash, Filter } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { getMoonPhase } from '@/lib/utils/moon-phase'

interface JournalEntry {
  id: string
  title: string | null
  content: string
  mood: string | null
  moon_phase: string | null
  created_at: string
  journal_entry_tags?: {
    tags: {
      id: string
      name: string
      category: string | null
    }
  }[]
}

interface Tag {
  id: string
  name: string
  category: string | null
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([])
  const [showTagFilter, setShowTagFilter] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchEntries()
    fetchTags()
  }, [])

  const fetchEntries = async () => {
    try {
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (!error && data) {
      setAvailableTags(data)
    }
  }

  const filteredEntries = entries.filter(entry => {
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      entry.title?.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.mood?.toLowerCase().includes(searchLower)

    // Tag filter
    const matchesTags = selectedFilterTags.length === 0 ||
      selectedFilterTags.some(tagId => 
        entry.journal_entry_tags?.some(jet => jet.tags.id === tagId)
      )

    return matchesSearch && matchesTags
  })

  const toggleFilterTag = (tagId: string) => {
    if (selectedFilterTags.includes(tagId)) {
      setSelectedFilterTags(selectedFilterTags.filter(id => id !== tagId))
    } else {
      setSelectedFilterTags([...selectedFilterTags, tagId])
    }
  }

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'moon_phase': return 'text-purple-400 bg-purple-900/20'
      case 'emotion': return 'text-blue-400 bg-blue-900/20'
      case 'intent': return 'text-green-400 bg-green-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading your sacred writings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Sacred Journal</h1>
          <p className="text-gray-400 mt-1">Your spiritual reflections and insights</p>
        </div>
        <Link href="/dashboard/journal/new" className="btn-mystical">
          <Plus className="w-5 h-5 mr-2" />
          New Entry
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mystical w-full pl-10"
            />
          </div>
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedFilterTags.length > 0 || showTagFilter
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filter {selectedFilterTags.length > 0 && `(${selectedFilterTags.length})`}
          </button>
        </div>

        {/* Tag Filter */}
        {showTagFilter && (
          <div className="card-mystical">
            <div className="space-y-4">
              {Object.entries(
                availableTags.reduce((acc, tag) => {
                  const category = tag.category || 'Other'
                  if (!acc[category]) acc[category] = []
                  acc[category].push(tag)
                  return acc
                }, {} as Record<string, Tag[]>)
              ).map(([category, tags]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-400 mb-2 capitalize">
                    {category.replace('_', ' ')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        onClick={() => toggleFilterTag(tag.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-all ${
                          selectedFilterTags.includes(tag.id)
                            ? `${getCategoryColor(tag.category)} ring-2 ring-purple-500`
                            : `${getCategoryColor(tag.category)} hover:ring-1 hover:ring-purple-500/50`
                        }`}
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="card-mystical text-center py-12">
          <Moon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedFilterTags.length > 0
              ? 'No entries found matching your filters.' 
              : 'Your journal awaits its first entry.'}
          </p>
          {!searchTerm && selectedFilterTags.length === 0 && (
            <Link href="/dashboard/journal/new" className="text-purple-400 hover:text-purple-300">
              Create your first entry →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => (
            <Link
              key={entry.id}
              href={`/dashboard/journal/${entry.id}`}
              className="card-mystical hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {entry.title || 'Untitled Entry'}
                </h3>
                <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0 ml-2" />
              </div>
              
              <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                {entry.content}
              </p>

              {/* Tags */}
              {entry.journal_entry_tags && entry.journal_entry_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {entry.journal_entry_tags.slice(0, 3).map(({ tags }) => (
                    <span
                      key={tags.id}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getCategoryColor(tags.category)}`}
                    >
                      <Hash className="w-2.5 h-2.5 mr-0.5" />
                      {tags.name}
                    </span>
                  ))}
                  {entry.journal_entry_tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{entry.journal_entry_tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span>{format(new Date(entry.created_at), 'MMM d, yyyy')}</span>
                  {entry.mood && (
                    <>
                      <span>•</span>
                      <span className="text-purple-400">{entry.mood}</span>
                    </>
                  )}
                </div>
                {entry.moon_phase && (
                  <span className="text-purple-300">{entry.moon_phase}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
