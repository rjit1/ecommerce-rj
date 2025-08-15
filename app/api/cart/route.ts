import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { product_id, variant_id, quantity } = await request.json()

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('variant_id', variant_id)
      .single()

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ cartItem: data })
    } else {
      // Add new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id,
          variant_id,
          quantity
        })
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ cartItem: data })
    }
  } catch (error) {
    console.error('Cart API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}