'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface EditableArrayFieldProps {
  label: string
  icon?: React.ReactNode
  values: string[]
  onChange: (values: string[]) => void
  editMode: boolean
  placeholder?: string
  suggestions?: string[]
  colorMap?: (value: string) => string
}

export default function EditableArrayField({
  label,
  icon,
  values,
  onChange,
  editMode,
  placeholder = 'Add new item...',
  suggestions = [],
  colorMap
}: EditableArrayFieldProps) {
  const [newValue, setNewValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleAdd = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      onChange([...values, newValue.trim()])
      setNewValue('')
    }
  }

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index))
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (!values.includes(suggestion)) {
      onChange([...values, suggestion])
    }
    setShowSuggestions(false)
  }

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(newValue.toLowerCase()) && !values.includes(s)
  )

  if (!editMode && values.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-3 flex items-center">
        {icon}
        {label}
      </h2>
      
      {editMode ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {values.map((value, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                  colorMap ? colorMap(value.toLowerCase()) : 'bg-gray-800 text-gray-300'
                }`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
                <button
                  onClick={() => handleRemove(index)}
                  className="ml-2 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          
          <div className="relative">
            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={placeholder}
                className="input-mystical flex-1"
              />
              <button
                onClick={handleAdd}
                disabled={!newValue.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {showSuggestions && filteredSuggestions.length > 0 && newValue && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    {suggestion.charAt(0).toUpperCase() + suggestion.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm ${
                colorMap ? colorMap(value.toLowerCase()) : 'bg-gray-800 text-gray-300'
              }`}
            >
              {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}