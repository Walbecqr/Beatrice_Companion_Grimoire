'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, X, BookOpen, Sparkles, Info } from 'lucide-react'
import { TagSelector } from '@/components/ui/tag-selector'

// ✅ FIXED: Updated categories to match database CHECK constraint
const CATEGORIES = [
  { value: 'spell', label: 'Spell', icon: '✨' },
  { value: 'ritual', label: 'Ritual', icon: '🕯️' },
  { value: 'chant', label: 'Chant', icon: '📜' },
  { value: 'blessing', label: 'Blessing', icon: '💗' },
  { value: 'invocation', label: 'Invocation', icon: '🙏' },
  { value: 'meditation', label: 'Meditation', icon: '🧘' },
  { value: 'divination', label: 'Divination', icon: '🔮' },
  { value: 'other', label: 'Other', icon: '📖' },
]

const SUBCATEGORIES = [
  'protection', 'love', 'prosperity', 'healing', 'banishing',
  'divination', 'cleansing', 'grounding', 'manifestation', 'other'
]

const TIMING_SUGGESTIONS = [
  'New Moon', 'Full Moon', 'Waxing Moon', 'Waning Moon',
  'Dawn', 'Noon', 'Dusk', 'Midnight',
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  'Spring', 'Summer', 'Autumn', 'Winter',
  'Beltane', 'Samhain', 'Imbolc', 'Lughnasadh', 'Ostara', 'Litha', 'Mabon', 'Yule'
]

const COMMON_INGREDIENTS = [
  'Salt', 'Black Salt', 'Water', 'Rose Water', 'Moon Water',
  'Candles', 'Incense', 'Herbs', 'Crystals', 'Essential Oils',
  'Bay Leaves', 'Cinnamon', 'Rosemary', 'Sage', 'Lavender',
  'Rose Petals', 'Thyme', 'Basil', 'Mint', 'Mugwort'
]

const COMMON_TOOLS = [
  'Athame', 'Wand', 'Chalice', 'Pentacle', 'Cauldron',
  'Candles', 'Incense Burner', 'Bell', 'Besom', 'Book of Shadows',
  'Crystals', 'Mortar & Pestle', 'Ritual Bowl', 'Altar Cloth', 'Offering Dish'
]

export default function NewGrimoireEntryPage() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('spell') // ✅ FIXED: Renamed from category to type
  const [category, setCategory] = useState('') // ✅ FIXED: This is now the subcategory
  const [subcategory, setSubcategory] = useState('') 
  const [instructions, setInstructions] = useState('') // ✅ FIXED: Renamed from content
  const [purpose, setPurpose] = useState('')
  const [description, setDescription] = useState('') // ✅ ADDED: New description field
  const [intent, setIntent] = useState('') // ✅ ADDED: New intent field
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [tools, setTools] = useState<string[]>([])
  const [newTool, setNewTool] = useState('')
  const [bestTiming, setBestTiming] = useState('')
  const [source, setSource] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false)
  const [showToolSuggestions, setShowToolSuggestions] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const addIngredient = (ingredient: string) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient])
      setNewIngredient('')
      setShowIngredientSuggestions(false)
    }
  }

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient))
  }

  const addTool = (tool: string) => {
    if (tool && !tools.includes(tool)) {
      setTools([...tools, tool])
      setNewTool('')
      setShowToolSuggestions(false)
    }
  }

  const removeTool = (tool: string) => {
    setTools(tools.filter(t => t !== tool))
  }

  const filteredIngredients = COMMON_INGREDIENTS.filter(
    ing => ing.toLowerCase().includes(newIngredient.toLowerCase()) && !ingredients.includes(ing)
  )

  const filteredTools = COMMON_TOOLS.filter(
    tool => tool.toLowerCase().includes(newTool.toLowerCase()) && !tools.includes(tool)
  )

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !instructions.trim()) return // ✅ FIXED: Check instructions instead of content

    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // ✅ FIXED: Combine ingredients and tools properly
      const allIngredients = [...ingredients, ...tools]

      // ✅ FIXED: Map form fields to correct database fields
      const insertData = {
        user_id: user.id,
        title: title.trim(),
        type: type, // Maps to type field (required, with CHECK constraint)
        category: category.trim() || null, // Maps to category field
        subcategory: subcategory.trim() || null, // Maps to subcategory field
        instructions: instructions.trim(), // Maps to instructions field (NOT NULL)
        purpose: purpose.trim() || null, // Maps to purpose field
        description: description.trim() || null, // Maps to description field
        intent: intent.trim() || null, // Maps to intent field
        ingredients: allIngredients.length > 0 ? allIngredients : null, // ARRAY type
        best_timing: bestTiming.trim() || null,
        source: source.trim() || null,
        notes: notes.trim() || null,
        tags: selectedTags.length > 0 ? selectedTags : null, // ARRAY type for simple tags
      }

      const { data, error } = await supabase
        .from('grimoire_entries')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // Note: If you want to use the grimoire_entry_tags junction table instead of the tags array,
      // you can add that logic here for more complex tag relationships

      router.push('/dashboard/grimoire')
    } catch (error) {
      console.error('Error saving grimoire entry:', error)
      alert('Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/grimoire" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Grimoire
        </Link>

        <h1 className="text-3xl font-bold text-gradient">Add to Grimoire</h1>
        <p className="text-sm text-gray-400 mt-1">
          Create a new spell, ritual, or magical reference
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card-mystical space-y-4">
          {/* Title and Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Protection Spell, Full Moon Ritual..."
                className="input-mystical w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="input-mystical w-full"
                required
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category and Subcategory */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-mystical w-full"
              >
                <option value="">Select category...</option>
                {SUBCATEGORIES.map(sub => (
                  <option key={sub} value={sub}>
                    {sub.charAt(0).toUpperCase() + sub.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g., Moon magic, Herbalism..."
                className="input-mystical w-full"
              />
            </div>
          </div>

          {/* Purpose, Description, and Intent */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Purpose
              </label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What is this for?"
                className="input-mystical w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                className="input-mystical w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Intent
              </label>
              <input
                type="text"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
                placeholder="Magical intention..."
                className="input-mystical w-full"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Instructions *
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={`Write the instructions for your ${type} here... Include steps, words, movements, visualizations, etc.`}
              className="input-mystical w-full min-h-[200px] resize-none font-mono"
              required
            />
          </div>

          {/* Ingredients */}
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addIngredient(newIngredient)
                      }
                    }}
                    onFocus={() => setShowIngredientSuggestions(true)}
                    placeholder="Add ingredient..."
                    className="input-mystical w-full"
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

          {/* Tools */}
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
                  placeholder="Add tool..."
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

          {/* Timing and Source */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Best Timing
              </label>
              <input
                type="text"
                value={bestTiming}
                onChange={(e) => setBestTiming(e.target.value)}
                placeholder="e.g., Full Moon, Dawn, Samhain..."
                className="input-mystical w-full"
                list="timing-suggestions"
              />
              <datalist id="timing-suggestions">
                {TIMING_SUGGESTIONS.map(t => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Source
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Personal, Book title, Tradition..."
                className="input-mystical w-full"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information, variations, or personal experiences..."
              className="input-mystical w-full min-h-[100px] resize-none"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="card-mystical bg-indigo-900/20">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-1">Grimoire vs Book of Shadows</p>
              <p className="text-gray-400">
                Your Grimoire stores reference material - spells, rituals, and knowledge you can use repeatedly. 
                Your Book of Shadows (ritual log) tracks when you actually perform these practices.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
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