'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Info, Save } from 'react-feather'
import { TagSelector } from '@/components/ui/tag-selector'

const CATEGORIES = [
  { value: 'spell', label: 'Spell', icon: '✨' },
  { value: 'ritual', label: 'Ritual', icon: '🔮' },
  { value: 'meditation', label: 'Meditation', icon: '🧘' },
  { value: 'divination', label: 'Divination', icon: '🔍' },
  { value: 'herbalism', label: 'Herbalism', icon: '🌿' },
]

const SUBCATEGORIES = [
  'alchemy',
  'astrology',
  'candle magic',
  'crystal magic',
  'elemental',
  'herbalism',
  'moon magic',
  'spirit work',
]

const INGREDIENT_SUGGESTIONS = [
  'sage',
  'rosemary',
  'lavender',
  'cinnamon',
  'chamomile',
  'thyme',
  'mint',
  'bay leaf',
]

const TOOL_SUGGESTIONS = [
  'wand',
  'chalice',
  'athame',
  'cauldron',
  'pentacle',
  'altar cloth',
  'incense burner',
]

const TIMING_SUGGESTIONS = [
  'Full Moon',
  'New Moon',
  'Dawn',
  'Dusk',
  'Samhain',
  'Beltane',
]

export default function AddGrimoireEntry() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('spell')
  const [category, setCategory] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [purpose, setPurpose] = useState('')
  const [description, setDescription] = useState('')
  const [intent, setIntent] = useState('')
  const [instructions, setInstructions] = useState('')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false)
  const [tools, setTools] = useState<string[]>([])
  const [newTool, setNewTool] = useState('')
  const [showToolSuggestions, setShowToolSuggestions] = useState(false)
  const [bestTiming, setBestTiming] = useState('')
  const [source, setSource] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredIngredients = INGREDIENT_SUGGESTIONS.filter(
    (ing) =>
      ing.toLowerCase().includes(newIngredient.toLowerCase()) &&
      !ingredients.includes(ing)
  )

  const filteredTools = TOOL_SUGGESTIONS.filter(
    (tool) =>
      tool.toLowerCase().includes(newTool.toLowerCase()) &&
      !tools.includes(tool)
  )

  const addIngredient = (ingredient: string) => {
    const trimmed = ingredient.trim()
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed])
      setNewIngredient('')
      setShowIngredientSuggestions(false)
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((ing) => ing !== ingredient))
  }

  const addTool = (tool: string) => {
    const trimmed = tool.trim()
    if (trimmed && !tools.includes(trimmed)) {
      setTools([...tools, trimmed])
      setNewTool('')
      setShowToolSuggestions(false)
    }
  }

  const removeTool = (tool: string) => {
    setTools(tools.filter((t) => t !== tool))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !instructions.trim()) return
    setSaving(true)
    // Simulate save operation, replace with actual save logic
    await new Promise((res) => setTimeout(res, 1000))
    setSaving(false)
    // Reset form or redirect
  }

  useEffect(() => {
    if (type !== 'spell' && type !== 'ritual' && type !== 'meditation') {
      setIngredients([])
      setNewIngredient('')
      setShowIngredientSuggestions(false)
    }
  }, [type])

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-12">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Protection Spell, Full Moon Ritual..."
              className="input-mystical w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
              Type *
            </label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="input-mystical w-full"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-mystical w-full"
            >
              <option value="">Select category...</option>
              {SUBCATEGORIES.map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-300 mb-2">
              Subcategory
            </label>
            <input
              id="subcategory"
              name="subcategory"
              type="text"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g., Moon magic, Herbalism..."
              className="input-mystical w-full"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-300 mb-2">
              Purpose
            </label>
            <input
              id="purpose"
              name="purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What is this for?"
              className="input-mystical w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              id="description"
              name="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description..."
              className="input-mystical w-full"
            />
          </div>

          <div>
            <label htmlFor="intent" className="block text-sm font-medium text-gray-300 mb-2">
              Intent
            </label>
            <input
              id="intent"
              name="intent"
              type="text"
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder="Magical intention..."
              className="input-mystical w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-2">
            Instructions *
          </label>
          <textarea
            id="instructions"
            name="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={`Write the instructions for your ${type} here... Include steps, words, movements, visualizations, etc.`}
            className="input-mystical w-full min-h-[200px] resize-none font-mono"
            required
          />
        </div>

        {['spell', 'ritual', 'meditation'].includes(type) && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ingredients / Materials
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-900/20 text-green-300"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-2 hover:text-white"
                      aria-label={`Remove ingredient ${ingredient}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={newIngredient}
                  onChange={(e) => {
                    setNewIngredient(e.target.value)
                    setShowIngredientSuggestions(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addIngredient(newIngredient)
                    }
                  }}
                  onFocus={() => setShowIngredientSuggestions(true)}
                  placeholder="Add ingredient..."
                  className="input-mystical w-full"
                  aria-label="Add new ingredient"
                />

                {showIngredientSuggestions && newIngredient && filteredIngredients.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-purple-500/30 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredIngredients.map((ing) => (
                      <button
                        key={ing}
                        type="button"
                        onClick={() => addIngredient(ing)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-purple-900/20 hover:text-white transition-colors"
                      >
                        {ing}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tools Required
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2 mb-2">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-900/20 text-blue-300"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="ml-2 hover:text-white"
                    aria-label={`Remove tool ${tool}`}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTool(newTool)
                  }
                }}
                onFocus={() => setShowToolSuggestions(true)}
                placeholder="Add tool..."
                className="input-mystical w-full"
                aria-label="Add new tool"
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

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bestTiming" className="block text-sm font-medium text-gray-300 mb-2">
              Best Timing
            </label>
            <input
              id="bestTiming"
              name="bestTiming"
              type="text"
              value={bestTiming}
              onChange={(e) => setBestTiming(e.target.value)}
              placeholder="e.g., Full Moon, Dawn, Samhain..."
              className="input-mystical w-full"
              list="timing-suggestions"
            />
            <datalist id="timing-suggestions">
              {TIMING_SUGGESTIONS.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-300 mb-2">
              Source
            </label>
            <input
              id="source"
              name="source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g., Personal, Book title, Tradition..."
              className="input-mystical w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tags
          </label>
          <TagSelector selectedTags={selectedTags} onTagsChange={setSelectedTags} />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information, variations, or personal experiences..."
            className="input-mystical w-full min-h-[100px] resize-none"
          />
        </div>

        <div className="card-mystical bg-indigo-900/20">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-1">Grimoire vs Book of Shadows</p>
              <p className="text-gray-400">
                Your Grimoire stores reference material - spells, rituals, and knowledge you can use repeatedly.{' '}
                Your Book of Shadows (ritual log) tracks when you actually perform these practices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/dashboard/grimoire"
            className="px-6 py-3 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !title.trim() || !instructions.trim()}
            className="btn-mystical disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Add to Grimoire'}
          </button>
        </div>
      </form>
    </div>
  )
}