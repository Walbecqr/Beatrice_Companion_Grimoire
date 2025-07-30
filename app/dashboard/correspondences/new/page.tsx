'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, X, Sparkles, BookOpen } from 'lucide-react'

const CATEGORIES = [
  { value: 'herbs', label: 'Herbs & Plants', icon: '🌿' },
  { value: 'crystals', label: 'Crystals & Stones', icon: '💎' },
  { value: 'colors', label: 'Colors', icon: '🎨' },
  { value: 'elements', label: 'Elements', icon: '🔥' },
  { value: 'tools', label: 'Magical Tools', icon: '🔮' },
  { value: 'incense', label: 'Incense & Resins', icon: '🕯️' },
  { value: 'oils', label: 'Essential Oils', icon: '🫗' },
  { value: 'candles', label: 'Candles', icon: '🕯️' },
  { value: 'symbols', label: 'Symbols & Sigils', icon: '✨' },
  { value: 'deities', label: 'Deities & Spirits', icon: '👑' },
  { value: 'animals', label: 'Animal Spirits', icon: '🦋' },
  { value: 'trees', label: 'Sacred Trees', icon: '🌳' },
  { value: 'other', label: 'Other', icon: '📜' }
]

const MAGICAL_PROPERTIES = [
  'protection', 'love', 'abundance', 'healing', 'banishing', 'cleansing',
  'divination', 'wisdom', 'courage', 'peace', 'psychic_abilities', 
  'spiritual_growth', 'grounding', 'transformation', 'communication',
  'prosperity', 'fertility', 'luck', 'success', 'creativity', 'intuition',
  'balance', 'harmony', 'strength', 'clarity', 'manifestation', 'warding',
  'purification', 'conflict_resolution'
]

const ELEMENTS = ['Fire', 'Water', 'Earth', 'Air', 'Spirit']
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]
const CHAKRAS = ['Root', 'Sacral', 'Solar Plexus', 'Heart', 'Throat', 'Third Eye', 'Crown']
const ENERGY_TYPES = ['masculine', 'feminine']

