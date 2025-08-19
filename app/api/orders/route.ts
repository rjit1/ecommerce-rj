import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const orderData = await request.json()

    // Validate required fields
    if (!orderData.customer_name || !orderData.customer_email || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate payment method
    if (!['online', 'cod'].includes(orderData.payment_method)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      )
    }

    // Validate shipping address
    if (!orderData.shipping_address_line_1 || !orderData.shipping_city || !orderData.shipping_state || !orderData.shipping_postal_code) {
      return NextResponse.json(
        { error: 'Incomplete shipping address' },
        { status: 400 }
      )
    }

    // Validate order amounts
    if (orderData.total_amount <= 0 || orderData.subtotal <= 0) {
      return NextResponse.json(
        { error: 'Invalid order amounts' },
        { status: 400 }
      )
    }

    // Validate stock availability for all items
    for (const item of orderData.items) {
      if (!item.variant_id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid item data for ${item.product_name}` },
          { status: 400 }
        )
      }

      const { data: variant, error: variantError } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', item.variant_id)
        .single()

      if (variantError || !variant) {
        return NextResponse.json(
          { error: `Product variant not found for ${item.product_name}` },
          { status: 400 }
        )
      }

      if (variant.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.product_name}. Available: ${variant.stock_quantity}, Requested: ${item.quantity}` },
          { status: 400 }
        )
      }
    }

    // Generate order number
    const orderNumber = `RJ${Date.now().toString().slice(-8)}`

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: orderData.user_id || null,
        order_number: orderNumber,
        payment_method: orderData.payment_method,
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        shipping_address_line_1: orderData.shipping_address_line_1,
        shipping_address_line_2: orderData.shipping_address_line_2,
        shipping_city: orderData.shipping_city,
        shipping_state: orderData.shipping_state,
        shipping_postal_code: orderData.shipping_postal_code,
        shipping_country: orderData.shipping_country || 'India',
        subtotal: orderData.subtotal,
        discount_amount: orderData.discount_amount || 0,
        applied_delivery_fee: orderData.applied_delivery_fee || 0,
        total_amount: orderData.total_amount,
        coupon_code: orderData.coupon_code || null,
        coupon_discount: orderData.coupon_discount || 0,
        status: 'pending',
        payment_status: orderData.payment_method === 'cod' ? 'pending' : 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = orderData.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      product_image: item.product_image,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation error:', itemsError)
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      )
    }

    // Update product variant stock
    for (const item of orderData.items) {
      if (item.variant_id) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.variant_id)
          .single()

        if (variant && variant.stock_quantity >= item.quantity) {
          await supabase
            .from('product_variants')
            .update({ 
              stock_quantity: variant.stock_quantity - item.quantity 
            })
            .eq('id', item.variant_id)
        }
      }
    }

    // Update coupon usage if applicable
    if (orderData.coupon_code) {
      // First get the current used_count
      const { data: coupon } = await supabase
        .from('coupons')
        .select('used_count')
        .eq('code', orderData.coupon_code)
        .single()
      
      if (coupon) {
        await supabase
          .from('coupons')
          .update({ 
            used_count: coupon.used_count + 1
          })
          .eq('code', orderData.coupon_code)
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        payment_method: order.payment_method
      }
    })

  } catch (error) {
    console.error('Order API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(name, slug),
          variant:product_variants(size, color)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Orders fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })

  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}