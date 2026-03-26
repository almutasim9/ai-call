import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const formData = await request.formData()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const store_name = formData.get('store_name') as string
  const whatsapp_phone_number_id = formData.get('whatsapp_phone_number_id') as string
  const instagram_page_id = formData.get('instagram_page_id') as string
  const meta_access_token = formData.get('meta_access_token') as string

  try {
    const { error } = await supabase
      .from('tenants')
      .update({
        store_name,
        whatsapp_phone_number_id,
        instagram_page_id,
        meta_access_token,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (error) throw error

    // Redirect back to settings with success param or just the page
    return Response.redirect(new URL('/dashboard/settings?status=success', request.url))
  } catch (error: any) {
    console.error('Update settings error:', error.message)
    return Response.redirect(new URL('/dashboard/settings?status=error', request.url))
  }
}
