import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { logger } from '@/lib/logger'

interface PhoneNumber {
  id: string
  display_phone_number: string
  verified_name: string
}

interface Page {
  id: string
  name: string
  instagram_business_account?: { id: string }
}

async function fetchPhoneNumbers(accessToken: string): Promise<PhoneNumber[]> {
  const phones: PhoneNumber[] = []

  // Get businesses the user manages
  const bizRes = await fetch(
    `https://graph.facebook.com/v19.0/me/businesses?access_token=${accessToken}`
  )
  const bizData = await bizRes.json()

  for (const biz of bizData.data ?? []) {
    const wabaRes = await fetch(
      `https://graph.facebook.com/v19.0/${biz.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
    )
    const wabaData = await wabaRes.json()

    for (const waba of wabaData.data ?? []) {
      const phoneRes = await fetch(
        `https://graph.facebook.com/v19.0/${waba.id}/phone_numbers` +
        `?fields=id,display_phone_number,verified_name&access_token=${accessToken}`
      )
      const phoneData = await phoneRes.json()
      phones.push(...(phoneData.data ?? []))
    }
  }

  return phones
}

async function fetchPages(accessToken: string): Promise<Page[]> {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/me/accounts` +
    `?fields=id,name,instagram_business_account&access_token=${accessToken}`
  )
  const data = await res.json()
  return data.data ?? []
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  const baseUrl = new URL(request.url).origin

  const redirect = (path: string) => {
    const res = NextResponse.redirect(new URL(path, request.url))
    res.cookies.delete('meta_oauth_state')
    return res
  }

  // User denied
  if (errorParam) {
    return redirect('/dashboard/settings?meta_connect=denied')
  }

  // Verify CSRF state
  const savedState = request.cookies.get('meta_oauth_state')?.value
  if (!state || !savedState || state !== savedState) {
    return redirect('/dashboard/settings?meta_connect=error')
  }

  if (!code) {
    return redirect('/dashboard/settings?meta_connect=error')
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return redirect('/login')

  const appId = process.env.META_APP_ID!
  const appSecret = process.env.META_APP_SECRET!
  const callbackUrl = `${baseUrl}/api/auth/meta/callback`

  try {
    // 1. Exchange code → short-lived token
    const shortRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: callbackUrl, code })
    )
    const shortData = await shortRes.json()
    if (!shortData.access_token) throw new Error(`Token exchange failed: ${JSON.stringify(shortData)}`)

    // 2. Exchange → long-lived token (60 days)
    const longRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: shortData.access_token,
      })
    )
    const longData = await longRes.json()
    const accessToken: string = longData.access_token || shortData.access_token

    // 3. Fetch WhatsApp phone numbers + Instagram pages in parallel
    const [phoneNumbers, pages] = await Promise.all([
      fetchPhoneNumbers(accessToken),
      fetchPages(accessToken),
    ])

    logger.info('Meta OAuth: fetched resources', {
      userId: session.user.id,
      phones: phoneNumbers.length,
      pages: pages.length,
    })

    // 4a. Single phone + single page → auto-save immediately
    if (phoneNumbers.length === 1 && pages.length <= 1) {
      const instagramId = pages[0]?.instagram_business_account?.id ?? ''

      const { error: dbErr } = await supabase
        .from('tenants')
        .update({
          meta_access_token: encrypt(accessToken),
          whatsapp_phone_number_id: phoneNumbers[0].id,
          instagram_page_id: instagramId,
        })
        .eq('id', session.user.id)

      if (dbErr) throw dbErr

      return redirect('/dashboard/settings?meta_connect=success')
    }

    // 4b. Multiple options → redirect to selection page
    const payload = Buffer.from(JSON.stringify({ accessToken, phoneNumbers, pages })).toString('base64')

    const res = NextResponse.redirect(new URL('/dashboard/settings/connect', request.url))
    res.cookies.delete('meta_oauth_state')
    res.cookies.set('meta_connect_data', payload, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return res

  } catch (err) {
    logger.error('Meta OAuth callback error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return redirect('/dashboard/settings?meta_connect=error')
  }
}
