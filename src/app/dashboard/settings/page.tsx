import { createClient } from '@/lib/supabase/server'
import { Settings, Save, Smartphone, Instagram, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Facebook } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ status?: string; meta_connect?: string }> }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const params = await searchParams
  const metaConnect = params.meta_connect
  const saveStatus = params.status

  const isWhatsAppConnected = !!tenant?.whatsapp_phone_number_id && !!tenant?.meta_access_token
  const isInstagramConnected = !!tenant?.instagram_page_id && !!tenant?.meta_access_token

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings & Integrations</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold italic">Configure your Meta connections and store profile.</p>
      </div>

      {/* OAuth Status Messages */}
      {metaConnect === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={20} />
          <span className="font-bold">Meta account connected successfully!</span>
        </div>
      )}
      {metaConnect === 'denied' && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
          <AlertCircle size={20} />
          <span className="font-bold">Connection cancelled. You can try again anytime.</span>
        </div>
      )}
      {metaConnect === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
          <XCircle size={20} />
          <span className="font-bold">Something went wrong. Please try again.</span>
        </div>
      )}
      {metaConnect === 'misconfigured' && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
          <XCircle size={20} />
          <span className="font-bold">META_APP_ID is not configured. Contact your administrator.</span>
        </div>
      )}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={20} />
          <span className="font-bold">Settings saved successfully.</span>
        </div>
      )}

      {/* Connect with Meta Button */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Facebook className="text-blue-500" size={24} />
              Connect with Meta
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              Connect your Facebook account to automatically link your WhatsApp Business number and Instagram page.
            </p>
          </div>
          <a
            href="/api/auth/meta"
            className="shrink-0 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-600/20"
          >
            <Facebook size={18} />
            {isWhatsAppConnected ? 'Reconnect Meta' : 'Connect Meta'}
          </a>
        </div>

        {/* Connection Status */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isWhatsAppConnected ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
            <Smartphone size={20} className={isWhatsAppConnected ? 'text-emerald-500' : 'text-slate-400'} />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">WhatsApp</p>
              {isWhatsAppConnected ? (
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {tenant?.whatsapp_phone_number_id}
                </p>
              ) : (
                <p className="font-bold text-slate-400 text-sm">Not connected</p>
              )}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isInstagramConnected ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
            <Instagram size={20} className={isInstagramConnected ? 'text-rose-500' : 'text-slate-400'} />
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Instagram</p>
              {isInstagramConnected ? (
                <p className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {tenant?.instagram_page_id}
                </p>
              ) : (
                <p className="font-bold text-slate-400 text-sm">Not connected</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <form action="/api/dashboard/update-settings" method="POST" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
               <Settings className="text-indigo-600 dark:text-indigo-400" size={24} />
               General Profile
            </h3>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                Store Display Name
              </label>
              <input
                name="store_name"
                defaultValue={tenant?.store_name}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
              />
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-2">
                 <ShieldCheck size={24} />
                 Account Security
              </h3>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 font-bold leading-relaxed mb-4">
                Your account is currently protected by Row Level Security (RLS). Only you can see and manage your store's data.
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/20">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Status</span>
               <span className="text-emerald-500 font-black text-lg">VERIFIED MERCHANT</span>
            </div>
          </div>
        </div>

        {/* Manual Meta Configuration (advanced) */}
        <details className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <summary className="p-8 cursor-pointer font-black text-slate-900 dark:text-white flex items-center gap-2 select-none">
            <Smartphone className="text-indigo-600 dark:text-indigo-400" size={24} />
            Manual Meta Configuration
            <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-wider">Advanced</span>
          </summary>

          <div className="px-8 pb-8 space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
            <p className="text-sm text-slate-500">Use this if you prefer to enter credentials manually instead of using the Connect button above.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    WhatsApp Phone Number ID
                  </label>
                  <input
                    name="whatsapp_phone_number_id"
                    defaultValue={tenant?.whatsapp_phone_number_id}
                    placeholder="e.g. 1085538854636560"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Instagram Page ID
                  </label>
                  <input
                    name="instagram_page_id"
                    defaultValue={tenant?.instagram_page_id}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                  Meta Access Token
                </label>
                <textarea
                  name="meta_access_token"
                  rows={5}
                  placeholder="EAA..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-mono text-sm"
                />
                <p className="text-xs text-slate-400 mt-1 ml-1">Leave empty to keep existing token.</p>
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                Careful: These tokens grant access to your messaging. Never share them publicly.
              </p>
            </div>
          </div>
        </details>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 group"
          >
            <Save size={20} className="group-hover:scale-110 transition-transform" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  )
}
