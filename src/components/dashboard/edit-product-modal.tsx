'use client'

import { useState } from 'react'
import { Pencil, X, Save, Trash2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  description: string
}

export function EditProductModal({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const updates = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      stock: parseInt(formData.get('stock') as string) || 0,
      description: formData.get('description') as string
    }

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!res.ok) throw new Error('Failed to update product')

      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
    
    setDeleteLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete product')

      setIsOpen(false)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setDeleteLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-bold group"
        title="Edit Product"
      >
        <Pencil size={18} className="group-hover:scale-110 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Edit Product</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mt-0.5">ID: {product.id.split('-')[0]}</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 dark:text-slate-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Product Name
                  </label>
                  <input
                    name="name"
                    defaultValue={product.name}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                      Price ($)
                    </label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={product.price}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                      Stock Level
                    </label>
                    <input
                      name="stock"
                      type="number"
                      defaultValue={product.stock}
                      min="0"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    defaultValue={product.description}
                    rows={4}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 resize-none font-bold"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || deleteLoading}
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Updating...' : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading || deleteLoading}
                  className="w-full px-4 py-3 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                >
                  <Trash2 size={18} className="group-hover:rotate-12 transition-transform" />
                  {deleteLoading ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
