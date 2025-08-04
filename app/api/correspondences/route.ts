// app/api/correspondences/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Enhanced default correspondences with new fields
const DEFAULT_CORRESPONDENCES = [
  // Herbs
  {
    name: 'Sage',
    category: 'herbs',
    description: 'A hardy perennial herb with silvery-green leaves and a strong, earthy aroma. Native to the Mediterranean region.',
    botanical_name: 'Salvia officinalis',
    common_names: ['Garden Sage', 'Common Sage', 'Culinary Sage'],
    magical_properties: ['cleansing', 'protection', 'wisdom'],
    traditional_uses: ['Purification rituals', 'House blessing', 'Meditation enhancement'],
    medical_uses: ['Digestive aid', 'Anti-inflammatory', 'Memory enhancement'],
    element: 'Air',
    energy_type: 'masculine',
    planet: 'Jupiter',
    chakra: 'Crown',
    deities: ['Athena', 'Zeus'],
    folklore: 'Romans believed sage could grant immortality and used it in sacred ceremonies. The name comes from the Latin "salvere" meaning "to be saved."',
    historical_uses: ['Roman ceremonial practices', 'Medieval medicine', 'Traditional European folk magic'],
    is_personal: false,
    is_favorited: false,
    source: 'Traditional Grimoire Knowledge',
    verified: true
  },
  {
    name: 'Lavender',
    category: 'herbs',
    description: 'A fragrant flowering plant with purple flower spikes and narrow, silvery leaves. Highly prized for its calming scent.',
    botanical_name: 'Lavandula angustifolia',
    common_names: ['English Lavender', 'True Lavender'],
    magical_properties: ['peace', 'healing', 'love', 'purification'],
    traditional_uses: ['Sleep spells', 'Calming rituals', 'Love sachets', 'Protection charms'],
    medical_uses: ['Anxiety relief', 'Sleep aid', 'Wound healing', 'Headache treatment'],
    element: 'Air',
    energy_type: 'feminine',
    planet: 'Mercury',
    chakra: 'Crown',
    deities: ['Hecate', 'Diana'],
    folklore: 'Ancient Greeks and Romans added lavender to their baths for purification. Medieval belief held that lavender could ward off evil spirits.',
    historical_uses: ['Roman bathing rituals', 'Medieval monastery gardens', 'Victorian smelling salts'],
    is_personal: false,
    is_favorited: false,
    source: 'Traditional Grimoire Knowledge',
    verified: true
  },
  
  // Crystals
  {
    name: 'Clear Quartz',
    category: 'crystals',
    description: 'A transparent crystalline mineral composed of silicon dioxide. Forms in hexagonal crystal systems and is found worldwide.',
    common_names: ['Rock Crystal', 'Master Healer', 'Ice Crystal'],
    magical_properties: ['amplification', 'healing', 'cleansing', 'clarity'],
    traditional_uses: ['Energy amplification', 'Meditation', 'Chakra clearing', 'Scrying'],
    medical_uses: ['Pain relief (crystal healing)', 'Energy balancing', 'Headache relief'],
    element: 'All',
    energy_type: 'masculine',
    planet: 'Sun',
    chakra: 'Crown',
    deities: ['Apollo', 'Helios'],
    folklore: 'Ancient civilizations believed clear quartz was eternal ice sent by gods. Australian Aborigines used it in rain ceremonies.',
    historical_uses: ['Ancient divination', 'Egyptian ceremonial objects', 'Native American sacred tools'],
    is_personal: false,
    is_favorited: false,
    source: 'Traditional Grimoire Knowledge',
    verified: true
  },
  {
    name: 'Amethyst',
    category: 'crystals',
    description: 'A violet variety of quartz crystal, ranging from pale lilac to deep purple. Forms in geodes and crystal clusters.',
    common_names: ['Purple Quartz', 'Bishop\'s Stone'],
    magical_properties: ['psychic_abilities', 'protection', 'spiritual_growth', 'clarity'],
    traditional_uses: ['Psychic protection', 'Dream work', 'Meditation', 'Divination enhancement'],
    medical_uses: ['Addiction recovery support', 'Insomnia relief', 'Stress reduction'],
    element: 'Water',
    energy_type: 'feminine',
    planet: 'Jupiter',
    zodiac_sign: 'Pisces',
    chakra: 'Third Eye',
    deities: ['Bacchus', 'Diana', 'Artemis'],
    folklore: 'Greeks believed amethyst prevented intoxication. Christian tradition associated it with Christ\'s blood and spiritual royalty.',
    historical_uses: ['Ancient Greek symposiums', 'Christian bishop rings', 'Egyptian burial chambers'],
    is_personal: false,
    is_favorited: false,
    source: 'Traditional Grimoire Knowledge',
    verified: true
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
    const element = searchParams.get('element')
    const energy = searchParams.get('energy')
    const planet = searchParams.get('planet')
    const personalOnly = searchParams.get('personal') === 'true'
    const favoritesOnly = searchParams.get('favorites') === 'true'
    const search = searchParams.get('search')

    let query = supabase
      .from('correspondences')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (property) {
      query = query.contains('magical_properties', [property])
    }

    if (element) {
      query = query.eq('element', element)
    }

    if (energy) {
      query = query.eq('energy_type', energy)
    }

    if (planet) {
      query = query.eq('planet', planet)
    }

    if (personalOnly) {
      query = query.eq('is_personal', true).eq('user_id', user.id)
    }

    if (favoritesOnly) {
      query = query.eq('is_favorited', true)
    }

    // Use enhanced search function if search term provided
    if (search) {
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_correspondences_enhanced', {
          search_term: search,
          user_uuid: user.id,
          category_filter: category,
          element_filter: element,
          energy_filter: energy,
          planet_filter: planet
        })

      if (searchError) throw searchError
      return NextResponse.json({ correspondences: searchResults || [] })
    }

    const { data, error } = await query
      .order('verified', { ascending: false }) // Verified entries first
      .order('name', { ascending: true })

    if (error) throw error

    // If no correspondences exist, seed with enhanced defaults
    if (!data || data.length === 0) {
      await seedDefaultCorrespondences(supabase)
      
      // Refetch after seeding
      const { data: seededData, error: refetchError } = await supabase
        .from('correspondences')
        .select('*')
        .or(`user_id.is.null,user_id.eq.${user.id}`)
        .order('verified', { ascending: false })
        .order('name', { ascending: true })

      if (refetchError) throw refetchError
      return NextResponse.json({ correspondences: seededData || [] })
    }

    return NextResponse.json({ correspondences: data })
  } catch (error: any) {
    console.error('Correspondences GET error:', error)
    
    // Check for RSC errors
    const errorMessage = error.message || ''
    const errorStack = error.stack || ''
    const isRscError = 
      errorMessage.includes('_rsc') || 
      errorStack.includes('_rsc') || 
      errorMessage.includes('ERR_ABORTED') ||
      errorStack.includes('ERR_ABORTED')
    
    if (isRscError) {
      console.log('Detected RSC error in correspondences GET API:', errorMessage)
      return NextResponse.json(
        { error: 'A React Server Component error occurred. Please refresh the page and try again.' },
        { status: 500 }
      )
    }
    
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
      description,
      botanical_name,
      common_names,
      magical_properties,
      traditional_uses,
      medical_uses,
      personal_applications,
      personal_notes,
      element,
      planet,
      zodiac_sign,
      chakra,
      energy_type,
      deities,
      cultural_traditions,
      folklore,
      historical_uses,
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
        description: description?.trim() || null,
        botanical_name: botanical_name?.trim() || null,
        common_names: Array.isArray(common_names) ? common_names.filter(n => n.trim()) : [],
        magical_properties: Array.isArray(magical_properties) ? magical_properties : [],
        traditional_uses: Array.isArray(traditional_uses) ? traditional_uses.filter(u => u.trim()) : [],
        medical_uses: Array.isArray(medical_uses) ? medical_uses.filter(u => u.trim()) : [],
        personal_applications: Array.isArray(personal_applications) ? personal_applications.filter(a => a.trim()) : [],
        personal_notes: personal_notes?.trim() || null,
        element: element?.trim() || null,
        planet: planet?.trim() || null,
        zodiac_sign: zodiac_sign?.trim() || null,
        chakra: chakra?.trim() || null,
        energy_type: energy_type || null,
        deities: Array.isArray(deities) ? deities.filter(d => d.trim()) : [],
        cultural_traditions: cultural_traditions || null,
        folklore: folklore?.trim() || null,
        historical_uses: Array.isArray(historical_uses) ? historical_uses.filter(h => h.trim()) : [],
        is_personal,
        is_favorited: false,
        source: is_personal ? 'User Entry' : null,
        verified: false
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ correspondence: data })
  } catch (error: any) {
    console.error('Correspondences POST error:', error)
    
    // Check for RSC errors
    const errorMessage = error.message || ''
    const errorStack = error.stack || ''
    const isRscError = 
      errorMessage.includes('_rsc') || 
      errorStack.includes('_rsc') || 
      errorMessage.includes('ERR_ABORTED') ||
      errorStack.includes('ERR_ABORTED')
    
    if (isRscError) {
      console.log('Detected RSC error in correspondences POST API:', errorMessage)
      return NextResponse.json(
        { error: 'A React Server Component error occurred. Please refresh the page and try again.' },
        { status: 500 }
      )
    }
    
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

    // Insert enhanced default correspondences with null user_id (system defaults)
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
      console.log('Successfully seeded enhanced default correspondences')
    }
  } catch (error) {
    console.error('Error in seedDefaultCorrespondences:', error)
  }
}
