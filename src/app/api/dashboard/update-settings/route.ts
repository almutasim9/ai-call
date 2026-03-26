import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateSettings, formatErrors } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { encrypt } from '@/lib/crypto'

export async function POST(request: Request) {
  const supabase = await createClient()
  const formData = await request.formData()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const store_name = formData.get('store_name')
  const whatsapp_phone_number_id = formData.get('whatsapp_phone_number_id')
  const instagram_page_id = formData.get('instagram_page_id')
  const meta_access_token = formData.get('meta_access_token')

  const validationErrors = validateSettings({ store_name, whatsapp_phone_number_id, instagram_page_id, meta_access_token })
  if (validationErrors.length > 0) {
    return Response.redirect(new URL('/dashboard/settings?status=error', request.url))
  }

  try {
    const { error } = await supabase
      .from('tenants')
      .update({
        store_name: String(store_name).trim(),
        whatsapp_phone_number_id: whatsapp_phone_number_id ? String(whatsapp_phone_number_id).trim() : null,
        instagram_page_id: instagram_page_id ? String(instagram_page_id).trim() : null,
        // Encrypt token before storing — decrypted only when needed (webhook handler)
        meta_access_token: meta_access_token ? encrypt(String(meta_access_token).trim()) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (error) throw error

    return Response.redirect(new URL('/dashboard/settings?status=success', request.url))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Settings update failed', { error: message })
    return Response.redirect(new URL('/dashboard/settings?status=error', request.url))
  }
}
