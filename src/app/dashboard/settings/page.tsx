import { createClient } from '@/lib/supabase/server'
import { Settings, Save, Smartphone, Instagram, Facebook, ShieldCheck, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings & Integrations</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold italic">Configure your Meta connections and store profile.</p>
      </div>

      <form action="/api/dashboard/update-settings" method="POST" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* General Settings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
               <Settings className="text-indigo-600 dark:text-indigo-400" size={24} />
               General Profile
            </h3>
            
            <div className="space-y-4">
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
          </div>

          {/* Security Status */}
          <div className="bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/10 dark:border-emerald-500/10 rounded-3xl p-8 flex flex-col justify-between">
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

        {/* Meta Integration Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Smartphone className="text-indigo-600 dark:text-indigo-400" size={24} />
            Meta API Configuration
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1 flex items-center gap-2">
                  <Smartphone size={14} className="text-emerald-500" />
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
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1 flex items-center gap-2">
                  <Instagram size={14} className="text-rose-500" />
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

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                  Meta Access Token (System User)
                </label>
                <textarea
                  name="meta_access_token"
                  defaultValue={tenant?.meta_access_token}
                  rows={5}
                  placeholder="EAA..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <p className="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
              Careful: These tokens grant access to your messaging. Never share them publicly. 
              Ensure your Vercel URL is added to the "Allowed Domains" in Meta Developer Portal.
            </p>
          </div>
        </div>

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
