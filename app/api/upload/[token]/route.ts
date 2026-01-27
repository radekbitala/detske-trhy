import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Get registration by upload token (public, limited fields)
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('id, child_name, stall_name, presentation_url, parent_email')
      .eq('upload_token', params.token)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update presentation_url by upload token
export async function PUT(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json()
    const { presentation_url } = body

    if (!presentation_url) {
      return NextResponse.json({ error: 'presentation_url is required' }, { status: 400 })
    }

    // First, verify the token exists and get current registration
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('id, presentation_url')
      .eq('upload_token', params.token)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    // Check if video is already uploaded
    if (registration.presentation_url) {
      return NextResponse.json({ error: 'Video already uploaded' }, { status: 400 })
    }

    // Update the presentation_url
    const { data: updated, error: updateError } = await supabase
      .from('registrations')
      .update({ presentation_url })
      .eq('upload_token', params.token)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
