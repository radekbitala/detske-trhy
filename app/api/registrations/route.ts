import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { Resend } from 'resend'
import { EMAIL_TEMPLATES } from '@/lib/emails'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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

    // Send confirmation email
    const hasVideo = !!body.presentation_url
    if (resend) {
      try {
        const uploadUrl = !hasVideo
          ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://detske-trhy.vercel.app'}/upload/${uploadToken}`
          : undefined

        await resend.emails.send({
          from: 'Dětské trhy <onboarding@resend.dev>',
          to: body.parent_email,
          subject: EMAIL_TEMPLATES.registration_confirmed.subject,
          html: EMAIL_TEMPLATES.registration_confirmed.html(
            body.child_name,
            body.stall_name,
            hasVideo,
            uploadUrl
          )
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Return registration data including upload_token for success screen
    return NextResponse.json({
      ...data,
      hasVideo
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
