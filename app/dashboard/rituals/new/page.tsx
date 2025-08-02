'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Moon, Sparkles, Plus, X, Calendar, Clock } from 'lucide-react'
import { getMoonPhase } from '@/lib/utils/moon-phase'
import { format } from 'date-fns'

const RITUAL_TEMPLATES = {
  tarot: {
    title: 'Tarot Reading',
    ingredients: ['Tarot deck', 'Candle', 'Journal'],
    intents: ['Guidance', 'Clarity', 'Insight'],
  },
  spell: {
    title: 'Spell Work',
    ingredients: ['Candles', 'Herbs', 'Crystals', 'Incense'],
    intents: ['Protection', 'Love', 'Abundance', 'Healing', 'Banishing'],
  },
  meditation: {
    title: 'Meditation Practice',
    ingredients: ['Cushion', 'Incense', 'Music', 'Crystals'],
    intents: ['Peace', 'Clarity', 'Connection', 'Grounding'],
  },
  ritual: {
    title: 'Sacred Ritual',
    ingredients: ['Altar items', 'Candles', 'Offerings', 'Sacred texts'],
    intents: ['Celebration', 'Honor', 'Release', 'Manifestation'],
  },
}

const COMMON_TOOLS = [
  'Candles', 'Incense', 'Crystals', 'Herbs', 'Essential oils',
  'Tarot deck', 'Oracle cards', 'Pendulum', 'Scrying mirror',
  'Wand', 'Athame', 'Chalice', 'Pentacle', 'Bell',
  'Salt', 'Water', 'Sage', 'Palo Santo', 'Journal'
]

export default function NewRitualPage() {
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date')
  
  const [title, setTitle] = useState('')
  const [intent, setIntent] = useState('')
  const [description, setDescription] = useState('')
  const [ingredientsUsed, setIngredientsUsed] = useState<string[]>([])
  const [newTool, setNewTool] = useState('')
  const [outcome, setOutcome] = useState('')
  const [performedAt, setPerformedAt] = useState(
    dateParam 
      ? format(new Date(dateParam), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  )
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof RITUAL_TEMPLATES | null>(null)
  const [showToolSuggestions, setShowToolSuggestions] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleTemplate = (templateKey: keyof typeof RITUAL_TEMPLATES) => {
    const template = RITUAL_TEMPLATES[templateKey]
    setSelectedTemplate(templateKey)
    setTitle(template.title)
    setIngredientsUsed(template.ingredients)
  }

  const addTool = (tool: string) => {
    if (tool && !ingredientsUsed.includes(tool)) {
      setIngredientsUsed([...ingredientsUsed, tool])
      setNewTool('')
      setShowToolSuggestions(false)
    }
  }

  const removeTool = (tool: string) => {
    setIngredientsUsed(ingredientsUsed.filter(t => t !== tool))
  }

  const filteredTools = COMMON_TOOLS.filter(
    tool => 
      tool.toLowerCase().includes(newTool.toLowerCase()) &&
      !ingredientsUsed.includes(tool)
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const moonPhase = getMoonPhase(new Date(performedAt))

      const { data, error } = await supabase
        .from('rituals')
        .insert({
          user_id: user.id,
          title: title.trim(),
          intent: intent.trim() || null,
          description: description.trim() || null,
          moon_phase: moonPhase.replace(/[🌑🌒🌓🌔🌕🌖🌗🌘]/g, '').trim(),
          tools_used: ingredientsUsed.length > 0 ? ingredientsUsed : null,
          outcome: outcome.trim() || null,
          performed_at: new Date(performedAt).toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      router.push('/dashboard/rituals')
    } catch (error) {
      console.error('Error saving ritual:', error)
      alert('Failed to save ritual. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const currentMoonPhase = getMoonPhase(new Date(performedAt))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/rituals" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Rituals
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Log Ritual or Practice</h1>
            <p className="text-sm text-gray-400 mt-1">
              Document your magical workings and divination
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Moon Phase</div>
            <div className="text-purple-300">{currentMoonPhase}</div>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-3">Quick start with a template:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(RITUAL_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTemplate(key as keyof typeof RITUAL_TEMPLATES)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedTemplate === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {template.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card-mystical">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ritual/Practice Name *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Full Moon Tarot Reading, Protection Spell..."
                className="input-mystical w-full"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date & Time Performed
                </label>
                <input
                  type="datetime-local"
                  value={performedAt}
                  onChange={(e) => setPerformedAt(e.target.value)}
                  className="input-mystical w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Intention
                </label>
                <input
                  type="text"
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="e.g., Protection, Clarity, Healing..."
                  className="input-mystical w-full"
                  list="intent-suggestions"
                />
                <datalist id="intent-suggestions">
                  {selectedTemplate && RITUAL_TEMPLATES[selectedTemplate].intents.map(i => (
                    <option key={i} value={i} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your ritual, the steps taken, cards pulled, or any other details..."
                className="input-mystical w-full min-h-[150px] resize-none"
              />
            </div>

            {/* Tools Used */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tools & Materials Used
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {ingredientsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900/20 text-purple-300"
                    >
                      {tool}
                      <button
                        type="button"
                        onClick={() => removeTool(tool)}
                        className="ml-2 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => {
                      setNewTool(e.target.value)
                      setShowToolSuggestions(true)
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTool(newTool)
                      }
                    }}
                    onFocus={() => setShowToolSuggestions(true)}
                    placeholder="Add tools used..."
                    className="input-mystical w-full"
                  />
                  
                  {showToolSuggestions && newTool && filteredTools.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-purple-500/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredTools.map((tool) => (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => addTool(tool)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-900/20 hover:text-white transition-colors"
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Outcome or Results (Optional)
              </label>
              <textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="What happened? Any insights, manifestations, or observations..."
                className="input-mystical w-full min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Magical Tip */}
        <div className="card-mystical bg-purple-900/20">
          <div className="flex items-start space-x-3">
            <Moon className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-1">Ritual Tracking Tips:</p>
              <ul className="space-y-1 text-gray-400 text-xs">
                <li>• Document immediately after your practice for best recall</li>
                <li>• Include specific details like card positions or spell ingredients</li>
                <li>• Note the moon phase and your emotional state</li>
                <li>• Return later to add outcomes as they manifest</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link 
            href="/dashboard/rituals"
            className="px-6 py-3 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !title.trim()}
            className="btn-mystical disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Ritual'}
          </button>
        </div>
      </form>
    </div>
  )
}
