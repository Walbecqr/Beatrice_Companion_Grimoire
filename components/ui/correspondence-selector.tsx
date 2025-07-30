// components/ui/correspondence-selector.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, X, Hash, Star, Sparkles, Plus } from 'lucide-react'
import { Correspondence } from '@/types/correspondence'
import { getCategoryIcon, getPropertyColor, formatPropertyName } from '@/lib/utils/correspondence-utils'

interface CorrespondenceSelectorProps {
  selectedCorrespondences: string[]
  onCorrespondencesChange: (correspondenceIds: string[]) => void
  maxSelections?: number
  placeholder?: string
  className?: string
  showCreateOption?: boolean
}

export function CorrespondenceSelector({ 
  selectedCorrespondences, 
  onCorrespondencesChange, 
  maxSelections,
  placeholder = "Search correspondences...",
  className = '',
  showCreateOption = false
}: CorrespondenceSelectorProps) {
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchCorrespondences()
  }, [])

  const fetchCorrespondences = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('correspondences')
        .select('*')
        .order('verified', { ascending: false })
        .order('name', { ascending: true })

      if (error) throw error
      setCorrespondences(data || [])
    } catch (error) {
      console.error('Error fetching correspondences:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCorrespondence = (correspondenceId: string) => {
    if (selectedCorrespondences.includes(correspondenceId)) {
      onCorrespondencesChange(selectedCorrespondences.filter(id => id !== correspondenceId))
    } else {
      if (maxSelections && selectedCorrespondences.length >= maxSelections) {
        return // Don't add if at max limit
      }
      onCorrespondencesChange([...selectedCorrespondences, correspondenceId])
    }
  }

  const removeCorrespondence = (correspondenceId: string) => {
    onCorrespondencesChange(selectedCorrespondences.filter(id => id !== correspondenceId))
  }

  const selectedCorrespondenceObjects = correspondences.filter(c => 
    selectedCorrespondences.includes(c.id)
  )

  const filteredCorrespondences = correspondences.filter(correspondence => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      correspondence.name.toLowerCase().includes(searchLower) ||
      correspondence.category.toLowerCase().includes(searchLower) ||
      correspondence.magical_properties.some(prop => prop.toLowerCase().includes(searchLower)) ||
      correspondence.traditional_uses?.some(use => use.toLowerCase().includes(searchLower)) ||
      correspondence.deities?.some(deity => deity.toLowerCase().includes(searchLower))
    )
  })

  const groupedCorrespondences = filteredCorrespondences.reduce((acc, correspondence) => {
    const category = correspondence.category
    if (!acc[category]) acc[category] = []
    acc[category].push(correspondence)
    return acc
  }, {} as Record<string, Correspondence[]>)

  return (
    <div className={className}>
      {/* Selected Correspondences */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedCorrespondenceObjects.map(correspondence => (
          <span
            key={correspondence.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900/20 text-purple-300 border border-purple-500/30"
          >
            <span className="mr-1">{getCategoryIcon(correspondence.category)}</span>
            {correspondence.name}
            {correspondence.is_favorited && (
              <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />
            )}
            <button
              type="button"
              onClick={() => removeCorrespondence(correspondence.id)}
              className="ml-2 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {/* Add Correspondence Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors"
          disabled={Boolean(maxSelections && selectedCorrespondences.length >= maxSelections)}
        >
          <Hash className="w-3 h-3 mr-1" />
          Add Correspondence
          {maxSelections && (
            <span className="ml-1 text-xs">
              ({selectedCorrespondences.length}/{maxSelections})
            </span>
          )}
        </button>
      </div>

      {/* Correspondence Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Select Correspondences</h3>
              {showCreateOption && (
                <a
                  href="/dashboard/correspondences/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </a>
              )}
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-mystical w-full pl-10"
                autoFocus
              />
            </div>

            {/* Correspondence List */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-400">Loading correspondences...</div>
              ) : Object.keys(groupedCorrespondences).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {searchTerm ? 'No correspondences found matching your search.' : 'No correspondences available.'}
                </div>
              ) : (
                Object.entries(groupedCorrespondences).map(([category, categoryCorrespondences]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-400 mb-2 capitalize flex items-center">
                      <span className="mr-2">{getCategoryIcon(category)}</span>
                      {category.replace('_', ' ')}
                      <span className="ml-2 text-xs">({categoryCorrespondences.length})</span>
                    </h4>
                    <div className="grid gap-2">
                      {categoryCorrespondences.map(correspondence => (
                        <button
                          key={correspondence.id}
                          type="button"
                          onClick={() => toggleCorrespondence(correspondence.id)}
                          disabled={
                            !selectedCorrespondences.includes(correspondence.id) &&
                            !!maxSelections && 
                            selectedCorrespondences.length >= maxSelections
                          }
                          className={`text-left p-3 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedCorrespondences.includes(correspondence.id)
                              ? 'bg-purple-900/20 border-purple-500/50 text-purple-300'
                              : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{correspondence.name}</span>
                                {correspondence.is_favorited && (
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                )}
                                {correspondence.verified && (
                                  <span className="text-xs bg-green-900/20 text-green-400 px-2 py-0.5 rounded-full">
                                    Verified
                                  </span>
                                )}
                                {correspondence.is_personal && (
                                  <span className="text-xs bg-purple-900/20 text-purple-400 px-2 py-0.5 rounded-full">
                                    Personal
                                  </span>
                                )}
                              </div>
                              
                              {correspondence.description && (
                                <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                                  {correspondence.description}
                                </p>
                              )}

                              {/* Magical Properties */}
                              <div className="flex flex-wrap gap-1">
                                {correspondence.magical_properties.slice(0, 4).map(property => (
                                  <span
                                    key={property}
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getPropertyColor(property)}`}
                                  >
                                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                                    {formatPropertyName(property)}
                                  </span>
                                ))}
                                {correspondence.magical_properties.length > 4 && (
                                  <span className="text-xs text-gray-500">
                                    +{correspondence.magical_properties.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
              <div className="text-sm text-gray-400">
                {selectedCorrespondences.length} selected
                {maxSelections && ` (max ${maxSelections})`}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-mystical"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}