import Link from 'next/link'
import { LayoutDashboard, Users, UserPlus, LogOut, ShieldCheck } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex transition-colors">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col fixed inset-y-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            AI-Call Admin
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group"
          >
            <LayoutDashboard size={20} className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-bold transition-colors" />
            <span className="font-bold text-sm">Platform Overview</span>
          </Link>
          <Link
            href="/admin/create-tenant"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white group"
          >
            <UserPlus size={20} className="group-hover:text-amber-600 dark:group-hover:text-amber-400 font-bold transition-colors" />
            <span className="font-bold text-sm">Onboard Tenant</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Link 
            href="/"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-sm font-bold"
          >
            <LogOut size={20} />
            <span>Exit Admin</span>
          </Link>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 ml-64 flex flex-col">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            System Status: <span className="text-emerald-600 dark:text-emerald-400">Operational</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">Super Admin Mode</span>
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                 <ShieldCheck size={18} className="text-indigo-600 dark:text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
}
