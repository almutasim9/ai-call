import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { storeName, email, password, metaAccessToken, whatsappPhoneId, instagramPageId } = await request.json()
    const adminSecret = request.headers.get('x-admin-secret')

    // Basic protection (optional but recommended for Super Admin routes)
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!storeName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
        meta_access_token: metaAccessToken,
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

  } catch (error: any) {
    console.error('Create Tenant Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
