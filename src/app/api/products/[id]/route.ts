import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { validateProduct, formatErrors } from '@/lib/validation'
import { logger } from '@/lib/logger'

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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Products DELETE error', { id, error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()

  const validationErrors = validateProduct({
    name: body.name,
    price: body.price,
    stock: body.stock,
    description: body.description ?? ''
  })
  if (validationErrors.length > 0) {
    return NextResponse.json({ error: formatErrors(validationErrors) }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('products')
      .update({
        name: String(body.name).trim(),
        price: Number(body.price),
        description: body.description ? String(body.description).trim() : null,
        stock: parseInt(body.stock),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Products PATCH error', { id, error: message })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

