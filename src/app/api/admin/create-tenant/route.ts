import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { validateCreateTenant, formatErrors } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limit'
import { encrypt } from '@/lib/crypto'

export async function POST(request: Request) {
  // Rate limit: 10 tenant creation attempts per hour per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(`create-tenant:${ip}`, 10, 60 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { storeName, email, password, metaAccessToken, whatsappPhoneId, instagramPageId } = await request.json()
    const adminSecret = request.headers.get('x-admin-secret')

    // Basic protection (optional but recommended for Super Admin routes)
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const validationErrors = validateCreateTenant({ storeName, email, password })
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: formatErrors(validationErrors) }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    // 1. Create User in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { store_name: storeName }
    })

    if (authError) throw authError

    const userId = authData.user.id

    // 2. Insert into Tenants table
    const { error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        id: userId,
        store_name: storeName,
        meta_access_token: metaAccessToken ? encrypt(metaAccessToken) : null,
        whatsapp_phone_number_id: whatsappPhoneId,
        instagram_page_id: instagramPageId,
        status: 'active'
      })

    if (tenantError) {
      // Cleanup auth user if tenant row insertion fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw tenantError
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Tenant created successfully',
      tenantId: userId 
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Admin: create tenant failed', { error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
