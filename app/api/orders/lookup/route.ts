import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { email, phone, orderNumber } = await request.json()

    // Validate input
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Either email or phone number is required' },
        { status: 400 }
      )
    }

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Order number is required' },
        { status: 400 }
      )
    }

    // Build query conditions
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products(name, slug),
          variant:product_variants(size, color)
        )
      `)
      .eq('order_number', orderNumber.trim().toUpperCase())

    // Add email or phone condition
    if (email && phone) {
      query = query.or(`customer_email.eq.${email.toLowerCase()},customer_phone.eq.${phone}`)
    } else if (email) {
      query = query.eq('customer_email', email.toLowerCase())
    } else if (phone) {
      query = query.eq('customer_phone', phone)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Order lookup error:', error)
      return NextResponse.json(
        { error: 'Failed to lookup order' },
        { status: 500 }
      )
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'No order found with the provided details' },
        { status: 404 }
      )
    }

    // Return the first matching order (should be unique by order_number)
    const order = orders[0]

    // Remove sensitive information
    const sanitizedOrder = {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      shipping_address_line_1: order.shipping_address_line_1,
      shipping_address_line_2: order.shipping_address_line_2,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      shipping_postal_code: order.shipping_postal_code,
      shipping_country: order.shipping_country,
      subtotal: order.subtotal,
      discount_amount: order.discount_amount,
      applied_delivery_fee: order.applied_delivery_fee,
      total_amount: order.total_amount,
      coupon_code: order.coupon_code,
      coupon_discount: order.coupon_discount,
      created_at: order.created_at,
      updated_at: order.updated_at,
      delivered_at: order.delivered_at,
      order_items: order.order_items
    }

    return NextResponse.json({ 
      success: true, 
      order: sanitizedOrder 
    })

  } catch (error) {
    console.error('Order lookup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}