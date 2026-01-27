import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST - Create new registration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate upload token for later video upload
    const uploadToken = randomUUID()

    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        parent_name: body.parent_name,
        parent_email: body.parent_email,
        parent_phone: body.parent_phone,
        parent_city: body.parent_city,
        parent_region: body.parent_region,
        child_name: body.child_name,
        child_age: body.child_age,
        stall_name: body.stall_name,
        products: body.products,
        presentation_url: body.presentation_url,
        consent_given: body.consent_given,
        status: 'pending',
        emails_sent: [],
        upload_token: uploadToken
      }])
      .select('*, upload_token')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return registration data including upload_token for success screen
    return NextResponse.json({
      ...data,
      hasVideo: !!body.presentation_url
    }, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - List all registrations (for admin)
export async function GET(request: NextRequest) {
  try {
    // Check admin password
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
