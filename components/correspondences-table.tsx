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
  Sparkles,
  Filter,
  X
} from 'lucide-react'
import { Correspondence } from '@/types/correspondence'

interface CorrespondencesTableProps {
  correspondences: Correspondence[]
  onToggleFavorite: (id: string, currentState: boolean) => void
  onDelete?: (id: string) => void
}

type SortField = 'name' | 'category' | 'element' | 'planet' | 'created_at' | 'updated_at'
type SortOrder = 'asc' | 'desc'

export default function CorrespondencesTable({ 
  correspondences, 
  onToggleFavorite,
  onDelete 
}: CorrespondencesTableProps) {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [filters, setFilters] = useState({
    category: '',
    element: '',
    planet: '',
    properties: [] as string[],
    personalOnly: false,
    favoritesOnly: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState('')

  // Get unique values for filters
  const categories = useMemo(() => {
    const cats = new Set(correspondences.map(c => c.category))
    return Array.from(cats).sort()
  }, [correspondences])

  const elements = useMemo(() => {
    const els = new Set(correspondences.map(c => c.element).filter(Boolean))
    return Array.from(els).sort()
  }, [correspondences])

  const planets = useMemo(() => {
    const pls = new Set(correspondences.map(c => c.planet).filter(Boolean))
    return Array.from(pls).sort()
  }, [correspondences])

  const allProperties = useMemo(() => {
    const props = new Set<string>()
    correspondences.forEach(c => c.magical_properties.forEach(p => props.add(p)))
    return Array.from(props).sort()
  }, [correspondences])

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Filter correspondences
  const filteredCorrespondences = useMemo(() => {
    return correspondences.filter(item => {
      if (filters.category && item.category !== filters.category) return false
      if (filters.element && item.element !== filters.element) return false
      if (filters.planet && item.planet !== filters.planet) return false
      if (filters.personalOnly && !item.is_personal) return false
      if (filters.favoritesOnly && !item.is_favorited) return false
      if (filters.properties.length > 0) {
        const hasAllProperties = filters.properties.every(prop => 
          item.magical_properties.includes(prop)
        )
        if (!hasAllProperties) return false
      }
      return true
    })
  }, [correspondences, filters])

  // Sort correspondences
  const sortedCorrespondences = useMemo(() => {
    const sorted = [...filteredCorrespondences].sort((a, b) => {
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
  }, [filteredCorrespondences, sortField, sortOrder])

  // Get category icon
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

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-500" />
    }
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-purple-400" />
      : <ChevronDown className="w-4 h-4 text-purple-400" />
  }

  // Add property to filter
  const addPropertyFilter = () => {
    if (selectedProperty && !filters.properties.includes(selectedProperty)) {
      setFilters({
        ...filters,
        properties: [...filters.properties, selectedProperty]
      })
      setSelectedProperty('')
    }
  }

  // Remove property from filter
  const removePropertyFilter = (property: string) => {
    setFilters({
      ...filters,
      properties: filters.properties.filter(p => p !== property)
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      element: '',
      planet: '',
      properties: [],
      personalOnly: false,
      favoritesOnly: false
    })
  }

  const hasActiveFilters = filters.category || filters.element || filters.planet || 
    filters.properties.length > 0 || filters.personalOnly || filters.favoritesOnly

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
          Showing {sortedCorrespondences.length} of {correspondences.length} correspondences
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card-mystical p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                  <option key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
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

            {/* Planet Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Planet</label>
              <select
                value={filters.planet}
                onChange={(e) => setFilters({ ...filters, planet: e.target.value })}
                className="input-mystical w-full text-sm"
              >
                <option value="">All Planets</option>
                {planets.map(pl => (
                  <option key={pl} value={pl || ''}>{pl}</option>
                ))}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Options</label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.personalOnly}
                  onChange={(e) => setFilters({ ...filters, personalOnly: e.target.checked })}
                  className="mr-2 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">Personal only</span>
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
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Clear all filters
              </button>
            </div>
          </div>

          {/* Magical Properties Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Magical Properties</label>
            <div className="flex gap-2 mb-2">
              <select
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="input-mystical flex-1 text-sm"
              >
                <option value="">Select a property...</option>
                {allProperties.map(prop => (
                  <option key={prop} value={prop}>
                    {prop.replace('_', ' ').charAt(0).toUpperCase() + prop.replace('_', ' ').slice(1)}
                  </option>
                ))}
              </select>
              <button
                onClick={addPropertyFilter}
                disabled={!selectedProperty}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add
              </button>
            </div>
            {filters.properties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.properties.map(prop => (
                  <span
                    key={prop}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-900/30 text-purple-400"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {prop.replace('_', ' ')}
                    <button
                      onClick={() => removePropertyFilter(prop)}
                      className="ml-2 hover:text-purple-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
                  onClick={() => handleSort('name')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-400"
                >
                  Name
                  <SortIcon field="name" />
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
                <span className="text-sm font-medium text-gray-400">Properties</span>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('element')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-400"
                >
                  Element
                  <SortIcon field="element" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('planet')}
                  className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-purple-400"
                >
                  Planet
                  <SortIcon field="planet" />
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
            {sortedCorrespondences.map((item) => (
              <tr key={item.id} className="hover:bg-gray-900/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/correspondences/${item.id}`}
                    className="flex items-center gap-2 hover:text-purple-300 transition-colors"
                  >
                    <span className="text-xl">{getCategoryIcon(item.category)}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-400 capitalize">{item.category}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.magical_properties.slice(0, 3).map((prop) => (
                      <span
                        key={prop}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-900/30 text-purple-400"
                      >
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        {prop.replace('_', ' ')}
                      </span>
                    ))}
                    {item.magical_properties.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{item.magical_properties.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-400">{item.element || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-400">{item.planet || '-'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    {item.is_personal && (
                      <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">
                        Personal
                      </span>
                    )}
                    <button
                      onClick={() => onToggleFavorite(item.id, item.is_favorited)}
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <Star className={`w-4 h-4 ${item.is_favorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/dashboard/correspondences/${item.id}`}
                      className="text-gray-400 hover:text-purple-400 transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {item.is_personal && (
                      <Link
                        href={`/dashboard/correspondences/${item.id}?edit=true`}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sortedCorrespondences.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            No correspondences found matching your filters.
          </div>
        )}
      </div>
    </div>
  )
}