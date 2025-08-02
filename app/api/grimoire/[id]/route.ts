// ================================
// FILE 2: app/api/grimoire/[id]/route.ts
// ================================

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('grimoire_entries')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Grimoire fetch error:', error)
      return NextResponse.json({ error: 'Grimoire entry not found' }, { status: 404 })
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Grimoire API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
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
      description,
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
    const validTypes = ['ritual', 'spell', 'chant', 'blessing', 'invocation', 'meditation', 'divination', 'other']
    if (!validTypes.includes(type.trim())) {
      return NextResponse.json({ error: 'Invalid type provided' }, { status: 400 })
    }

    // Prepare data for update
    const updateData = {
      title: title.trim(),
      type: type.trim(),
      category: category?.trim() || null,
      description: description?.trim() || null,
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

    const { data, error } = await supabase
      .from('grimoire_entries')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Grimoire update error:', error)
      return NextResponse.json({ error: 'Failed to update grimoire entry' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      entry: data,
      message: 'Grimoire entry updated successfully!'
    })

  } catch (error) {
    console.error('Grimoire API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('grimoire_entries')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Grimoire delete error:', error)
      return NextResponse.json({ error: 'Failed to delete grimoire entry' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Grimoire entry deleted successfully!'
    })

  } catch (error) {
    console.error('Grimoire API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}