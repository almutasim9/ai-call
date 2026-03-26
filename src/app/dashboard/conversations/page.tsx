import { createClient } from '@/lib/supabase/server'
import { MessageSquare } from 'lucide-react'
import { ConversationsList } from '@/components/dashboard/conversations-list'

export default async function ConversationsPage() {
  const supabase = await createClient()
  
  // Get current session to fetch only this tenant's conversations
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 font-bold">Please sign in to view conversations.</p>
      </div>
    )
  }

  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('tenant_id', session.user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl font-bold">
        Error loading conversations: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Conversations History</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold">Monitor all AI-driven chats across WhatsApp and Instagram.</p>
      </div>

      {!conversations || conversations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-400 dark:text-slate-500">
            <MessageSquare size={40} />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">No Conversations Yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-bold">
            Once a customer sends a message to your WhatsApp or Instagram, it will appear here.
          </p>
        </div>
      ) : (
        <ConversationsList conversations={conversations as any} />
      )}
    </div>
  )
}

