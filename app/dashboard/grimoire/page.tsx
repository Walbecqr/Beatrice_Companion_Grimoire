'use client'

import { useState, useEffect } from 'react'

// Complete GrimoireEntry interface that matches your database schema:
interface GrimoireEntry {
  id: string
  user_id: string
  title: string
  type: string
  category: string
  subcategory: string | null
  content: string | null
  description: string | null
  purpose: string | null
  intent: string | null
  ingredients: string[] | null
  instructions: string | null
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

export default function GrimoirePage() {
  const [entries, setEntries] = useState<GrimoireEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch entries from your API
    const fetchEntries = async () => {
      try {
        const response = await fetch('/api/grimoire')
        if (response.ok) {
          const data = await response.json()
          setEntries(data)
        }
      } catch (error) {
        console.error('Error fetching grimoire entries:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [])

  const testedCount = entries.filter(entry => entry.is_tested).length

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Grimoire</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-pink-300">{entries.length}</p>
          <p className="text-sm text-gray-400">Total Entries</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-pink-300">{testedCount}</p>
          <p className="text-sm text-gray-400">Tested</p>
        </div>
        <div className="card-mystical text-center">
          <p className="text-2xl font-bold text-pink-300">
            {entries.filter(entry => entry.is_favorite).length}
          </p>
          <p className="text-sm text-gray-400">Favorites</p>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="card-mystical p-4">
            <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
            <p className="text-sm text-gray-400 mb-2">
              {entry.type} - {entry.category}
              {entry.subcategory && ` / ${entry.subcategory}`}
            </p>
            
            {entry.description && (
              <p className="text-sm mb-3">{entry.description}</p>
            )}
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-3">
                {entry.best_timing && (
                  <span>{entry.best_timing}</span>
                )}
                {entry.ingredients && entry.ingredients.length > 0 && (
                  <span>{entry.ingredients.length} ingredients</span>
                )}
              </div>
              {entry.is_tested && (
                <span className="text-green-400">
                  Tested ✓
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}