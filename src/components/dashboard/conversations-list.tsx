'use client'

import { useState } from 'react'
import { Smartphone, Instagram, ExternalLink, MessageSquare, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ConversationModal } from './conversation-modal'

interface Conversation {
  id: string
  customer_phone_or_id: string
  platform: 'whatsapp' | 'instagram'
  message_history: any[]
  updated_at: string
}

export function ConversationsList({ conversations }: { conversations: Conversation[] }) {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)

  return (
    <>
      <div className="grid gap-4">
        {conversations.map((conv) => (
          <div 
            key={conv.id} 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 transition-all group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  conv.platform === 'whatsapp' 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
                }`}>
                  {conv.platform === 'whatsapp' ? <Smartphone size={24} /> : <Instagram size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                     {conv.customer_phone_or_id}
                     <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 tracking-wider font-bold">
                       {conv.platform}
                     </span>
                  </h3>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-bold mt-1">
                    <Calendar size={14} />
                    Last active: {format(new Date(conv.updated_at), 'PPP p')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right mr-4">
                  <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-extrabold mb-1">Status</p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold ring-1 ring-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-Replied
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedConv(conv)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white rounded-xl text-slate-700 dark:text-slate-300 transition-all font-extrabold text-sm shadow-sm group"
                >
                  <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  View History
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedConv && (
        <ConversationModal
          isOpen={!!selectedConv}
          onClose={() => setSelectedConv(null)}
          customer={selectedConv.customer_phone_or_id}
          platform={selectedConv.platform}
          history={selectedConv.message_history}
        />
      )}
    </>
  )
}
