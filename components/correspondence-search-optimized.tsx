'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Correspondence } from '@/types/correspondence'
import { VirtualCorrespondenceList, useVirtualCorrespondenceList } from '@/components/ui/virtual-correspondence-list'
import { useAdvancedSearch } from '@/lib/hooks/use-debounced-search'
import { CorrespondenceSearch, getCorrespondenceSearch } from '@/lib/utils/correspondence-search'
import { useCursorPagination } from '@/lib/utils/cursor-pagination'
import { filterAndSortAsync, processCorrespondencesAsync } from '@/lib/utils/correspondence-utils'
import { Search, Filter, SortAsc, SortDesc, Grid, List, Settings, Download, RefreshCw } from 'lucide-react'

interface CorrespondenceSearchOptimizedProps {
  correspondences: Correspondence[]
  onItemClick?: (correspondence: Correspondence) => void
  onSelectionChange?: (selectedItems: Correspondence[]) => void
  className?: string
}

interface FilterState {
  category?: string
  element?: string
  energy?: 'masculine' | 'feminine'
  planet?: string
  properties?: string[]
  personalOnly?: boolean
  favoritesOnly?: boolean
  verifiedOnly?: boolean
}

interface SortState {
  field: keyof Correspondence
  direction: 'asc' | 'desc'
}

/**
 * Optimized correspondence search component with virtual scrolling,
 * fuzzy search, web workers, and cursor pagination
 */
