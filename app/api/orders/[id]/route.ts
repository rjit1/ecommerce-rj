import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createSupabaseServerClient } from '@/lib/supabase-server'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Use admin client for database access
    
    // Also create a regular client to check if user is authenticated
    const supabase = createSupabaseServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch order with detailed information
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(name, slug),
          variant:product_variants(size, color)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      )
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    // User can access the order if:
    // 1. They are authenticated and it's their order (user_id matches)
    // 2. It's a guest order (user_id is null) - guest orders are accessible to anyone with the link
    const canAccess = (user && order.user_id === user.id) || order.user_id === null

    if (!canAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access to this order' },
        { status: 403 }
      )
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}