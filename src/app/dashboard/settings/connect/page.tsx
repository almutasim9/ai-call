import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { encrypt } from '@/lib/crypto'
import { Smartphone, Instagram } from 'lucide-react'

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

export default async function ConnectPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const cookieStore = await cookies()
  const raw = cookieStore.get('meta_connect_data')?.value
  if (!raw) redirect('/dashboard/settings?meta_connect=error')

  let phoneNumbers: PhoneNumber[] = []
  let pages: Page[] = []
  let accessToken = ''

  try {
    const decoded = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'))
    phoneNumbers = decoded.phoneNumbers
    pages = decoded.pages
    accessToken = decoded.accessToken
  } catch {
    redirect('/dashboard/settings?meta_connect=error')
  }

  async function saveConnection(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const phoneId = formData.get('phone_id') as string
    const instagramId = formData.get('instagram_id') as string

    await supabase
      .from('tenants')
      .update({
        meta_access_token: encrypt(accessToken),
        whatsapp_phone_number_id: phoneId || null,
        instagram_page_id: instagramId || null,
      })
      .eq('id', session.user.id)

    const { cookies: cookieFn } = await import('next/headers')
    const cookieStore = await cookieFn()
    cookieStore.delete('meta_connect_data')

    redirect('/dashboard/settings?meta_connect=success')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Select Your Channels</h1>
        <p className="text-slate-500 mt-1">We found multiple accounts. Choose which ones to connect.</p>
      </div>

      <form action={saveConnection} className="space-y-6">
        {/* WhatsApp Phone Numbers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-6">
            <Smartphone className="text-emerald-500" size={22} />
            WhatsApp Number
          </h3>
          <div className="space-y-3">
            {phoneNumbers.map((phone) => (
              <label key={phone.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-emerald-500 transition-colors">
                <input type="radio" name="phone_id" value={phone.id} defaultChecked className="accent-emerald-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{phone.display_phone_number}</p>
                  <p className="text-xs text-slate-400">{phone.verified_name} • ID: {phone.id}</p>
                </div>
              </label>
            ))}
            {phoneNumbers.length === 0 && (
              <p className="text-slate-400 text-sm">No WhatsApp numbers found.</p>
            )}
          </div>
        </div>

        {/* Instagram Pages */}
        {pages.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Instagram className="text-rose-500" size={22} />
              Instagram Page
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-rose-400 transition-colors">
                <input type="radio" name="instagram_id" value="" defaultChecked className="accent-rose-500" />
                <span className="text-slate-400 text-sm">None</span>
              </label>
              {pages.map((page) => (
                <label key={page.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-rose-400 transition-colors">
                  <input type="radio" name="instagram_id" value={page.instagram_business_account?.id ?? ''} className="accent-rose-500" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{page.name}</p>
                    <p className="text-xs text-slate-400">
                      {page.instagram_business_account ? `Instagram ID: ${page.instagram_business_account.id}` : 'No Instagram linked'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
        >
          Save Connection
        </button>
      </form>
    </div>
  )
}
