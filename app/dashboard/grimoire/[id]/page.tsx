'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X,
  Trash2, 
  Star, 
  Sparkles, 
  BookOpen, 
  Heart,
  Shield,
  Scroll,
  Brain,
  Gem,
  Calendar,
  Clock,
  User,
  Tag,
  Package,
  AlertCircle,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'

// ✅ Interface matching database schema
interface GrimoireEntry {
  id: string
  user_id: string
  title: string
  type: string
  category: string | null
  subcategory: string | null
  content: string | null
  description: string | null
  purpose: string | null
  intent: string | null
  ingredients: string[] | null
  instructions: string
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

const TYPE_CONFIG = {
  spell: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-900/20' },
  ritual: { icon: Star, color: 'text-blue-400', bg: 'bg-blue-900/20' },
  chant: { icon: Scroll, color: 'text-green-400', bg: 'bg-green-900/20' },
  blessing: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-900/20' },
  invocation: { icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
  meditation: { icon: Brain, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
  divination: { icon: Gem, color: 'text-amber-400', bg: 'bg-amber-900/20' },
  other: { icon: BookOpen, color: 'text-gray-400', bg: 'bg-gray-900/20' },
}

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

export default function GrimoireEntryDetailPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<GrimoireEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // ✅ Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    type: 'spell',
    category: '',
    subcategory: '',
    instructions: '',
    purpose: '',
    description: '',
    intent: '',
    ingredients: [] as string[],
    newIngredient: '',
    tools: [] as string[],
    newTool: '',
    best_timing: '',
    source: '',
    notes: '',
    tags: [] as string[],
    is_favorite: false,
    is_tested: false
  })

