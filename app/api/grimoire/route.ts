// ================================
// FILE 1: app/api/grimoire/route.ts
// ================================

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isValidGrimoireType } from '@/types/grimoire'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Get current user
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate required fields
    const { 
      title, 
      type, 
      category,
      subcategory,
      description,
      purpose,
      ingredients,
      instructions,
      notes,
      intent,
      best_timing,
      difficulty_level,
      moon_phase,
      season,
      element,
      planet,
      chakra,
      source,
      tags,
      is_favorite,
      is_tested,
      effectiveness_rating
    } = body

    // Basic validation
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    if (!type || type.trim() === '') {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 })
    }

    // ✅ FIXED: Add validation for instructions (NOT NULL field)
    if (!instructions || instructions.trim() === '') {
      return NextResponse.json({ error: 'Instructions are required' }, { status: 400 })
    }

    // ✅ FIXED: Validate type against database CHECK constraint
    if (!isValidGrimoireType(type.trim())) {
      return NextResponse.json({ error: 'Invalid type provided' }, { status: 400 })
    }
    // Prepare data for insertion
    const grimoireData = {
      user_id: user.id,
      title: title.trim(),
      type: type.trim(),
      category: category?.trim() || null,
      subcategory: subcategory?.trim() || null,
      description: description?.trim() || null,
      purpose: purpose?.trim() || null,
      ingredients: ingredients || [],
      instructions: instructions.trim(), // ✅ FIXED: Remove || null since this is NOT NULL
      notes: notes?.trim() || null,
      intent: intent?.trim() || null,
      best_timing: best_timing?.trim() || null,
      difficulty_level: difficulty_level || null,
      moon_phase: moon_phase?.trim() || null,
      season: season?.trim() || null,
      element: element?.trim() || null,
      planet: planet?.trim() || null, 
      chakra: chakra?.trim() || null,
      source: source?.trim() || null,
      tags: tags || [],
      is_favorite: is_favorite || false,
      is_tested: is_tested || false,
      effectiveness_rating: effectiveness_rating || null
    }

    // Insert into database
    const { data, error } = await supabase
      .from('grimoire_entries')
      .insert(grimoireData)
      .select()
      .single()

    if (error) {
      console.error('Grimoire insertion error:', error)
      return NextResponse.json(
        { error: 'Failed to save grimoire entry. Please check all fields and try again.' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      entry: data,
      message: 'Grimoire entry saved successfully!'
    })

  } catch (error) {
    console.error('Grimoire API error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' }, 
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const category = searchParams.get('category')

    // Get current user
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build query
    let query = supabase
      .from('grimoire_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,instructions.ilike.%${search}%`)
    }

    if (type) {
      query = query.eq('type', type)
    }

    if (category) {
      query = query.eq('category', category)
    }

    // Apply pagination and ordering
    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Grimoire fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch grimoire entries' }, { status: 500 })
    }

    return NextResponse.json({
      entries: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Grimoire API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}