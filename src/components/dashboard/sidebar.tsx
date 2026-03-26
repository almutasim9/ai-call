'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, MessageSquare, LogOut, Store, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      activeColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-600/10',
      borderColor: 'border-indigo-600/20'
    },
    {
      href: '/dashboard/products',
      label: 'Products',
      icon: Package,
      activeColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-600/10',
      borderColor: 'border-rose-600/20'
    },
    {
      href: '/dashboard/conversations',
      label: 'Conversations',
      icon: MessageSquare,
      activeColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-600/10',
      borderColor: 'border-emerald-600/20'
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      activeColor: 'text-slate-900 dark:text-white',
      bgColor: 'bg-slate-200 dark:bg-slate-800',
      borderColor: 'border-slate-300 dark:border-slate-700'
    }
  ]

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 flex flex-col transition-colors">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
          <Store className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent transition-colors">
          AI-Call
        </span>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold group",
                isActive 
                  ? `${item.bgColor} ${item.activeColor} border ${item.borderColor}`
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent"
              )}
            >
              <Icon 
                size={20} 
                className={cn(
                  "transition-colors",
                  isActive ? item.activeColor : "group-hover:text-slate-900 dark:group-hover:text-white"
                )} 
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-500/10 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all text-sm font-bold border border-transparent hover:border-rose-500/20 group">
          <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
