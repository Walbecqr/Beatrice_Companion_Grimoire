// app/dashboard/journal/[id]/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { JournalEntry } from '@/types/beatrice'

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEntry()
  }, [params.id])

  const fetchEntry = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/journal/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch entry')
      
      const data: JournalEntry = await response.json()
      setEntry(data)
      
      // Set selected tags from the entry - now TypeScript knows the structure!
      if (data.journal_entry_tags) {
        setSelectedTags(data.journal_entry_tags.map(jet => jet.tags.id))
      }
    } catch (error) {
      console.error('Error fetching entry:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of your component...
  
  if (loading) return <div>Loading...</div>
  if (!entry) return <div>Entry not found</div>

  return (
    <div>
      {/* Your journal entry UI */}
    </div>
  )
}