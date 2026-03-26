import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateResponse } from '@/lib/ai/gemini'
import { sendMetaMessage } from '@/lib/meta/api'
import { Message } from '@/lib/types'

/**
 * Meta Webhook Handler with AI Integration
 */

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
  const supabase = createAdminClient()

  try {
    const body = await request.json()
    console.log('--- Incoming Meta Webhook ---')
    console.log('Object Type:', body.object)
    console.log('Full Payload:', JSON.stringify(body, null, 2))

    let customerId = ''
    let incomingText = ''
    let platform: 'whatsapp' | 'instagram' = 'whatsapp'

    // 1. Parse Message (WhatsApp or Instagram)
    if (body.object === 'whatsapp_business_account') {
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
      if (message?.type === 'text') {
        customerId = message.from
        incomingText = message.text.body
        platform = 'whatsapp'
      }
    } else if (body.object === 'page' || body.object === 'instagram') {
      const messaging = body.entry?.[0]?.messaging?.[0]
      if (messaging?.message?.text) {
        customerId = messaging.sender.id
        incomingText = messaging.message.text
        platform = 'instagram'
      }
    }

    if (!customerId || !incomingText) {
      return NextResponse.json({ status: 'ignored' })
    }

    // 2. Identify Tenant (MVP: For now, we use a default tenant)
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, store_name, meta_access_token, whatsapp_phone_number_id, instagram_page_id')
      .eq('status', 'active')
      .limit(1)
      .single()

    if (tenantError || !tenant) {
      console.error('Webhook Error: Tenant not found or inactive', tenantError)
      return NextResponse.json({ error: 'Tenant configuration missing' }, { status: 404 })
    }

    console.log('Processing for Tenant ID:', tenant.id)
    console.log('Store Name:', tenant.store_name)

    // 3. Fetch Products Context
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenant.id)

    // 4. Get/Update Conversation History
    const { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('tenant_id', tenant.id)
      .eq('customer_phone_or_id', customerId)
      .eq('platform', platform)
      .single()

    const history: Message[] = conv?.message_history || []
    
    // 5. Generate AI Response
    const aiReply = await generateResponse(
      incomingText,
      tenant.store_name,
      products || [],
      history
    )

    console.log(`AI Reply for ${customerId}: ${aiReply}`)

    // 6. Update History (Customer Message + AI Reply)
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
        message_history: newHistory
      }, { onConflict: 'tenant_id,customer_phone_or_id,platform' })

    // 7. Send Response via Meta Graph API
    if (tenant.meta_access_token) {
      await sendMetaMessage(
        customerId,
        aiReply,
        platform,
        tenant.meta_access_token,
        tenant.whatsapp_phone_number_id
      )
    } else {
      console.warn('Tenant missing meta_access_token - AI reply generated but not sent.')
    }

    return NextResponse.json({ status: 'success', reply: aiReply })

  } catch (error: any) {
    console.error('Webhook processing error:', error.message)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
