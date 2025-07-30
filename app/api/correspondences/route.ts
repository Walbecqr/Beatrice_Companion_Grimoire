import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Default correspondences to seed the database
const DEFAULT_CORRESPONDENCES = [
  // Herbs
  {
    name: 'Sage',
    category: 'herbs',
    magical_properties: ['cleansing', 'protection', 'wisdom'],
    traditional_uses: ['Purification rituals', 'House blessing', 'Meditation enhancement'],
    element: 'Air',
    planet: 'Jupiter',
    chakra: 'Crown',
    is_personal: false,
    is_favorited: false
  },
  {
    name: 'Lavender',
    category: 'herbs',
    magical_properties: ['peace', 'healing', 'love'],
    traditional_uses: ['Sleep spells', 'Calming rituals', 'Love sachets'],
    element: 'Air',
    planet: 'Mercury',
    chakra: 'Crown',
    is_personal: false,
    is_favorited: false
  },
  {
    name: 'Rosemary',
    category: 'herbs',
    magical_properties: ['protection', 'healing', 'wisdom'],
    traditional_uses: ['Memory enhancement', 'Protection spells', 'Purification'],
    element: 'Fire',
    planet: 'Sun',
    chakra: 'Solar Plexus',
    is_personal: false,
    is_favorited: false
  },
  
  // Crystals
  {
    name: 'Clear Quartz',
    category: 'crystals',
    magical_properties: ['amplification', 'healing', 'cleansing'],
    traditional_uses: ['Energy amplification', 'Meditation', 'Chakra clearing'],
    element: 'All',
    planet: 'Sun',
    chakra: 'Crown',
    is_personal: false,
    is_favorited: false
  },
  {
    name: 'Amethyst',
    category: 'crystals',
    magical_properties: ['psychic_abilities', 'protection', 'spiritual_growth'],
    traditional_uses: ['Psychic protection', 'Dream work', 'Meditation'],
    element: 'Water',
    planet: 'Jupiter',
    chakra: 'Third Eye',
    is_personal: false,
    is_favorited: false
  },
  {
    name: 'Black Tourmaline',
    category: 'crystals',
    magical_properties: ['protection', 'grounding', 'banishing'],
    traditional_uses: ['Negative energy protection', 'Grounding rituals', 'EMF shielding'],
    element: 'Earth',
    planet: 'Saturn',
    chakra: 'Root',
    is_personal: false,
    is_favorited: false
  },
  
  // Colors
  {
    name: 'Purple',
    category: 'colors',
    magical_properties: ['psychic_abilities', 'spiritual_growth', 'wisdom'],
    traditional_uses: ['Divination', 'Third eye work', 'Crown chakra healing'],
    element: 'Spirit',
    planet: 'Jupiter',
    chakra: 'Crown',
    is_personal: false,
    is_favorited: false
  },
  {
    name: 'Green',
    category: 'colors',
    magical_properties: ['abundance', 'healing', 'growth'],
    traditional_uses: ['Money spells', 'Healing rituals', 'Garden magic'],
    element: 'Earth',
    planet: 'Venus',
    chakra: 'Heart',
    is_personal: false,
    is_favorited: false
  },
  
  // Tools
  {
    name: 'Athame',
    category: 'tools',
    magical_properties: ['direction', 'cutting', 'protection'],
    traditional_uses: ['Circle casting', 'Energy direction', 'Ritual work'],
    element: 'Fire',
    planet: 'Mars',
    is_personal: false,
    is_favorited: false
  },
  {
    name: 'Pentacle',
    category: 'tools',
    magical_properties: ['grounding', 'protection', 'manifestation'],
    traditional_uses: ['Altar centerpiece', 'Blessing objects', 'Earth magic'],
    element: 'Earth',
    planet: 'Venus',
    is_personal: false,
    is_favorited: false
  }
]

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const property = searchParams.get('property')
    const personalOnly = searchParams.get('personal') === 'true'
    const favoritesOnly = searchParams.get('favorites') === 'true'

    let query = supabase
      .from('correspondences')
      .select('*')
      .or(`user_id.eq.${user.id},is_personal.eq.false`)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (property) {
      query = query.contains('magical_properties', [property])
    }

    if (personalOnly) {
      query = query.eq('is_personal', true).eq('user_id', user.id)
    }

    if (favoritesOnly) {
      query = query.eq('is_favorited', true)
    }

    const { data, error } = await query.order('name', { ascending: true })

    if (error) throw error

    // If no correspondences exist, seed with defaults
    if (!data || data.length === 0) {
      await seedDefaultCorrespondences(supabase)
      
      // Refetch after seeding
      const { data: seededData, error: refetchError } = await supabase
        .from('correspondences')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .order('name', { ascending: true })

      if (refetchError) throw refetchError
      return NextResponse.json({ correspondences: seededData || [] })
    }

    return NextResponse.json({ correspondences: data })
  } catch (error: any) {
    console.error('Correspondences GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      category,
      magical_properties,
      traditional_uses,
      personal_notes,
      element,
      planet,
      zodiac_sign,
      chakra,
      is_personal = true
    } = body

    if (!name || !category || !magical_properties) {
      return NextResponse.json(
        { error: 'Name, category, and magical properties are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('correspondences')
      .insert({
        user_id: user.id,
        name: name.trim(),
        category: category.toLowerCase(),
        magical_properties: Array.isArray(magical_properties) ? magical_properties : [],
        traditional_uses: Array.isArray(traditional_uses) ? traditional_uses : [],
        personal_notes: personal_notes?.trim() || null,
        element: element?.trim() || null,
        planet: planet?.trim() || null,
        zodiac_sign: zodiac_sign?.trim() || null,
        chakra: chakra?.trim() || null,
        is_personal,
        is_favorited: false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ correspondence: data })
  } catch (error: any) {
    console.error('Correspondences POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function seedDefaultCorrespondences(supabase: any) {
  try {
    // Check if defaults already exist
    const { data: existing } = await supabase
      .from('correspondences')
      .select('id')
      .is('user_id', null)
      .limit(1)

    if (existing && existing.length > 0) {
      return // Defaults already seeded
    }

    // Insert default correspondences with null user_id (system defaults)
    const { error } = await supabase
      .from('correspondences')
      .insert(
        DEFAULT_CORRESPONDENCES.map(item => ({
          ...item,
          user_id: null // System defaults
        }))
      )

    if (error) {
      console.error('Error seeding default correspondences:', error)
    } else {
      console.log('Successfully seeded default correspondences')
    }
  } catch (error) {
    console.error('Error in seedDefaultCorrespondences:', error)
  }
}