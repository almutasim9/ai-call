'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Store, ShieldCheck, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      const ADMIN_EMAIL = 'almutasim.abed@gmail.com'
      
      // Check if it's the specific admin or a regular tenant
      if (email === ADMIN_EMAIL) {
         router.push('/admin')
      } else {
         router.push('/dashboard')
      }
      
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors relative overflow-hidden">
      {/* Decorative background for light mode */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent)] dark:hidden -z-10" />
      
      {/* Theme Toggle in Login */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-600/20">
            <Store className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI-Call</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center font-bold">
            Your automated customer service workspace.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl dark:shadow-indigo-500/5 backdrop-blur-xl relative overflow-hidden transition-all">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl opacity-50 rounded-full" />
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Sign in to your account</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold"
                  placeholder="name@store.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-700 font-bold"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl px-6 py-4 transition-all shadow-lg shadow-indigo-600/20 mt-4 active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700/50">
                <ShieldCheck size={14} className="text-slate-400 dark:text-slate-500" />
                <span className="text-xs text-slate-400 dark:text-slate-500 font-extrabold tracking-tight">
                  Secure Enterprise-grade Auth
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-600 text-xs">
          Forgot password? Please contact your platform administrator.
        </p>
      </div>
    </div>
  )
}
