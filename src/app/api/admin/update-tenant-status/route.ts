import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const { tenantId, status } = await request.json()
    const adminSecret = request.headers.get('x-admin-secret')

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!tenantId || !status) {
      return NextResponse.json({ error: 'Missing tenantId or status' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()

    const { error } = await supabaseAdmin
      .from('tenants')
      .update({ status })
      .eq('id', tenantId)

    if (error) throw error

    return NextResponse.json({ success: true, message: `Tenant status updated to ${status}` })

  } catch (error: any) {
    console.error('Update Status Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
