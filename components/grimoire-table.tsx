'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronsUpDown,
  Star, 
  Eye, 
  Edit,
  Filter,
  X,
  Sparkles,
  Scroll,
  Heart,
  Shield,
  Brain,
  Gem,
  BookOpen,
  CheckCircle,
  Circle
} from 'lucide-react'

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

interface GrimoireTableProps {
  entries: GrimoireEntry[]
  onToggleFavorite: (id: string, currentState: boolean) => void
  onToggleTested: (id: string, currentState: boolean) => void
  onDelete?: (id: string) => void
}

type SortField = 'title' | 'type' | 'category' | 'difficulty_level' | 'effectiveness_rating' | 'created_at' | 'updated_at'
type SortOrder = 'asc' | 'desc'

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

export default function GrimoireTable({ 
  entries, 
  onToggleFavorite,
  onToggleTested,
  onDelete 
}: GrimoireTableProps) {
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    element: '',
    moonPhase: '',
    tags: [] as string[],
    testedOnly: false,
    favoritesOnly: false,
    publicOnly: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTag, setSelectedTag] = useState('')

  // Get unique values for filters
  const types = useMemo(() => {
    const typeSet = new Set(entries.map(e => e.type))
    return Array.from(typeSet).sort()
  }, [entries])

  const categories = useMemo(() => {
    const cats = new Set(entries.map(e => e.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [entries])

  const elements = useMemo(() => {
    const els = new Set(entries.map(e => e.element).filter(Boolean))
    return Array.from(els).sort()
  }, [entries])

  const moonPhases = useMemo(() => {
    const phases = new Set(entries.map(e => e.moon_phase).filter(Boolean))
    return Array.from(phases).sort()
  }, [entries])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    entries.forEach(e => e.tags?.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [entries])

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter(item => {
      if (filters.type && item.type !== filters.type) return false
      if (filters.category && item.category !== filters.category) return false
      if (filters.element && item.element !== filters.element) return false
      if (filters.moonPhase && item.moon_phase !== filters.moonPhase) return false
      if (filters.testedOnly && !item.is_tested) return false
      if (filters.favoritesOnly && !item.is_favorite) return false
      if (filters.publicOnly && !item.is_public) return false
      if (filters.tags.length > 0) {
        const hasTags = filters.tags.some(tag => item.tags?.includes(tag))
        if (!hasTags) return false
      }
      return true
    })
  }, [entries, filters])

  // Sort entries
  const sortedEntries = useMemo(() => {
    const sorted = [...filteredEntries].sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      // Handle null/undefined values
      if (aVal === null || aVal === undefined) aVal = ''
      if (bVal === null || bVal === undefined) bVal = ''

      // Convert to lowercase for string comparison
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      // Compare values
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  }, [filteredEntries, sortField, sortOrder])

  // Get type icon and styling
  const getTypeConfig = (type: string) => {
    return TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.other
  }

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-500" />
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-purple-400" />
      : <ChevronDown className="w-4 h-4 text-purple-400" />
  }

  // Add tag to filter
  const addTagFilter = () => {
    if (selectedTag && !filters.tags.includes(selectedTag)) {
      setFilters({
        ...filters,
        tags: [...filters.tags, selectedTag]
      })
      setSelectedTag('')
    }
  }

  // Remove tag from filter
  const removeTagFilter = (tag: string) => {
    setFilters({
      ...filters,
      tags: filters.tags.filter(t => t !== tag)
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      element: '',
      moonPhase: '',
      tags: [],
      testedOnly: false,
      favoritesOnly: false,
      publicOnly: false
    })
  }

  // Difficulty level display
  const getDifficultyDisplay = (level: number | null) => {
    if (!level) return '-'
    const stars = '★'.repeat(level) + '☆'.repeat(5 - level)
    return <span className="text-yellow-400">{stars}</span>
  }

  // Effectiveness rating display
  const getEffectivenessDisplay = (rating: number | null) => {
    if (!rating) return '-'
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
    return <span className="text-green-400">{stars}</span>
  }

  const hasActiveFilters = filters.type || filters.category || filters.element || 
    filters.moonPhase || filters.tags.length > 0 || filters.testedOnly || 
    filters.favoritesOnly || filters.publicOnly

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            hasActiveFilters
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-purple-700 text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>
        <div className="text-sm text-gray-400">
          Showing {sortedEntries.length} of {entries.length} entries
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card-mystical p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="input-mystical w-full text-sm"
              >
                <option value="">All Types</option>
                {types.map(type => {
                  const config = getTypeConfig(type)
                  const Icon = config.icon
                  return (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="input-mystical w-full text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat || ''}>
                    {cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Element Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Element</label>
              <select
                value={filters.element}
                onChange={(e) => setFilters({ ...filters, element: e.target.value })}
                className="input-mystical w-full text-sm"
              >
                <option value="">All Elements</option>
                {elements.map(el => (
                  <option key={el} value={el || ''}>{el}</option>
                ))}
              </select>
            </div>

            {/* Moon Phase Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Moon Phase</label>
              <select
                value={filters.moonPhase}
                onChange={(e) => setFilters({ ...filters, moonPhase: e.target.value })}
                className="input-mystical w-full text-sm"
              >
                <option value="">All Phases</option>
                {moonPhases.map(phase => (
                  <option key={phase} value={phase || ''}>{phase}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.testedOnly}
                onChange={(e) => setFilters({ ...filters, testedOnly: e.target.checked })}
                className="mr-2 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Tested only</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.favoritesOnly}
                onChange={(e) => setFilters({ ...filters, favoritesOnly: e.target.checked })}
                className="mr-2 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Favorites only</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.publicOnly}
                onChange={(e) => setFilters({ ...filters, publicOnly: e.target.checked })}
                className="mr-2 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Public only</span>
            </label>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="input-mystical flex-1 text-sm"
              >
                <option value="">Select a tag...</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <button
                onClick={addTagFilter}
                disabled={!selectedTag}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add
              </button>
            </div>
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-900/30 text-purple-400"
                  >
                    {tag}
                    <button
                      onClick={() => removeTagFilter(tag)}
                      className="ml-2 hover:text-purple-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-400"
                >
                  Title
                  <SortIcon field="title" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('type')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-400"
                >
                  Type
                  <SortIcon field="type" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('category')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-400"
                >
                  Category
                  <SortIcon field="category" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('difficulty_level')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-400"
                >
                  Difficulty
                  <SortIcon field="difficulty_level" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('effectiveness_rating')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-400"
                >
                  Effectiveness
                  <SortIcon field="effectiveness_rating" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-sm font-medium text-gray-400">Status</span>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-sm font-medium text-gray-400">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sortedEntries.map((entry) => {
              const config = getTypeConfig(entry.type)
              const Icon = config.icon
              
              return (
                <tr key={entry.id} className="hover:bg-gray-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/grimoire/${entry.id}`}
                      className="flex items-center gap-2 hover:text-purple-300 transition-colors"
                    >
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <span className="font-medium">{entry.title}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400 capitalize">{entry.category || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {getDifficultyDisplay(entry.difficulty_level)}
                  </td>
                  <td className="px-4 py-3">
                    {getEffectivenessDisplay(entry.effectiveness_rating)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {entry.is_tested && (
                        <span className="text-green-400" title="Tested">
                          <CheckCircle className="w-4 h-4" />
                        </span>
                      )}
                      <button
                        onClick={() => onToggleFavorite(entry.id, entry.is_favorite)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors"
                      >
                        <Star className={`w-4 h-4 ${entry.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </button>
                      {entry.is_public && (
                        <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded-full">
                          Public
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/dashboard/grimoire/${entry.id}`}
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/grimoire/${entry.id}?edit=true`}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {sortedEntries.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No entries found matching your filters.
          </div>
        )}
      </div>
    </div>
  )
}