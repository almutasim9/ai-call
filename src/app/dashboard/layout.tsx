import Link from 'next/link'
import { LayoutDashboard, Package, MessageSquare, LogOut, Store } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sidebar } from '@/components/dashboard/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex transition-colors">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 bg-white/70 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400 group flex items-center gap-2">
            Status: <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
            <span className="text-emerald-600 dark:text-emerald-400">AI Active</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
               <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">JS</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  )
}
