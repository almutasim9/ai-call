'use client'

import { useState } from 'react'

export default function CreateTenantPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const form = e.currentTarget
    const formData = new FormData(form)
    const storeName = formData.get('storeName')
    const email = formData.get('email')
    const password = formData.get('password')
    const metaAccessToken = formData.get('metaAccessToken')
    const whatsappPhoneId = formData.get('whatsappPhoneId')
    const instagramPageId = formData.get('instagramPageId')
    const adminSecret = formData.get('adminSecret')

    try {
      const res = await fetch('/api/admin/create-tenant', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret as string
        },
        body: JSON.stringify({ 
          storeName, email, password, 
          metaAccessToken, whatsappPhoneId, instagramPageId 
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      setMessage({ type: 'success', text: 'Tenant created successfully!' })
      form.reset()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Onboard New Tenant</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Create a new store account and generate their credentials.</p>
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                Store Name
              </label>
              <input
                name="storeName"
                type="text"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold"
                placeholder="e.g. Urban Threads"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                Owner Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold"
                placeholder="owner@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
              Initial Password
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300">Meta Graph API Configuration</h3>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                Meta Access Token
              </label>
              <input
                name="metaAccessToken"
                type="password"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-mono text-xs"
                placeholder="EAA..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                  WhatsApp Phone ID
                </label>
                <input
                  name="whatsappPhoneId"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold"
                  placeholder="123456789..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                  Instagram Page ID
                </label>
                <input
                  name="instagramPageId"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold"
                  placeholder="987654321..."
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
              Admin Secret Key
            </label>
            <input
              name="adminSecret"
              type="password"
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 italic font-bold"
              placeholder="Enter Super Admin Secret"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl px-6 py-4 transition-all shadow-lg shadow-indigo-500/20 mt-4 active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Tenant Account'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