  const [showIngredientSuggestions, setShowIngredientSuggestions] = useState(false)
  const [showToolSuggestions, setShowToolSuggestions] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchEntry()
  }, [params.id])

  // ✅ Populate form when entry loads or edit mode starts
  useEffect(() => {
    if (entry && isEditing) {
      // Separate ingredients and tools (they're combined in ingredients field)
      const allIngredients = entry.ingredients || []
      const ingredients = allIngredients.filter(item => COMMON_INGREDIENTS.includes(item))
      const tools = allIngredients.filter(item => COMMON_TOOLS.includes(item))
      
      setEditForm({
        title: entry.title,
        type: entry.type,
        category: entry.category || '',
        subcategory: entry.subcategory || '',
        instructions: entry.instructions,
        purpose: entry.purpose || '',
        description: entry.description || '',
        intent: entry.intent || '',
        ingredients: ingredients,
        newIngredient: '',
        tools: tools,
        newTool: '',
        best_timing: entry.best_timing || '',
        source: entry.source || '',
        notes: entry.notes || '',
        tags: entry.tags || [],
        is_favorite: entry.is_favorite,
        is_tested: entry.is_tested
      })
    }
  }, [entry, isEditing])

  const fetchEntry = async () => {
    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('grimoire_entries')
        .select('*')
        .eq('id', params.id)
        .single()

      if (fetchError) {
        console.error('Grimoire entry fetch error:', fetchError)
        setError(fetchError.message)
        return
      }

      setEntry(data)
    } catch (error: any) {
      console.error('Error fetching grimoire entry:', error)
      setError(error.message || 'Failed to load grimoire entry')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Save handler
  const handleSave = async () => {
    if (!entry || !editForm.title.trim() || !editForm.instructions.trim()) {
      alert('Title and Instructions are required')
      return
    }

    setSaving(true)
    try {
      // Combine ingredients and tools
      const allIngredients = [...editForm.ingredients, ...editForm.tools]

      const updateData = {
        title: editForm.title.trim(),
        type: editForm.type,
        category: editForm.category.trim() || null,
        subcategory: editForm.subcategory.trim() || null,
        instructions: editForm.instructions.trim(),
        purpose: editForm.purpose.trim() || null,
        description: editForm.description.trim() || null,
        intent: editForm.intent.trim() || null,
        ingredients: allIngredients.length > 0 ? allIngredients : null,
        best_timing: editForm.best_timing.trim() || null,
        source: editForm.source.trim() || null,
        notes: editForm.notes.trim() || null,
        tags: editForm.tags.length > 0 ? editForm.tags : null,
        is_favorite: editForm.is_favorite,
        is_tested: editForm.is_tested
      }

      const { data, error } = await supabase
        .from('grimoire_entries')
        .update(updateData)
        .eq('id', entry.id)
        .select()
        .single()

      if (error) throw error

      setEntry(data)
      setIsEditing(false)
      alert('Entry updated successfully!')
    } catch (error: any) {
      console.error('Error updating entry:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ✅ Cancel editing
  const handleCancel = () => {
    setIsEditing(false)
    // Reset form will happen in useEffect
  }

  const handleDelete = async () => {
    if (!entry || !confirm('Are you sure you want to delete this grimoire entry? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const { error } = await supabase
        .from('grimoire_entries')
        .delete()
        .eq('id', entry.id)

      if (error) throw error

      router.push('/dashboard/grimoire')
    } catch (error: any) {
      console.error('Error deleting entry:', error)
      alert('Failed to delete entry. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const toggleFavorite = async () => {
    if (!entry) return

    try {
      const { error } = await supabase
        .from('grimoire_entries')
        .update({ is_favorite: !entry.is_favorite })
        .eq('id', entry.id)

      if (error) throw error

      setEntry({ ...entry, is_favorite: !entry.is_favorite })
    } catch (error: any) {
      console.error('Error updating favorite:', error)
    }
  }

  const toggleTested = async () => {
    if (!entry) return

    try {
      const { error } = await supabase
        .from('grimoire_entries')
        .update({ is_tested: !entry.is_tested })
        .eq('id', entry.id)

      if (error) throw error

      setEntry({ ...entry, is_tested: !entry.is_tested })
    } catch (error: any) {
      console.error('Error updating tested status:', error)
    }
  }

  // ✅ Ingredient management
  const addIngredient = (ingredient: string) => {
    if (ingredient && !editForm.ingredients.includes(ingredient)) {
      setEditForm({
        ...editForm,
        ingredients: [...editForm.ingredients, ingredient],
        newIngredient: ''
      })
      setShowIngredientSuggestions(false)
    }
  }

  const removeIngredient = (ingredient: string) => {
    setEditForm({
      ...editForm,
      ingredients: editForm.ingredients.filter(i => i !== ingredient)
    })
  }

  // ✅ Tool management
  const addTool = (tool: string) => {
    if (tool && !editForm.tools.includes(tool)) {
      setEditForm({
        ...editForm,
        tools: [...editForm.tools, tool],
        newTool: ''
      })
      setShowToolSuggestions(false)
    }
  }

  const removeTool = (tool: string) => {
    setEditForm({
      ...editForm,
      tools: editForm.tools.filter(t => t !== tool)
    })
  }

  const filteredIngredients = COMMON_INGREDIENTS.filter(
    ing => ing.toLowerCase().includes(editForm.newIngredient.toLowerCase()) && !editForm.ingredients.includes(ing)
  )

  const filteredTools = COMMON_TOOLS.filter(
    tool => tool.toLowerCase().includes(editForm.newTool.toLowerCase()) && !editForm.tools.includes(tool)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-purple-400">Loading grimoire entry...</div>
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 mb-2">Entry Not Found</div>
          <div className="text-gray-400 text-sm mb-4">
            {error || 'This grimoire entry could not be found.'}
          </div>
          <Link href="/dashboard/grimoire" className="btn-mystical">
            Back to Grimoire
          </Link>
        </div>
      </div>
    )
  }

  const typeConfig = TYPE_CONFIG[entry.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.other
  const TypeIcon = typeConfig.icon

  // ✅ EDIT MODE
  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Edit Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Grimoire Entry</h1>
            <p className="text-gray-400">Make changes to your grimoire entry</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editForm.title.trim() || !editForm.instructions.trim()}
              className="btn-mystical disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="card-mystical space-y-4">
          {/* Title and Type */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="input-mystical w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
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
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
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
                value={editForm.subcategory}
                onChange={(e) => setEditForm({ ...editForm, subcategory: e.target.value })}
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
                value={editForm.purpose}
                onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
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
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
                value={editForm.intent}
                onChange={(e) => setEditForm({ ...editForm, intent: e.target.value })}
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
              value={editForm.instructions}
              onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
              placeholder={`Write the instructions for your ${editForm.type} here...`}
              className="input-mystical w-full min-h-[200px] resize-none font-mono"
              required
            />
          </div>

          {/* Ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ingredients / Materials
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {editForm.ingredients.map((ingredient) => (
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
                  value={editForm.newIngredient}
                  onChange={(e) => {
                    setEditForm({ ...editForm, newIngredient: e.target.value })
                    setShowIngredientSuggestions(true)
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addIngredient(editForm.newIngredient)
                    }
                  }}
                  onFocus={() => setShowIngredientSuggestions(true)}
                  placeholder="Add ingredient..."
                  className="input-mystical w-full"
                />
                
                {showIngredientSuggestions && editForm.newIngredient && filteredIngredients.length > 0 && (
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

          {/* Tools */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tools Required
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                {editForm.tools.map((tool) => (
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
                  value={editForm.newTool}
                  onChange={(e) => {
                    setEditForm({ ...editForm, newTool: e.target.value })
                    setShowToolSuggestions(true)
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTool(editForm.newTool)
                    }
                  }}
                  onFocus={() => setShowToolSuggestions(true)}
                  placeholder="Add tool..."
                  className="input-mystical w-full"
                />
                
                {showToolSuggestions && editForm.newTool && filteredTools.length > 0 && (
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
                value={editForm.best_timing}
                onChange={(e) => setEditForm({ ...editForm, best_timing: e.target.value })}
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
                value={editForm.source}
                onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                placeholder="e.g., Personal, Book title, Tradition..."
                className="input-mystical w-full"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="Any additional information, variations, or personal experiences..."
              className="input-mystical w-full min-h-[100px] resize-none"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editForm.is_favorite}
                onChange={(e) => setEditForm({ ...editForm, is_favorite: e.target.checked })}
                className="rounded border-gray-600"
              />
              <span className="text-gray-300">Mark as Favorite</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={editForm.is_tested}
                onChange={(e) => setEditForm({ ...editForm, is_tested: e.target.checked })}
                className="rounded border-gray-600"
              />
              <span className="text-gray-300">Mark as Tested</span>
            </label>
          </div>
        </div>
      </div>
    )
  }

  // ✅ VIEW MODE
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/dashboard/grimoire" 
            className="inline-flex items-center text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Grimoire
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              entry.is_favorite 
                ? 'text-yellow-400 bg-yellow-400/10' 
                : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
            }`}
          >
            <Star className={`w-5 h-5 ${entry.is_favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={toggleTested}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              entry.is_tested
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {entry.is_tested ? 'Tested ✓' : 'Mark as Tested'}
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="card-mystical space-y-6">
        {/* Title and Type */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
              <span className={`px-3 py-1 rounded-full text-sm ${typeConfig.bg} ${typeConfig.color} capitalize`}>
                {entry.type}
              </span>
              {entry.category && (
                <span className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300 capitalize">
                  {entry.category}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{entry.title}</h1>
            {(entry.purpose || entry.description) && (
              <p className="text-gray-300 text-lg">
                {entry.purpose || entry.description}
              </p>
            )}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entry.intent && (
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <div>
                <div className="text-xs text-gray-400">Intent</div>
                <div className="text-sm text-gray-300">{entry.intent}</div>
              </div>
            </div>
          )}

          {entry.best_timing && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-xs text-gray-400">Best Timing</div>
                <div className="text-sm text-gray-300">{entry.best_timing}</div>
              </div>
            </div>
          )}

          {entry.source && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-xs text-gray-400">Source</div>
                <div className="text-sm text-gray-300">{entry.source}</div>
              </div>
            </div>
          )}

          {entry.element && (
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs text-gray-400">Element</div>
                <div className="text-sm text-gray-300">{entry.element}</div>
              </div>
            </div>
          )}

          {entry.planet && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs text-gray-400">Planet</div>
                <div className="text-sm text-gray-300">{entry.planet}</div>
              </div>
            </div>
          )}

          {entry.moon_phase && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs text-gray-400">Moon Phase</div>
                <div className="text-sm text-gray-300">{entry.moon_phase}</div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-3">Instructions</h2>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm leading-relaxed">
              {entry.instructions}
            </pre>
          </div>
        </div>

        {/* Ingredients */}
        {entry.ingredients && entry.ingredients.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Ingredients & Materials
            </h2>
            <div className="flex flex-wrap gap-2">
              {entry.ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-green-900/20 text-green-300"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Tags
            </h2>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm bg-purple-900/20 text-purple-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">Notes</h2>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{entry.notes}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-700 pt-4 flex items-center justify-between text-sm text-gray-400">
          <div>
            Created: {format(new Date(entry.created_at), 'MMM d, yyyy')}
          </div>
          {entry.updated_at !== entry.created_at && (
            <div>
              Updated: {format(new Date(entry.updated_at), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}