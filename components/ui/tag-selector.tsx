'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Hash } from 'lucide-react'

interface Tag {
  id: string
  name: string
  category: string | null
}

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tagIds: string[]) => void
  className?: string
}

export function TagSelector({ selectedTags, onTagsChange, className = '' }: TagSelectorProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchTags()
  }, [])

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

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId))
  }

  const selectedTagObjects = availableTags.filter(tag => selectedTags.includes(tag.id))

  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedTags = filteredTags.reduce((acc, tag) => {
    const category = tag.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

  const getCategoryColor = (category: string | null) => {
    switch (category) {
      case 'moon_phase': return 'text-purple-400 bg-purple-900/20'
      case 'emotion': return 'text-blue-400 bg-blue-900/20'
      case 'intent': return 'text-green-400 bg-green-900/20'
      default: return 'text-gray-400 bg-gray-900/20'
    }
  }

  return (
    <div className={className}>
      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedTagObjects.map(tag => (
          <span
            key={tag.id}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getCategoryColor(tag.category)}`}
          >
            <Hash className="w-3 h-3 mr-1" />
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              className="ml-2 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        {/* Add Tag Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors"
        >
          <Hash className="w-3 h-3 mr-1" />
          Add Tag
        </button>
      </div>

      {/* Tag Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Select Tags</h3>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mystical mb-4"
              autoFocus
            />

            {/* Tag List */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {Object.entries(groupedTags).map(([category, tags]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-400 mb-2 capitalize">
                    {category.replace('_', ' ')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm transition-all ${
                          selectedTags.includes(tag.id)
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

            {/* Actions */}
            <div className="flex justify-end mt-6">
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