import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// Create Razorpay order
export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt, notes } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      }
    })

  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}

// Verify Razorpay payment
export async function PUT(request: NextRequest) {
  try {
    const { supabaseAdmin } = await import('@/lib/supabase-server')
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      order_id 
    } = await request.json()

    console.log('Payment verification request:', {
      razorpay_order_id,
      razorpay_payment_id,
      order_id: order_id?.substring(0, 8) + '...' // Log partial ID for security
    })

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }

    // First, verify the order exists and is in pending status
    const { data: existingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, payment_status, status, total_amount')
      .eq('id', order_id)
      .single()

    if (fetchError || !existingOrder) {
      console.error('Order lookup error:', fetchError, 'Order ID:', order_id)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log('Found order:', {
      id: existingOrder.id,
      order_number: existingOrder.order_number,
      payment_status: existingOrder.payment_status
    })

    // Check if payment is already processed
    if (existingOrder.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        order: existingOrder
      })
    }

    // Update order with payment details and confirm the order
    const { data: updatedOrders, error } = await supabaseAdmin
      .from('orders')
      .update({
        razorpay_order_id,
        razorpay_payment_id,
        payment_status: 'paid',
        status: 'confirmed', // Automatically confirm online paid orders
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()

    if (error) {
      console.error('Order update error:', error)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Check if the update was successful
    if (!updatedOrders || updatedOrders.length === 0) {
      console.error('Order update failed: No rows affected')
      return NextResponse.json(
        { error: 'Order not found or update failed' },
        { status: 404 }
      )
    }

    const order = updatedOrders[0]

    // Log successful payment for audit
    console.log(`Payment verified successfully for order ${order.order_number}:`, {
      razorpay_order_id,
      razorpay_payment_id,
      amount: order.total_amount
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order: {
        id: order.id,
        order_number: order.order_number,
        payment_status: order.payment_status,
        status: order.status,
        total_amount: order.total_amount
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}