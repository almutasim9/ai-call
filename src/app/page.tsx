import Link from 'next/link'
import { Store, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  const features = [
    { title: 'AI Automation', desc: 'Auto-reply to WhatsApp & Instagram messages 24/7.', icon: Zap },
    { title: 'Multi-Tenant', desc: 'Manage unlimited stores from a single backend.', icon: Store },
    { title: 'RLS Security', desc: 'Strict data isolation powered by Supabase RLS.', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 transition-colors">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
         <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Store className="text-white w-5 h-5" />
               </div>
               <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">AI-Call</span>
            </div>
            <div className="flex items-center gap-4">
               <ThemeToggle />
               <Link href="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors">Sign In</Link>
            </div>
         </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-indigo-600/10 dark:bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-5xl mx-auto text-center mt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6 tracking-wide animate-pulse">
            <Zap size={14} /> 
            NOW IN PRIVATE BETA
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-6 text-slate-900 dark:text-white">
            AI Sales Agents for <br />
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:via-white dark:to-indigo-400 bg-clip-text text-transparent italic">
               Modern E-commerce
            </span>
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-bold">
            Automate your customer service on WhatsApp and Instagram with AI that knows your products, prices, and tone of voice.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 group text-lg shadow-xl shadow-indigo-600/20"
            >
              Get Started 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/admin"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-lg shadow-sm"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="py-20 px-6 border-t border-slate-100 dark:border-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-900 rounded-3xl hover:border-indigo-500/50 transition-all group shadow-sm">
              <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <f.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-500 leading-relaxed text-sm font-bold">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-900 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 text-slate-400 dark:text-slate-600">
           <Store size={16} />
           <span className="font-bold tracking-tight">AI-Call</span>
        </div>
        <p className="text-xs font-bold text-slate-400 dark:text-slate-600">© 2026 AI-Call Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}
