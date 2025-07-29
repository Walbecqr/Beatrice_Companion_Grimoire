'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Sparkles, Eye, Moon as MoonIcon, Zap, Plus, X } from 'lucide-react'
import { getMoonPhase } from '@/lib/utils/moon-phase'

const RITUAL_TEMPLATES = [
  {
    type: 'spell',
    icon: Sparkles,
    title: 'Spell or Ritual',
    description: 'Candle magic, protection spells, manifestation work',
    color: 'from-purple-600 to-purple-800',
    fields: ['intent', 'tools', 'description', 'outcome']
  },
  {
    type: 'tarot',
    icon: Eye,
    title: 'Tarot Reading',
    description: 'Single card pulls or complex spreads',
    color: 'from-blue-600 to-blue-800',
    fields: ['question', 'cards', 'interpretation', 'outcome']
  },
  {
    type: 'moon',
    icon: MoonIcon,
    title: 'Moon Ritual',
    description: 'New moon intentions, full moon releases',
    color: 'from-indigo-600 to-indigo-800',
    fields: ['moon_phase', 'intent', 'description', 'outcome']
  },
  {
    type: 'energy',
    icon: Zap,
    title: 'Energy Work',
    description: 'Cleansing, grounding, chakra work',
    color: 'from-yellow-600 to-yellow-800',
    fields: ['type', 'description', 'sensations', 'outcome']
  }
]

const COMMON_TOOLS = [
  'Candles', 'Crystals', 'Incense', 'Herbs', 'Essential Oils',
  'Tarot Cards', 'Oracle Cards', 'Pendulum', 'Athame', 'Chalice',
  'Wand', 'Pentacle', 'Cauldron', 'Bell', 'Salt'
]

