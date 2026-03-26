import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateResponse } from '@/lib/ai/gemini'
import { sendMetaMessage } from '@/lib/meta/api'
import { Message } from '@/lib/types'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limit'
import { decrypt } from '@/lib/crypto'

/**
 * Meta Webhook Handler with AI Integration
 */

/** Verify Meta's HMAC-SHA256 signature to ensure the request is authentic */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  if (expected.length !== signature.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'))
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response(null, { status: 403 })
}

export async function POST(request: Request) {
  // Rate limit: 60 webhook events per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(`webhook:${ip}`, 60, 60_000)) {
    logger.warn('Webhook: rate limit exceeded', { ip })
    return new Response(null, { status: 429 })
  }

  // Read raw body first (needed for HMAC verification before parsing)
  const rawBody = await request.text()

  // Verify signature if META_APP_SECRET is configured
  const appSecret = process.env.META_APP_SECRET
  if (appSecret) {
    const signature = request.headers.get('x-hub-signature-256')
    if (!verifySignature(rawBody, signature, appSecret)) {
      logger.error('Webhook: invalid signature — request rejected')
      return new Response(null, { status: 403 })
    }
  }

  const supabase = createAdminClient()

  try {
    const body = JSON.parse(rawBody)

    let customerId = ''
    let incomingText = ''
    let messageId = ''
    let platform: 'whatsapp' | 'instagram' = 'whatsapp'
    // IDs used to identify which tenant owns this channel
    let phoneNumberId = ''  // WhatsApp: matches tenants.whatsapp_phone_number_id
    let pageId = ''         // Instagram: matches tenants.instagram_page_id

    // 1. Parse Message (WhatsApp or Instagram)
    if (body.object === 'whatsapp_business_account') {
      const change = body.entry?.[0]?.changes?.[0]?.value
      const message = change?.messages?.[0]
      if (message?.type === 'text') {
        customerId = message.from
        incomingText = message.text.body
        messageId = message.id
        platform = 'whatsapp'
        // phone_number_id identifies which WhatsApp number received the message
        phoneNumberId = change?.metadata?.phone_number_id ?? ''
      }
    } else if (body.object === 'page' || body.object === 'instagram') {
      const messaging = body.entry?.[0]?.messaging?.[0]
      if (messaging?.message?.text) {
        customerId = messaging.sender.id
        incomingText = messaging.message.text
        messageId = messaging.message.mid
        platform = 'instagram'
        // entry[0].id is the Page/Instagram Business Account ID
        pageId = body.entry?.[0]?.id ?? ''
      }
    }

    if (!customerId || !incomingText) {
      return NextResponse.json({ status: 'ignored' })
    }

    // 2. Identify Tenant by channel ownership (not just "first active")
    // OLD (MVP): .eq('status', 'active').limit(1)  ← all messages went to one tenant
    // NEW: match the exact channel ID that received the message
    let tenantQuery = supabase
      .from('tenants')
      .select('id, store_name, meta_access_token, whatsapp_phone_number_id, instagram_page_id')
      .eq('status', 'active')

    if (platform === 'whatsapp' && phoneNumberId) {
      tenantQuery = tenantQuery.eq('whatsapp_phone_number_id', phoneNumberId)
    } else if (platform === 'instagram' && pageId) {
      tenantQuery = tenantQuery.eq('instagram_page_id', pageId)
    } else {
      // No channel ID to match — cannot route safely
      logger.error('Webhook: cannot identify tenant — missing channel ID in payload')
      return NextResponse.json({ status: 'ignored' })
    }

    const { data: tenant, error: tenantError } = await tenantQuery.single()

    if (tenantError || !tenant) {
      logger.error('Webhook: no active tenant found for channel', { platform, channel: phoneNumberId || pageId })
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // 3. Deduplication — skip if we already processed this exact message
    const { data: existing } = await supabase
      .from('conversations')
      .select('last_processed_message_id')
      .eq('tenant_id', tenant.id)
      .eq('customer_phone_or_id', customerId)
      .eq('platform', platform)
      .single()

    if (existing?.last_processed_message_id === messageId) {
      logger.info('Webhook: duplicate message — skipping', { messageId })
      return NextResponse.json({ status: 'duplicate' })
    }

    // 4. Fetch Products Context
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenant.id)

    // 5. Get Conversation History
    const { data: conv } = await supabase
      .from('conversations')
      .select('message_history')
      .eq('tenant_id', tenant.id)
      .eq('customer_phone_or_id', customerId)
      .eq('platform', platform)
      .single()

    const history: Message[] = conv?.message_history || []

    // 6. Generate AI Response
    const aiReply = await generateResponse(
      incomingText,
      tenant.store_name,
      products || [],
      history
    )

    // 7. Update Conversation History + mark message as processed
    const newHistory: Message[] = [
      ...history,
      { role: 'customer', content: incomingText, timestamp: new Date().toISOString() },
      { role: 'ai', content: aiReply, timestamp: new Date().toISOString() }
    ]

    await supabase
      .from('conversations')
      .upsert({
        tenant_id: tenant.id,
        customer_phone_or_id: customerId,
        platform,
        message_history: newHistory,
        last_processed_message_id: messageId
      }, { onConflict: 'tenant_id,customer_phone_or_id,platform' })

    // 8. Send Response via Meta Graph API
    if (tenant.meta_access_token) {
      // Decrypt token before use — stored encrypted at rest in the database
      const accessToken = decrypt(tenant.meta_access_token)
      await sendMetaMessage(
        customerId,
        aiReply,
        platform,
        accessToken,
        tenant.whatsapp_phone_number_id
      )
    } else {
      logger.warn('Webhook: tenant missing meta_access_token — reply not sent', { tenantId: tenant.id })
    }

    return NextResponse.json({ status: 'success' })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Webhook: unhandled error', { error: message })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
