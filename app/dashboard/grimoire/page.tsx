'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, BookOpen, Sparkles, Scroll, Heart, Shield, Star, DollarSign, Filter } from 'lucide-react'
import Link from 'next/link'

interface GrimoireEntry {
  id: string
  title: string
  category: string
  subcategory: string | null
  purpose: string | null
  ingredients: string[] | null
  tools: string[] | null
  timing: string | null
  times_used: number
  last_used_at: string | null
  created_at: string
}

const CATEGORY_CONFIG = {
  spell: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-900/20' },
  ritual: { icon: Star, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  chant: { icon: Scroll, color: 'text-green-400', bg: 'bg-green-900/20' },
  blessing: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-900/20' },
  invocation: { icon: BookOpen, color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
  recipe: { icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  other: { icon: Scroll, color: 'text-gray-400', bg: 'bg-gray-900/20' },
}

const SUBCATEGORIES = [
  'Protection', 'Love', 'Prosperity', 'Healing', 'Banishing',
  'Divination', 'Cleansing', 'Grounding', 'Manifestation', 'Other'
]

export default function GrimoirePage() {
  const [entries, setEntries] = useState<GrimoireEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('grimoire_entries')
        .select('*')
        .order('category', { ascending: true })
        .order('title', { ascending: true })

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching grimoire entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = entries.filter(entry => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      entry.title.toLowerCase().includes(searchLower) ||
      entry.purpose?.toLowerCase().includes(searchLower) ||
      entry.subcategory?.toLowerCase().includes(searchLower)

    const matchesCategory = !selectedCategory || entry.category === selectedCategory
    const matchesSubcategory = !selectedSubcategory || entry.subcategory === selectedSubcategory

    return matchesSearch && matchesCategory && matchesSubcategory
  })

  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = []
    acc[entry.category].push(entry)
    return acc
  }, {} as Record<string, GrimoireEntry[]>)

  const totalUsage = entries.reduce((sum, entry) => sum + entry.times_used, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading your grimoire...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Personal Grimoire</h1>
          <p className="text-gray-400 mt-1">Your collection of spells, rituals, and magical knowledge</p>
        </div>
        <Link href="/dashboard/grimoire/new" className="btn-mystical">
          <Plus className="w-5 h-5 mr-2" />
          Add Entry
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-purple-300">{entries.length}</p>
          <p className="text-sm text-gray-400">Total Entries</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-blue-300">
            {entries.filter(e => e.category === 'spell').length}
          </p>
          <p className="text-sm text-gray-400">Spells</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-green-300">
            {entries.filter(e => e.category === 'ritual').length}
          </p>
          <p className="text-sm text-gray-400">Rituals</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-pink-300">{totalUsage}</p>
          <p className="text-sm text-gray-400">Times Used</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search grimoire entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mystical w-full pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedCategory || selectedSubcategory || showFilters
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="card-mystical space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    !selectedCategory
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-3 py-1 rounded-full text-sm transition-all flex items-center gap-1 ${
                      selectedCategory === key
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    <config.icon className="w-3 h-3" />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">Subcategory</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubcategory('')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    !selectedSubcategory
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {SUBCATEGORIES.map((subcat) => (
                  <button
                    key={subcat}
                    onClick={() => setSelectedSubcategory(subcat.toLowerCase())}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      selectedSubcategory === subcat.toLowerCase()
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {subcat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entries by Category */}
      {Object.keys(groupedEntries).length === 0 ? (
        <div className="card-mystical text-center py-12">
          <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            {searchTerm || selectedCategory || selectedSubcategory
              ? 'No entries found matching your filters.' 
              : 'Your grimoire is empty. Start building your magical library!'}
          </p>
          {!searchTerm && !selectedCategory && !selectedSubcategory && (
            <Link href="/dashboard/grimoire/new" className="text-purple-400 hover:text-purple-300">
              Add your first entry →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([category, categoryEntries]) => {
            const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
            const Icon = config.icon
            
            return (
              <div key={category}>
                <div className="flex items-center space-x-2 mb-4">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <h2 className="text-lg font-semibold capitalize">
                    {category}s ({categoryEntries.length})
                  </h2>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryEntries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/dashboard/grimoire/${entry.id}`}
                      className={`card-mystical hover:scale-[1.02] transition-transform ${config.bg}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {entry.title}
                        </h3>
                        <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 ml-2`} />
                      </div>
                      
                      {entry.subcategory && (
                        <p className="text-sm text-gray-400 mb-2 capitalize">
                          {entry.subcategory}
                        </p>
                      )}
                      
                      {entry.purpose && (
                        <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                          {entry.purpose}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          {entry.timing && (
                            <span>{entry.timing}</span>
                          )}
                          {entry.tools && entry.tools.length > 0 && (
                            <span>{entry.tools.length} tools</span>
                          )}
                        </div>
                        {entry.times_used > 0 && (
                          <span className="text-green-400">
                            Used {entry.times_used}x
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}