export default function NewRitualPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [intent, setIntent] = useState('')
  const [description, setDescription] = useState('')
  const [tools, setTools] = useState<string[]>([])
  const [customTool, setCustomTool] = useState('')
  const [outcome, setOutcome] = useState('')
  const [performedAt, setPerformedAt] = useState(new Date().toISOString().split('T')[0])
  
  // Tarot specific
  const [question, setQuestion] = useState('')
  const [cards, setCards] = useState<{ position: string; card: string; interpretation: string }[]>([
    { position: '', card: '', interpretation: '' }
  ])
  
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const currentMoonPhase = getMoonPhase(new Date())

  const handleAddCard = () => {
    setCards([...cards, { position: '', card: '', interpretation: '' }])
  }

  const handleUpdateCard = (index: number, field: string, value: string) => {
    const updatedCards = [...cards]
    updatedCards[index] = { ...updatedCards[index], [field]: value }
    setCards(updatedCards)
  }

  const handleRemoveCard = (index: number) => {
    setCards(cards.filter((_, i) => i !== index))
  }

  const toggleTool = (tool: string) => {
    if (tools.includes(tool)) {
      setTools(tools.filter(t => t !== tool))
    } else {
      setTools([...tools, tool])
    }
  }

  const addCustomTool = () => {
    if (customTool.trim() && !tools.includes(customTool.trim())) {
      setTools([...tools, customTool.trim()])
      setCustomTool('')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !selectedType) return

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const moonPhase = getMoonPhase(new Date(performedAt))

      // Build description based on type
      let fullDescription = description
      if (selectedType === 'tarot' && cards.length > 0) {
        fullDescription = `Question: ${question}\n\n`
        cards.forEach(card => {
          if (card.card) {
            fullDescription += `${card.position ? card.position + ': ' : ''}${card.card}\n`
            if (card.interpretation) {
              fullDescription += `Interpretation: ${card.interpretation}\n\n`
            }
          }
        })
        fullDescription += `\n${description}`
      }

      const { data, error } = await supabase
        .from('rituals')
        .insert({
          user_id: user.id,
          title: title.trim(),
          intent: selectedType === 'tarot' ? question : intent || null,
          description: fullDescription.trim() || null,
          moon_phase: moonPhase.replace(/[🌑🌒🌓🌔🌕🌖🌗🌘]/g, '').trim(),
          tools_used: tools.length > 0 ? tools : null,
          outcome: outcome || null,
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

        <h1 className="text-3xl font-bold text-gradient">Log New Ritual</h1>
        <p className="text-sm text-gray-400 mt-1">
          Record your magical workings and spiritual practices
        </p>
      </div>

      {/* Type Selection */}
      {!selectedType ? (
        <div className="grid md:grid-cols-2 gap-4">
          {RITUAL_TEMPLATES.map((template) => (
            <button
              key={template.type}
              onClick={() => setSelectedType(template.type)}
              className="card-mystical hover:scale-[1.02] transition-all text-left"
            >
              <div className={`w-full h-2 bg-gradient-to-r ${template.color} rounded-t-lg -mt-6 -mx-6 mb-4`} />
              <div className="flex items-start space-x-4">
                <template.icon className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">{template.title}</h3>
                  <p className="text-sm text-gray-400">{template.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="card-mystical">
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className="text-sm text-purple-400 hover:text-purple-300 mb-4"
            >
              ← Choose different type
            </button>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={selectedType === 'tarot' ? 'e.g., Daily Card Pull' : 'e.g., Protection Spell'}
                  className="input-mystical w-full"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Performed Date
                </label>
                <input
                  type="date"
                  value={performedAt}
                  onChange={(e) => setPerformedAt(e.target.value)}
                  className="input-mystical w-full"
                />
                <p className="text-xs text-purple-400 mt-1">
                  Moon phase will be: {getMoonPhase(new Date(performedAt))}
                </p>
              </div>

              {/* Type-specific fields */}
              {selectedType === 'tarot' ? (
                <>
                  {/* Question */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Question or Focus
                    </label>
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="What guidance do I need today?"
                      className="input-mystical w-full"
                    />
                  </div>

                  {/* Cards */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cards Drawn
                    </label>
                    <div className="space-y-3">
                      {cards.map((card, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={card.position}
                              onChange={(e) => handleUpdateCard(index, 'position', e.target.value)}
                              placeholder="Position (e.g., Past)"
                              className="input-mystical flex-1"
                            />
                            <input
                              type="text"
                              value={card.card}
                              onChange={(e) => handleUpdateCard(index, 'card', e.target.value)}
                              placeholder="Card name"
                              className="input-mystical flex-1"
                            />
                            {cards.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCard(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          <textarea
                            value={card.interpretation}
                            onChange={(e) => handleUpdateCard(index, 'interpretation', e.target.value)}
                            placeholder="Your interpretation..."
                            className="input-mystical w-full min-h-[60px] resize-none"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddCard}
                        className="text-purple-400 hover:text-purple-300 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add another card
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Intent */}
                  {selectedType !== 'energy' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Intent or Purpose
                      </label>
                      <input
                        type="text"
                        value={intent}
                        onChange={(e) => setIntent(e.target.value)}
                        placeholder="What is your intention?"
                        className="input-mystical w-full"
                      />
                    </div>
                  )}

                  {/* Tools */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tools & Materials
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {COMMON_TOOLS.map((tool) => (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => toggleTool(tool)}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            tools.includes(tool)
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customTool}
                        onChange={(e) => setCustomTool(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTool())}
                        placeholder="Add custom tool..."
                        className="input-mystical flex-1"
                      />
                      <button
                        type="button"
                        onClick={addCustomTool}
                        className="btn-mystical px-4"
                      >
                        Add
                      </button>
                    </div>
                    {tools.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tools.map((tool) => (
                          <span
                            key={tool}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-900/30 text-purple-300"
                          >
                            {tool}
                            <button
                              type="button"
                              onClick={() => toggleTool(tool)}
                              className="ml-2 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {selectedType === 'tarot' ? 'Additional Notes' : 'Description & Process'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    selectedType === 'tarot' 
                      ? 'Any additional insights or notes...'
                      : 'Describe your ritual process, what you did, how you felt...'
                  }
                  className="input-mystical w-full min-h-[120px] resize-none"
                />
              </div>

              {/* Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Outcome or Results
                </label>
                <textarea
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="What happened? Any signs, feelings, or manifestations?"
                  className="input-mystical w-full min-h-[80px] resize-none"
                />
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
      )}
    </div>
  )
}