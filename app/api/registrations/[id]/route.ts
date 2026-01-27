import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { EMAIL_TEMPLATES } from '@/lib/emails'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

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
    const { action } = body // 'approve_theme', 'approve_video', or 'approve_all'

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

    if (action === 'approve_all' && registration.status === 'pending' && registration.presentation_url) {
      // Approve both theme and video at once (when video was uploaded during registration)
      updateData = {
        status: 'video_approved',
        theme_approved_at: new Date().toISOString(),
        video_approved_at: new Date().toISOString(),
        emails_sent: [...(registration.emails_sent || []), 'video_approved']
      }
      emailType = 'video_approved'
    } else if (action === 'approve_theme' && registration.status === 'pending') {
      // Approve theme only (no video yet)
      updateData = {
        status: 'theme_approved',
        theme_approved_at: new Date().toISOString(),
        emails_sent: [...(registration.emails_sent || []), 'theme_approved']
      }
      emailType = 'theme_approved'
    } else if (action === 'approve_video' && registration.status === 'theme_approved') {
      // Approve video (after video was uploaded later)
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

    // Send email (only if Resend is configured)
    if (emailType && resend) {
      try {
        const template = EMAIL_TEMPLATES[emailType]
        // For theme_approved, include the upload URL
        const uploadUrl = emailType === 'theme_approved' && registration.upload_token
          ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://detske-trhy.vercel.app'}/upload/${registration.upload_token}`
          : undefined
        await resend.emails.send({
          from: 'Dětské trhy <onboarding@resend.dev>',
          to: registration.parent_email,
          subject: template.subject,
          html: template.html(registration.child_name, uploadUrl)
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