export function CorrespondenceSearchOptimized({
  correspondences,
  onItemClick,
  onSelectionChange,
  className = ''
}: CorrespondenceSearchOptimizedProps) {
  // State management
  const [filters, setFilters] = useState<FilterState>({})
  const [sort, setSort] = useState<SortState>({ field: 'name', direction: 'asc' })
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Initialize search with Fuse.js
  const searchInstance = useMemo(() => {
    return getCorrespondenceSearch(correspondences)
  }, [correspondences])

  // Advanced search with multiple strategies
  const advancedSearch = useAdvancedSearch({
    instant: (query: string) => {
      // Instant search for immediate feedback (first 10 results)
      if (!query.trim()) return correspondences.slice(0, 10)
      return searchInstance.search(query, 10).map(result => result.item)
    },
    debounced: async (query: string) => {
      // Full fuzzy search with all features
      if (!query.trim()) return correspondences
      
      const results = searchInstance.searchWithFilters(query, filters, 100)
      return results.map(result => result.item)
    },
    suggestions: async (query: string) => {
      // Search suggestions for autocomplete
      return searchInstance.getSuggestions(query, 8)
    }
  }, {
    delay: 250,
    minLength: 1
  })

  // Process results with Web Workers for large datasets
  const [processedResults, setProcessedResults] = useState<Correspondence[]>([])
  
  useEffect(() => {
    const processResults = async () => {
      setIsProcessing(true)
      
      try {
        let results = advancedSearch.results.length > 0 
          ? advancedSearch.results 
          : correspondences

        // Apply filters and sorting using Web Worker if needed
        if (results.length > 50) {
          results = await filterAndSortAsync(
            results,
            filters,
            sort.field as string,
            sort.direction
          )
        } else {
          // Simple synchronous processing for small datasets
          results = results.filter(item => {
            if (filters.category && item.category !== filters.category) return false
            if (filters.element && item.element !== filters.element) return false
            if (filters.energy && item.energy_type !== filters.energy) return false
            if (filters.personalOnly && !item.is_personal) return false
            if (filters.favoritesOnly && !item.is_favorited) return false
            if (filters.verifiedOnly && !item.verified) return false
            return true
          })
          
          results.sort((a, b) => {
            const aVal = a[sort.field]
            const bVal = b[sort.field]
            const comparison = String(aVal).localeCompare(String(bVal))
            return sort.direction === 'desc' ? -comparison : comparison
          })
        }

        setProcessedResults(results)
      } catch (error) {
        console.error('Error processing results:', error)
        setProcessedResults([])
      } finally {
        setIsProcessing(false)
      }
    }

    processResults()
  }, [advancedSearch.results, correspondences, filters, sort])

  // Virtual list management
  const virtualList = useVirtualCorrespondenceList(processedResults, {
    itemHeight: 120,
    containerHeight: 600,
    overscan: 5
  })

  // Update selection callback
  useEffect(() => {
    onSelectionChange?.(virtualList.getSelectedCorrespondences())
  }, [virtualList.selectedItems, onSelectionChange])

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    advancedSearch.clearSearch()
  }, [advancedSearch])

  // Sort handlers
  const handleSortChange = useCallback((field: keyof Correspondence) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Export functionality
  const handleExport = useCallback(async () => {
    const selectedItems = virtualList.getSelectedCorrespondences()
    const itemsToExport = selectedItems.length > 0 ? selectedItems : processedResults
    
    // Prepare CSV export
    const csvContent = itemsToExport.map(item => ({
      name: item.name,
      category: item.category,
      description: item.description || '',
      magical_properties: item.magical_properties.join('; '),
      element: item.element || '',
      planet: item.planet || ''
    }))
    
    const csv = [
      Object.keys(csvContent[0]).join(','),
      ...csvContent.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `correspondences-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [virtualList, processedResults])

  return (
    <div className={`correspondence-search-optimized ${className}`}>
      {/* Search Header */}
      <div className="card-mystical mb-6">
        <div className="p-4">
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={advancedSearch.query}
              onChange={(e) => advancedSearch.setQuery(e.target.value)}
              placeholder="Search correspondences... (herbs, crystals, properties, etc.)"
              className="input-mystical pl-10 w-full"
            />
            
            {/* Search suggestions dropdown */}
            {advancedSearch.suggestions.length > 0 && advancedSearch.query && (
              <div className="absolute top-full left-0 right-0 z-10 bg-gray-900 border border-purple-500/30 rounded-lg mt-1 max-h-40 overflow-y-auto">
                {advancedSearch.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => advancedSearch.setQuery(suggestion)}
                    className="w-full text-left px-4 py-2 hover:bg-purple-900/30 text-gray-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Instant results preview */}
          {advancedSearch.query && advancedSearch.instantResults.length > 0 && (
            <div className="mb-4 p-3 bg-purple-900/20 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                Quick Results ({advancedSearch.instantResults.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {advancedSearch.instantResults.slice(0, 5).map(item => (
                  <button
                    key={item.id}
                    onClick={() => onItemClick?.(item)}
                    className="px-3 py-1 bg-purple-800/50 text-gray-200 text-sm rounded-full hover:bg-purple-700/50 transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-mystical px-3 py-2 text-sm ${showFilters ? 'bg-purple-700' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleSortChange('name')}
                  className={`btn-mystical px-3 py-2 text-sm ${sort.field === 'name' ? 'bg-purple-700' : ''}`}
                >
                  Name
                  {sort.field === 'name' && (
                    sort.direction === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
                  )}
                </button>
                <button
                  onClick={() => handleSortChange('category')}
                  className={`btn-mystical px-3 py-2 text-sm ${sort.field === 'category' ? 'bg-purple-700' : ''}`}
                >
                  Category
                  {sort.field === 'category' && (
                    sort.direction === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* View mode toggle */}
              <div className="flex items-center border border-purple-500/30 rounded-lg">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-purple-700 text-white' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-purple-700 text-white' : 'text-gray-400'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleExport}
                className="btn-mystical px-3 py-2 text-sm"
                title="Export results"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-purple-500/30 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                className="input-mystical text-sm"
              >
                <option value="">All Categories</option>
                <option value="herbs">Herbs</option>
                <option value="crystals">Crystals</option>
                <option value="oils">Oils</option>
                <option value="incense">Incense</option>
              </select>

              <select
                value={filters.element || ''}
                onChange={(e) => handleFilterChange({ element: e.target.value || undefined })}
                className="input-mystical text-sm"
              >
                <option value="">All Elements</option>
                <option value="Air">Air</option>
                <option value="Fire">Fire</option>
                <option value="Water">Water</option>
                <option value="Earth">Earth</option>
              </select>

              <select
                value={filters.energy || ''}
                onChange={(e) => handleFilterChange({ energy: e.target.value as any || undefined })}
                className="input-mystical text-sm"
              >
                <option value="">All Energies</option>
                <option value="masculine">Masculine</option>
                <option value="feminine">Feminine</option>
              </select>

              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.personalOnly || false}
                  onChange={(e) => handleFilterChange({ personalOnly: e.target.checked || undefined })}
                  className="mr-2"
                />
                Personal Only
              </label>

              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.favoritesOnly || false}
                  onChange={(e) => handleFilterChange({ favoritesOnly: e.target.checked || undefined })}
                  className="mr-2"
                />
                Favorites
              </label>

              <button
                onClick={clearFilters}
                className="btn-mystical px-3 py-2 text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>
            Showing {processedResults.length} of {correspondences.length} correspondences
          </span>
          {virtualList.selectedItems.size > 0 && (
            <span className="text-purple-400">
              {virtualList.selectedItems.size} selected
            </span>
          )}
          {isProcessing && (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={virtualList.selectAll}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Select All
          </button>
          <button
            onClick={virtualList.selectNone}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Select None
          </button>
        </div>
      </div>

      {/* Virtual Scrolling List */}
      <VirtualCorrespondenceList
        correspondences={processedResults}
        onItemClick={onItemClick}
        onItemSelect={virtualList.handleItemSelect}
        selectedItems={virtualList.selectedItems}
        {...virtualList.listProps}
        className="card-mystical"
      />

      {/* Loading States */}
      {advancedSearch.isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mr-2" />
          <span className="text-gray-400">Searching...</span>
        </div>
      )}

      {advancedSearch.error && (
        <div className="text-red-400 text-sm mt-2 p-3 bg-red-900/20 rounded-lg">
          Search error: {advancedSearch.error}
        </div>
      )}
    </div>
  )
}