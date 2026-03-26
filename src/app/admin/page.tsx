import { createAdminClient } from '@/lib/supabase/admin'
import { Users, Store, MessageCircle, Activity, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { TenantActions } from './tenant-actions'

export default async function AdminOverviewPage() {
  const supabase = createAdminClient()

  // Fetch all tenants
  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('Admin Fetch Error:', error)

  const stats = [
    { label: 'Total Tenants', value: tenants?.length || 0, icon: Store, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Active Subscriptions', value: tenants?.filter(t => t.status === 'active').length || 0, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Platform Messages', value: 'Coming soon', icon: MessageCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ]

  return (
    <div className="space-y-8 transition-colors">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Monitor and manage all e-commerce tenants.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-none transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-none transition-all">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 dark:text-slate-200 flex items-center gap-2 text-lg">
            <Users size={20} className="text-indigo-400" />
            Manage Tenants
          </h2>
          <Link 
            href="/admin/create-tenant"
            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            + Onboard New
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Store Name</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Created At</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenants?.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors capitalize">
                        {tenant.store_name}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">{tenant.id.slice(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      tenant.status === 'active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {tenant.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                    {new Date(tenant.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mr-4 font-bold inline-flex items-center gap-1.5">
                      <ExternalLink size={14} /> View
                    </button>
                    <TenantActions tenantId={tenant.id} currentStatus={tenant.status || 'active'} />
                  </td>
                </tr>
              ))}
              {!tenants?.length && (
                <tr>
                   <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                      No tenants onboarded yet.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
