import { createClient } from '@/lib/supabase/server'
import { Plus, Package, AlertCircle } from 'lucide-react'
import { AddProductModal } from '@/components/dashboard/add-product-modal'
import { EditProductModal } from '@/components/dashboard/edit-product-modal'
import { cn } from '@/lib/utils'

export default async function ProductsPage() {
  const supabase = await createClient()

  // For MVP, we fetch all products the user has access to via RLS
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('Error fetching products:', error)

  return (
    <div className="space-y-8 transition-colors animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Products Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold italic">Manage the items your AI Agent will sell and track inventory.</p>
        </div>
        <AddProductModal />
      </div>

      {!products || products.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-24 flex flex-col items-center justify-center text-center shadow-sm transition-all group hover:border-indigo-500/30">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform">
            <Package size={40} />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">Empty Catalog</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-bold">
            Add your first product to start letting your AI Agent help customers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/5"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Package size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <EditProductModal product={product} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">
                    {product.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 line-clamp-2 font-bold italic leading-relaxed">
                    {product.description || 'No description provided.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Price</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      ${product.price}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Stock</span>
                    <div className="flex items-center gap-1.5">
                      {product.stock <= 5 && product.stock > 0 && <AlertCircle size={14} className="text-amber-500 animate-pulse" />}
                      <span className={cn(
                        "text-lg font-black",
                        product.stock === 0 ? "text-rose-500" : 
                        product.stock <= 5 ? "text-amber-500" : 
                        "text-emerald-500"
                      )}>
                        {product.stock === 0 ? 'OUT OF STOCK' : product.stock}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