export default function NewCorrespondencePage() {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [botanicalName, setBotanicalName] = useState('')
  const [commonNames, setCommonNames] = useState<string[]>([''])
  
  // Magical Properties
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [newProperty, setNewProperty] = useState('')
  
  // Applications and Uses
  const [traditionalUses, setTraditionalUses] = useState<string[]>([''])
  const [medicalUses, setMedicalUses] = useState<string[]>([''])
  const [personalApplications, setPersonalApplications] = useState<string[]>([''])
  const [personalNotes, setPersonalNotes] = useState('')
  
  // Correspondences
  const [element, setElement] = useState('')
  const [planet, setPlanet] = useState('')
  const [zodiacSign, setZodiacSign] = useState('')
  const [chakra, setChakra] = useState('')
  const [energyType, setEnergyType] = useState('')
  
  // Spiritual & Cultural
  const [deities, setDeities] = useState<string[]>([''])
  const [folklore, setFolklore] = useState('')
  const [historicalUses, setHistoricalUses] = useState<string[]>([''])
  
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const toggleProperty = (property: string) => {
    if (selectedProperties.includes(property)) {
      setSelectedProperties(selectedProperties.filter(p => p !== property))
    } else {
      setSelectedProperties([...selectedProperties, property])
    }
  }

  const addCustomProperty = () => {
    if (newProperty.trim() && !selectedProperties.includes(newProperty.toLowerCase())) {
      setSelectedProperties([...selectedProperties, newProperty.toLowerCase().replace(' ', '_')])
      setNewProperty('')
    }
  }

  // Generic array management functions
  const addArrayItem = (array: string[], setArray: (arr: string[]) => void) => {
    setArray([...array, ''])
  }

  const updateArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number, value: string) => {
    const updated = [...array]
    updated[index] = value
    setArray(updated)
  }

  const removeArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number) => {
    setArray(array.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category || selectedProperties.length === 0) return

    setSaving(true)

    try {
      const filterEmpty = (arr: string[]) => arr.filter(item => item.trim())
      
      const response = await fetch('/api/correspondences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim() || null,
          botanical_name: botanicalName.trim() || null,
          common_names: filterEmpty(commonNames),
          magical_properties: selectedProperties,
          traditional_uses: filterEmpty(traditionalUses),
          medical_uses: filterEmpty(medicalUses),
          personal_applications: filterEmpty(personalApplications),
          personal_notes: personalNotes.trim() || null,
          element: element || null,
          planet: planet || null,
          zodiac_sign: zodiacSign || null,
          chakra: chakra || null,
          energy_type: energyType || null,
          deities: filterEmpty(deities),
          folklore: folklore.trim() || null,
          historical_uses: filterEmpty(historicalUses),
          is_personal: true
        }),
      })

      if (!response.ok) throw new Error('Failed to save correspondence')

      router.push('/dashboard/correspondences')
    } catch (error) {
      console.error('Error saving correspondence:', error)
      alert('Failed to save correspondence. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getPropertyColor = (property: string) => {
    const colorMap: Record<string, string> = {
      'protection': 'text-blue-400 bg-blue-900/20',
      'love': 'text-pink-400 bg-pink-900/20',
      'abundance': 'text-green-400 bg-green-900/20',
      'healing': 'text-emerald-400 bg-emerald-900/20',
      'banishing': 'text-red-400 bg-red-900/20',
      'cleansing': 'text-cyan-400 bg-cyan-900/20',
      'divination': 'text-purple-400 bg-purple-900/20',
      'wisdom': 'text-indigo-400 bg-indigo-900/20',
      'courage': 'text-orange-400 bg-orange-900/20',
      'peace': 'text-sky-400 bg-sky-900/20',
      'psychic_abilities': 'text-violet-400 bg-violet-900/20',
      'spiritual_growth': 'text-amber-400 bg-amber-900/20',
      'grounding': 'text-stone-400 bg-stone-900/20',
      'transformation': 'text-fuchsia-400 bg-fuchsia-900/20',
      'communication': 'text-yellow-400 bg-yellow-900/20'
    }
    return colorMap[property] || 'text-gray-400 bg-gray-900/20'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link 
          href="/dashboard/correspondences" 
          className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Correspondences
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Add New Correspondence</h1>
            <p className="text-sm text-gray-400 mt-1">
              Add to your personal magical reference library
            </p>
          </div>
          <BookOpen className="w-12 h-12 text-purple-300" />
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rose Quartz, Sage, Purple Candle..."
                  className="input-mystical w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-mystical w-full"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the physical appearance, origin, and basic properties..."
                className="input-mystical w-full min-h-[100px] resize-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Botanical/Scientific Name
                </label>
                <input
                  type="text"
                  value={botanicalName}
                  onChange={(e) => setBotanicalName(e.target.value)}
                  placeholder="e.g., Aloe barbadensis miller"
                  className="input-mystical w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Common Names
              </label>
              <div className="space-y-2">
                {commonNames.map((name, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => updateArrayItem(commonNames, setCommonNames, index, e.target.value)}
                      placeholder={`Common name ${index + 1}...`}
                      className="input-mystical flex-1"
                    />
                    {commonNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(commonNames, setCommonNames, index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(commonNames, setCommonNames)}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add another name
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Magical Properties */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4">Magical Properties *</h3>
          
          {/* Selected Properties */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedProperties.map(property => (
              <span
                key={property}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getPropertyColor(property)}`}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {property.replace('_', ' ')}
                <button
                  type="button"
                  onClick={() => setSelectedProperties(selectedProperties.filter(p => p !== property))}
                  className="ml-2 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Available Properties */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
            {MAGICAL_PROPERTIES.map(property => (
              <button
                key={property}
                type="button"
                onClick={() => toggleProperty(property)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedProperties.includes(property)
                    ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {property.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Add Custom Property */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newProperty}
              onChange={(e) => setNewProperty(e.target.value)}
              placeholder="Add custom property..."
              className="input-mystical flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomProperty())}
            />
            <button
              type="button"
              onClick={addCustomProperty}
              className="btn-mystical px-4"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Applications and Uses */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4">Applications & Uses</h3>
          <div className="space-y-6">
            {/* Traditional Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Traditional Magical Uses
              </label>
              <div className="space-y-2">
                {traditionalUses.map((use, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={use}
                      onChange={(e) => updateArrayItem(traditionalUses, setTraditionalUses, index, e.target.value)}
                      placeholder={`Traditional use ${index + 1}...`}
                      className="input-mystical flex-1"
                    />
                    {traditionalUses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(traditionalUses, setTraditionalUses, index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(traditionalUses, setTraditionalUses)}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add traditional use
                </button>
              </div>
            </div>

            {/* Medical Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Medical & Healing Uses
              </label>
              <div className="space-y-2">
                {medicalUses.map((use, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={use}
                      onChange={(e) => updateArrayItem(medicalUses, setMedicalUses, index, e.target.value)}
                      placeholder={`Medical use ${index + 1}...`}
                      className="input-mystical flex-1"
                    />
                    {medicalUses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(medicalUses, setMedicalUses, index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(medicalUses, setMedicalUses)}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add medical use
                </button>
              </div>
            </div>

            {/* Personal Applications */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Personal Applications
              </label>
              <div className="space-y-2">
                {personalApplications.map((app, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={app}
                      onChange={(e) => updateArrayItem(personalApplications, setPersonalApplications, index, e.target.value)}
                      placeholder={`Personal application ${index + 1}...`}
                      className="input-mystical flex-1"
                    />
                    {personalApplications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(personalApplications, setPersonalApplications, index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(personalApplications, setPersonalApplications)}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add personal application
                </button>
              </div>
            </div>

            {/* Personal Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Personal Notes & Experiences
              </label>
              <textarea
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Share your personal experiences, observations, or unique insights..."
                className="input-mystical w-full min-h-[120px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Elemental & Planetary Correspondences */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4">Elemental & Planetary Correspondences</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Element</label>
              <select
                value={element}
                onChange={(e) => setElement(e.target.value)}
                className="input-mystical w-full"
              >
                <option value="">Select element</option>
                {ELEMENTS.map(el => (
                  <option key={el} value={el}>{el}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Planet</label>
              <select
                value={planet}
                onChange={(e) => setPlanet(e.target.value)}
                className="input-mystical w-full"
              >
                <option value="">Select planet</option>
                {PLANETS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Zodiac Sign</label>
              <select
                value={zodiacSign}
                onChange={(e) => setZodiacSign(e.target.value)}
                className="input-mystical w-full"
              >
                <option value="">Select zodiac sign</option>
                {ZODIAC_SIGNS.map(sign => (
                  <option key={sign} value={sign}>{sign}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Chakra</label>
              <select
                value={chakra}
                onChange={(e) => setChakra(e.target.value)}
                className="input-mystical w-full"
              >
                <option value="">Select chakra</option>
                {CHAKRAS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Energy Type</label>
              <select
                value={energyType}
                onChange={(e) => setEnergyType(e.target.value)}
                className="input-mystical w-full"
              >
                <option value="">Select energy type</option>
                {ENERGY_TYPES.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Spiritual & Cultural */}
        <div className="card-mystical">
          <h3 className="text-lg font-semibold mb-4">Spiritual & Cultural Information</h3>
          <div className="space-y-4">
            {/* Deities */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Associated Deities
              </label>
              <div className="space-y-2">
                {deities.map((deity, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={deity}
                      onChange={(e) => updateArrayItem(deities, setDeities, index, e.target.value)}
                      placeholder={`Deity ${index + 1}...`}
                      className="input-mystical flex-1"
                    />
                    {deities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(deities, setDeities, index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(deities, setDeities)}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add deity
                </button>
              </div>
            </div>

            {/* Folklore */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Folklore, Legends & Lore
              </label>
              <textarea
                value={folklore}
                onChange={(e) => setFolklore(e.target.value)}
                placeholder="Share the myths, legends, stories, and traditional lore associated with this correspondence..."
                className="input-mystical w-full min-h-[120px] resize-none"
              />
            </div>

            {/* Historical Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Historical Uses
              </label>
              <div className="space-y-2">
                {historicalUses.map((use, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={use}
                      onChange={(e) => updateArrayItem(historicalUses, setHistoricalUses, index, e.target.value)}
                      placeholder={`Historical use ${index + 1}...`}
                      className="input-mystical flex-1"
                    />
                    {historicalUses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(historicalUses, setHistoricalUses, index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(historicalUses, setHistoricalUses)}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add historical use
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card-mystical bg-purple-900/20">
          <div className="flex items-start space-x-3">
            <BookOpen className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-300">
              <p className="font-medium mb-2">Building Your Correspondence Library:</p>
              <ul className="space-y-1 text-gray-400 text-xs">
                <li>• Fill in as much or as little detail as you know - you can always edit later</li>
                <li>• Traditional, medical, and personal uses help track different applications</li>
                <li>• Include folklore and legends to preserve the spiritual wisdom</li>
                <li>• Use the search features to quickly find correspondences during rituals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link 
            href="/dashboard/correspondences"
            className="px-6 py-3 border border-purple-500 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !name.trim() || !category || selectedProperties.length === 0}
            className="btn-mystical disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5 mr-2" />
            {saving ? 'Saving...' : 'Save Correspondence'}
          </button>
        </div>
      </form>
    </div>
  )
}