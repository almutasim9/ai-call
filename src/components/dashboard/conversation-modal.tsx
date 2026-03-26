'use client'

import { useState } from 'react'
import { X, User, Bot, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface Message {
  role: 'user' | 'model' | 'assistant'
  content: string
  timestamp?: string
}

interface ConversationModalProps {
  customer: string
  platform: string
  history: Message[]
  isOpen: boolean
  onClose: () => void
}

export function ConversationModal({ customer, platform, history, isOpen, onClose }: ConversationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Chat Registry: {customer}
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 tracking-wider">
                {platform}
              </span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-0.5">Complete AI interaction log.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-transparent">
          {history && history.length > 0 ? (
            history.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-center gap-2 mb-1.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'}`}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {msg.role === 'user' ? 'Customer' : 'AI Assistant'}
                  </span>
                </div>
                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm font-bold shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
               <Clock size={40} className="mb-4 opacity-20" />
               <p className="font-bold">No messages recorded in this log.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  )
}
