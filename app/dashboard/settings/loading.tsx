import { Settings, User, Bell, Palette, Shield, Moon } from 'lucide-react'

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-48 h-8 bg-purple-600/30 rounded animate-pulse" />
          <div className="w-64 h-4 bg-purple-600/20 rounded animate-pulse" />
        </div>
      </div>

      {/* Mystical Loading Animation */}
      <div className="flex justify-center items-center py-8">
        <div className="relative">
          {/* Settings Gear */}
          <div className="w-20 h-20 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800/30 to-indigo-800/30 rounded-full border-2 border-purple-400/30 animate-pulse">
              <div className="absolute inset-0 flex items-center justify-center">
                <Settings className="w-8 h-8 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            
            {/* Orbiting Icons */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s' }}>
              <User className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 text-blue-400" />
              <Bell className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-4 h-4 text-yellow-400" />
              <Palette className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-4 text-pink-400" />
              <Shield className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-4 h-4 text-green-400" />
            </div>
            
            {/* Sacred Aura */}
            <div className="absolute -inset-2 border border-purple-400/20 rounded-full animate-ping" />
          </div>
          
          {/* Text */}
          <div className="text-center mt-6 space-y-2">
            <h3 className="text-lg font-medium text-gradient">
              Configuring Your Sacred Space
            </h3>
            <p className="text-sm text-gray-400">
              Personalizing your spiritual journey...
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="space-y-2">
          {[
            { icon: User, label: 'Profile' },
            { icon: Bell, label: 'Notifications' },
            { icon: Palette, label: 'Appearance' },
            { icon: Shield, label: 'Privacy' },
            { icon: Moon, label: 'Mystical' }
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 card-mystical">
              <item.icon className="w-5 h-5 text-purple-400 animate-pulse" />
              <div className="w-20 h-4 bg-purple-600/30 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="card-mystical p-6 space-y-4">
            <div className="w-24 h-6 bg-purple-600/30 rounded animate-pulse" />
            
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-purple-600/20 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-purple-600/30 rounded animate-pulse" />
                <div className="w-24 h-3 bg-purple-600/20 rounded animate-pulse" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {['Name', 'Email', 'Bio'].map((field) => (
                <div key={field} className="space-y-2">
                  <div className="w-16 h-4 bg-purple-600/30 rounded animate-pulse" />
                  <div className="w-full h-10 bg-purple-600/20 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="card-mystical p-6 space-y-4">
            <div className="w-32 h-6 bg-purple-600/30 rounded animate-pulse" />
            
            {['Moon Phase Alerts', 'Ritual Reminders', 'Journal Prompts', 'Weekly Insights'].map((setting) => (
              <div key={setting} className="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                <div className="space-y-1">
                  <div className="w-32 h-4 bg-purple-600/30 rounded animate-pulse" />
                  <div className="w-48 h-3 bg-purple-600/20 rounded animate-pulse" />
                </div>
                <div className="w-12 h-6 bg-purple-600/30 rounded-full animate-pulse" />
              </div>
            ))}
          </div>

          {/* Appearance Settings */}
          <div className="card-mystical p-6 space-y-4">
            <div className="w-28 h-6 bg-purple-600/30 rounded animate-pulse" />
            
            {/* Theme Options */}
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-gray-800/30 rounded text-center space-y-2">
                  <div className="w-full h-16 bg-purple-600/20 rounded animate-pulse" />
                  <div className="w-16 h-3 bg-purple-600/30 rounded animate-pulse mx-auto" />
                </div>
              ))}
            </div>

            {/* Other Appearance Settings */}
            <div className="space-y-3">
              {['Font Size', 'Animation Speed', 'Background Opacity'].map((setting) => (
                <div key={setting} className="flex items-center justify-between">
                  <div className="w-24 h-4 bg-purple-600/30 rounded animate-pulse" />
                  <div className="w-32 h-8 bg-purple-600/20 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}