'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Search, BookOpen, Filter, Grid, List, Star } from 'lucide-react'
import Link from 'next/link'
import CorrespondencesTable from '@/components/correspondences-table'
import { Correspondence } from '@/types/correspondence'

export default function CorrespondencesPage() {
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'table'>('table')
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [showPersonalOnly, setShowPersonalOnly] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const supabase = createClient()

  const fetchCorrespondences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('correspondences')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setCorrespondences(data || [])
    } catch (error) {
      console.error('Error fetching correspondences:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchCorrespondences()
  }, [fetchCorrespondences])

  const toggleFavorite = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('correspondences')
        .update({ is_favorited: !currentState })
        .eq('id', id)

      if (error) throw error

      setCorrespondences(prev => 
        prev.map(item => 
          item.id === id ? { ...item, is_favorited: !currentState } : item
        )
      )
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const filteredCorrespondences = correspondences.filter(item => {
    // Search filter
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.magical_properties.some(prop => prop.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.traditional_uses?.some(use => use.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.personal_notes?.toLowerCase().includes(searchTerm.toLowerCase())

    // Category filter
    const matchesCategory = !selectedCategory || item.category === selectedCategory

    // Property filter
    const matchesProperty = !selectedProperty || 
      item.magical_properties.includes(selectedProperty)

    // Personal filter
    const matchesPersonal = !showPersonalOnly || item.is_personal

    // Favorites filter
    const matchesFavorites = !showFavoritesOnly || item.is_favorited

    return matchesSearch && matchesCategory && matchesProperty && matchesPersonal && matchesFavorites
  })

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
        <div className="text-purple-400">Loading magical correspondences...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Correspondence Index</h1>
          <p className="text-gray-400 mt-1">Your magical reference library</p>
        </div>
        <Link href="/dashboard/correspondences/new" className="btn-mystical">
          <Plus className="w-5 h-5 mr-2" />
          Add Correspondence
        </Link>
      </div>

      {/* Search and View Mode */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search correspondences, properties, or uses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-mystical w-full pl-10"
          />
        </div>
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            title="Table view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <CorrespondencesTable
          correspondences={filteredCorrespondences}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          {/* Simple Filters for Grid View */}
          <div className="card-mystical p-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-mystical w-full"
                >
                  <option value="">All Categories</option>
                  {[...new Set(correspondences.map(c => c.category))].sort().map(category => (
                    <option key={category} value={category}>
                      {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Magical Property</label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="input-mystical w-full"
                >
                  <option value="">All Properties</option>
                  {[...new Set(correspondences.flatMap(c => c.magical_properties))].sort().map(property => (
                    <option key={property} value={property}>
                      {property.replace('_', ' ').charAt(0).toUpperCase() + property.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Filter Options</label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showPersonalOnly}
                    onChange={(e) => setShowPersonalOnly(e.target.checked)}
                    className="mr-2 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">Personal only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showFavoritesOnly}
                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                    className="mr-2 rounded border-purple-500 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-300">Favorites only</span>
                </label>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCategory('')
                    setSelectedProperty('')
                    setShowPersonalOnly(false)
                    setShowFavoritesOnly(false)
                  }}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {filteredCorrespondences.length} of {correspondences.length} correspondences
            </span>
            <div className="flex items-center gap-4">
              <span>{correspondences.filter(c => c.is_personal).length} personal</span>
              <span>{correspondences.filter(c => c.is_favorited).length} favorited</span>
            </div>
          </div>

          {/* Grid Display */}
          {filteredCorrespondences.length === 0 ? (
            <div className="card-mystical text-center py-12">
              <BookOpen className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
                {searchTerm || selectedCategory || selectedProperty || showPersonalOnly || showFavoritesOnly
                  ? 'No correspondences found matching your filters.' 
                  : 'Your correspondence index awaits its first entry.'}
              </p>
              {!searchTerm && !selectedCategory && !selectedProperty && !showPersonalOnly && !showFavoritesOnly && (
                <Link href="/dashboard/correspondences/new" className="text-purple-400 hover:text-purple-300">
                  Add your first correspondence →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredCorrespondences.map((item) => (
                <div
                  key={item.id}
                  className="card-mystical hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                      <div>
                        <Link
                          href={`/dashboard/correspondences/${item.id}`}
                          className="font-semibold text-lg hover:text-purple-300 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 capitalize">
                            {item.category}
                          </span>
                          {item.is_personal && (
                            <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">
                              Personal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFavorite(item.id, item.is_favorited)}
                      className="text-gray-400 hover:text-yellow-400 transition-colors"
                    >
                      <Star className={`w-5 h-5 ${item.is_favorited ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>

                  {/* Magical Properties */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.magical_properties.slice(0, 4).map((property) => (
                      <span
                        key={property}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getPropertyColor(property)}`}
                      >
                        {property.replace('_', ' ')}
                      </span>
                    ))}
                    {item.magical_properties.length > 4 && (
                      <span className="text-xs text-gray-500">
                        +{item.magical_properties.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Traditional Uses Preview */}
                  {item.traditional_uses && item.traditional_uses.length > 0 && (
                    <div className="text-sm text-gray-400 mb-3">
                      <strong>Uses:</strong> {item.traditional_uses.slice(0, 3).join(', ')}
                      {item.traditional_uses.length > 3 && '...'}
                    </div>
                  )}

                  {/* Personal Notes Preview */}
                  {item.personal_notes && (
                    <div className="text-sm text-gray-300 mb-3 bg-purple-900/10 p-2 rounded italic">
                      &ldquo;{item.personal_notes.slice(0, 100)}{item.personal_notes.length > 100 ? '...' : ''}&rdquo;
                    </div>
                  )}

                  {/* Additional Properties */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      {item.element && <span>Element: {item.element}</span>}
                      {item.planet && <span>Planet: {item.planet}</span>}
                    </div>
                    <Link
                      href={`/dashboard/correspondences/${item.id}`}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}