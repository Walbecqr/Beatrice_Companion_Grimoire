'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestDbPage() {
  const [tags, setTags] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test 1: Check authentication
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      setUser(currentUser)

      // Test 2: Fetch tags (public read)
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('category', { ascending: true })

      if (tagsError) throw tagsError
      setTags(tagsData || [])

      // Test 3: Check if profile exists
      if (currentUser) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        console.log('Profile:', profile)
      }

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8">Testing database connection...</div>

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gradient">Database Connection Test</h1>
      
      {error && (
        <div className="card-mystical bg-red-900/20 border-red-500/50">
          <p className="text-red-300">Error: {error}</p>
        </div>
      )}

      <div className="card-mystical">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="text-gray-400">Supabase URL:</span>{' '}
            <span className="text-green-400">✓ Connected</span>
          </p>
          <p className="text-sm">
            <span className="text-gray-400">Authenticated:</span>{' '}
            <span className={user ? 'text-green-400' : 'text-yellow-400'}>
              {user ? `✓ ${user.email}` : '✗ Not logged in'}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-gray-400">Database Access:</span>{' '}
            <span className={tags.length > 0 ? 'text-green-400' : 'text-red-400'}>
              {tags.length > 0 ? `✓ ${tags.length} tags loaded` : '✗ No data'}
            </span>
          </p>
        </div>
      </div>

      <div className="card-mystical">
        <h2 className="text-xl font-semibold mb-4">Default Tags ({tags.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['moon_phase', 'emotion', 'intent'].map(category => (
            <div key={category}>
              <h3 className="text-sm font-medium text-purple-400 mb-2 capitalize">
                {category.replace('_', ' ')}s
              </h3>
              <div className="space-y-1">
                {tags
                  .filter(tag => tag.category === category)
                  .map(tag => (
                    <div key={tag.id} className="text-sm text-gray-300">
                      {tag.name}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}