'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTenantStatus(tenantId: string, status: 'active' | 'suspended') {
  // Verify caller is the admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || !user || user.email !== adminEmail) {
    throw new Error('Unauthorized')
  }

  if (!tenantId || !['active', 'suspended'].includes(status)) {
    throw new Error('Invalid arguments')
  }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from('tenants')
    .update({ status })
    .eq('id', tenantId)

  if (error) throw error

  revalidatePath('/admin')
}
