'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Bell, Palette, Shield, Save } from 'lucide-react'
import { useSupabase } from '@/components/providers'

export function SettingsClient() {
  const { user } = useSupabase()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Reset message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Mock save function - will be implemented with actual functionality later
  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      setMessage('Settings saved successfully!')
    } catch (error) {
      setMessage('Error saving settings')
      console.error('Settings save error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* User Profile Section */}
      <div className="card-mystical p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-purple-300" />
          </div>
          <h2 className="text-xl font-semibold text-purple-300">Account Settings</h2>
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Email Address</label>
            <input 
              type="email" 
              value={user?.email || ''}
              disabled
              className="w-full bg-gray-800/50 border border-purple-500/20 rounded-md p-2 text-gray-300"
            />
            <p className="text-xs text-gray-500">Your account email cannot be changed</p>
          </div>
          
          <div className="p-4 bg-gray-800/50 rounded-md">
            <p className="text-amber-300 text-sm">✨ Additional profile settings coming soon...</p>
          </div>
        </div>
      </div>
      
      {/* Appearance Section */}
      <div className="card-mystical p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
            <Palette className="w-5 h-5 text-blue-300" />
          </div>
          <h2 className="text-xl font-semibold text-blue-300">Appearance</h2>
        </div>
        
        <div className="p-4 bg-gray-800/50 rounded-md">
          <p className="text-amber-300 text-sm">✨ Theme customization coming soon...</p>
        </div>
      </div>
      
      {/* Notifications Section */}
      <div className="card-mystical p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-300" />
          </div>
          <h2 className="text-xl font-semibold text-amber-300">Notifications</h2>
        </div>
        
        <div className="p-4 bg-gray-800/50 rounded-md">
          <p className="text-amber-300 text-sm">✨ Notification preferences coming soon...</p>
        </div>
      </div>
      
      {/* Privacy & Security */}
      <div className="card-mystical p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-300" />
          </div>
          <h2 className="text-xl font-semibold text-green-300">Privacy & Security</h2>
        </div>
        
        <div className="p-4 bg-gray-800/50 rounded-md">
          <p className="text-amber-300 text-sm">✨ Security settings coming soon...</p>
        </div>
      </div>
      
      {/* Save Button & Status */}
      <div className="flex items-center justify-between">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="btn-mystical flex items-center space-x-2"
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <SettingsIcon className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </span>
          )}
        </button>
        
        {message && (
          <div className="text-sm text-green-400 animate-fade-in">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}