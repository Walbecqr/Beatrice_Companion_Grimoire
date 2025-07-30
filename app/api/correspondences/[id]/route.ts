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
      .from('correspondences')
      .select('*')
      .eq('id', params.id)
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Correspondence not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ correspondence: data })
  } catch (error: any) {
    console.error('Correspondence GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      is_favorited
    } = body

    // First, verify the user owns this correspondence or it's a system one they can update notes on
    const { data: existing, error: fetchError } = await supabase
      .from('correspondences')
      .select('user_id, is_personal')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Correspondence not found' }, { status: 404 })
      }
      throw fetchError
    }

    // Check permissions
    const canFullEdit = existing.user_id === user.id && existing.is_personal
    const canUpdateFavorite = existing.user_id === user.id || existing.user_id === null

    if (!canUpdateFavorite) {
      return NextResponse.json({ error: 'Not authorized to modify this correspondence' }, { status: 403 })
    }

    let updateData: any = {}

    // Always allow favorite updates if user has access
    if (typeof is_favorited === 'boolean') {
      updateData.is_favorited = is_favorited
    }

    // Only allow full edits for personal correspondences owned by user
    if (canFullEdit) {
      if (name !== undefined) updateData.name = name.trim()
      if (category !== undefined) updateData.category = category.toLowerCase()
      if (magical_properties !== undefined) updateData.magical_properties = Array.isArray(magical_properties) ? magical_properties : []
      if (traditional_uses !== undefined) updateData.traditional_uses = Array.isArray(traditional_uses) ? traditional_uses : []
      if (element !== undefined) updateData.element = element?.trim() || null
      if (planet !== undefined) updateData.planet = planet?.trim() || null
      if (zodiac_sign !== undefined) updateData.zodiac_sign = zodiac_sign?.trim() || null
      if (chakra !== undefined) updateData.chakra = chakra?.trim() || null
    }

    // Allow personal notes updates for any correspondence the user has access to
    if (personal_notes !== undefined) {
      updateData.personal_notes = personal_notes?.trim() || null
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('correspondences')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ correspondence: data })
  } catch (error: any) {
    console.error('Correspondence PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
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

    // First, verify the user owns this correspondence and it's personal
    const { data: existing, error: fetchError } = await supabase
      .from('correspondences')
      .select('user_id, is_personal, name')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Correspondence not found' }, { status: 404 })
      }
      throw fetchError
    }

    // Only allow deletion of personal correspondences owned by the user
    if (existing.user_id !== user.id || !existing.is_personal) {
      return NextResponse.json({ 
        error: 'Only personal correspondences can be deleted' 
      }, { status: 403 })
    }

    // Delete any related links first
    await supabase
      .from('correspondence_links')
      .delete()
      .eq('correspondence_id', params.id)

    // Delete the correspondence
    const { error } = await supabase
      .from('correspondences')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ 
      message: `Correspondence "${existing.name}" deleted successfully` 
    })
  } catch (error: any) {
    console.error('Correspondence DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}