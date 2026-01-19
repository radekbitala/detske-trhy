import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { EMAIL_TEMPLATES } from '@/lib/emails'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

// GET - Get single registration
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Approve registration (theme or video)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body // 'approve_theme' or 'approve_video'

    // Get current registration
    const { data: registration, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    let updateData: any = {}
    let emailType: 'theme_approved' | 'video_approved' | null = null

    if (action === 'approve_theme' && registration.status === 'pending') {
      updateData = {
        status: 'theme_approved',
        theme_approved_at: new Date().toISOString(),
        emails_sent: [...(registration.emails_sent || []), 'theme_approved']
      }
      emailType = 'theme_approved'
    } else if (action === 'approve_video' && registration.status === 'theme_approved') {
      updateData = {
        status: 'video_approved',
        video_approved_at: new Date().toISOString(),
        emails_sent: [...(registration.emails_sent || []), 'video_approved']
      }
      emailType = 'video_approved'
    } else {
      return NextResponse.json({ error: 'Invalid action or status' }, { status: 400 })
    }

    // Update registration
    const { data: updated, error: updateError } = await supabase
      .from('registrations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Send email
    if (emailType && process.env.RESEND_API_KEY) {
      try {
        const template = EMAIL_TEMPLATES[emailType]
        await resend.emails.send({
          from: 'Dětské trhy <onboarding@resend.dev>',
          to: registration.parent_email,
          subject: template.subject,
          html: template.html(registration.child_name)
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete registration
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
