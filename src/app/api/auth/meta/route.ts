import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

const SCOPES = [
  'whatsapp_business_management',
  'whatsapp_business_messaging',
  'pages_messaging',
  'instagram_manage_messages',
  'pages_show_list',
].join(',')

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const appId = process.env.META_APP_ID
  if (!appId) {
    return NextResponse.redirect(
      new URL('/dashboard/settings?meta_connect=misconfigured', request.url)
    )
  }

  // CSRF state — verified in callback
  const state = crypto.randomBytes(16).toString('hex')

  const baseUrl = new URL(request.url).origin
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: `${baseUrl}/api/auth/meta/callback`,
    scope: SCOPES,
    state,
    response_type: 'code',
  })

  const response = NextResponse.redirect(
    `https://www.facebook.com/dialog/oauth?${params.toString()}`
  )

  response.cookies.set('meta_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  return response
}
