import { createClient } from '@/lib/supabase/server'
import { Store, Package, MessageSquare, TrendingUp, LayoutDashboard } from 'lucide-react'
import { Message } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch current tenant data for connection status
  const { data: { session } } = await supabase.auth.getSession()
  
  // Fetch stats concurrently
  const [tenantRes, productRes, conversationRes, allConversationsRes] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', session?.user?.id).single(),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase.from('conversations').select('message_history')
  ])

  const tenant = tenantRes.data
  const productCount = productRes.count
  const conversationCount = conversationRes.count

  // Count AI messages sent today by scanning message_history JSONB
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const aiMessagesToday = (allConversationsRes.data ?? []).reduce((total, conv) => {
    const messages: Message[] = conv.message_history ?? []
    return total + messages.filter(
      m => m.role === 'ai' && new Date(m.timestamp) >= todayStart
    ).length
  }, 0)

  const stats = [
    { label: 'Total Products', value: productCount || 0, icon: Package, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-600/10' },
    { label: 'Total Conversations', value: conversationCount || 0, icon: MessageSquare, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-600/10' },
    { label: 'AI Messages Today', value: aiMessagesToday, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-600/10' },
  ]

  const connections = [
    { 
      name: 'WhatsApp Business', 
      connected: !!tenant?.whatsapp_phone_number_id && !!tenant?.meta_access_token,
      id: tenant?.whatsapp_phone_number_id || 'Not linked',
      icon: Store
    },
    { 
      name: 'Instagram Messaging', 
      connected: !!tenant?.instagram_page_id && !!tenant?.meta_access_token,
      id: tenant?.instagram_page_id || 'Not linked',
      icon: MessageSquare
    },
    { 
      name: 'Facebook Page', 
      connected: !!tenant?.instagram_page_id && !!tenant?.meta_access_token, // Usually tied to the same Meta setup
      id: tenant?.instagram_page_id || 'Not linked',
      icon: LayoutDashboard
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back, {tenant?.store_name || 'Merchant'}!</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Here is what is happening with your AI Agent today.</p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="text-indigo-600 dark:text-indigo-400" size={24} />
              Connection Status
            </h3>
          </div>
          
          <div className="space-y-4">
            {connections.map((conn) => (
              <div key={conn.name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${conn.connected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    <conn.icon size={20} />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">{conn.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {conn.id}</p>
                  </div>
                </div>
                {conn.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black ring-1 ring-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    CONNECTED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-black ring-1 ring-rose-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    NOT LINKED
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-indigo-600/5 dark:bg-indigo-400/5 border border-indigo-600/10 dark:border-indigo-400/10 rounded-2xl">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold leading-relaxed">
              <span className="block mb-1 font-black uppercase tracking-widest text-[10px]">Important Note:</span>
              If your accounts are not linked, please review the Meta Setup Guide provided by your administrator to integrate your AI Assistant with WhatsApp and Instagram.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 text-amber-500">
            <TrendingUp size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">AI Impact Insights</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-bold">
            We are processing your data to generate conversion insights. Charts will appear here once your agent starts selling products.
          </p>
          <div className="mt-8 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[30%] h-full bg-indigo-600 animate-pulse" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-4 font-black">AI Training Progress: 30%</p>
        </div>
      </div>
    </div>
  )
}
