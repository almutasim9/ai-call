import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  try {
    const { error } = await supabase
      .from('products')
      .update({
        name: body.name,
        price: body.price,
        description: body.description,
        stock: body.stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Supabase Patch Error:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PATCH error:', error)
    return NextResponse.json({ 
      error: error.message,
      suggestion: 'Please ensure you have run the matching SQL migration for the products table.'
    }, { status: 500 })
  }
}

