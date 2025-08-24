'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { Order, OrderFilters } from '@/types'
import { formatCurrency, formatDate, debounce } from '@/utils/helpers'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const statusConfig = {
    pending: { class: 'status-badge-pending', text: 'Pending' },
    confirmed: { class: 'status-badge-confirmed', text: 'Confirmed' },
    processing: { class: 'status-badge-processing', text: 'Processing' },
    shipped: { class: 'status-badge-shipped', text: 'Shipped' },
    delivered: { class: 'status-badge-delivered', text: 'Delivered' },
    cancelled: { class: 'status-badge-cancelled', text: 'Cancelled' },
  }

  const config = statusConfig[status]
  return <span className={config.class}>{config.text}</span>
}

const PaymentMethodBadge = ({ method }: { method: Order['payment_method'] }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    method === 'online' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-gray-100 text-gray-800'
  }`}>
    {method === 'online' ? 'Online' : 'COD'}
  </span>
)

const PaymentStatusBadge = ({ status }: { status: Order['payment_status'] }) => {
  const statusConfig = {
    pending: { class: 'bg-warning-100 text-warning-800', text: 'Pending' },
    paid: { class: 'bg-success-100 text-success-800', text: 'Paid' },
    failed: { class: 'bg-danger-100 text-danger-800', text: 'Failed' },
    refunded: { class: 'bg-purple-100 text-purple-800', text: 'Refunded' },
  }

  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
      {config.text}
    </span>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<OrderFilters>({
    status: undefined,
    payment_method: undefined,
    payment_status: undefined,
    search: '',
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchOrders()
  }, [currentPage, filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `, { count: 'exact' })
      
      // Apply filters
      if (filters.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%`)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.payment_method) {
        query = query.eq('payment_method', filters.payment_method)
      }
      
      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status)
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'amount_high':
          query = query.order('total_amount', { ascending: false })
          break
        case 'amount_low':
          query = query.order('total_amount', { ascending: true })
          break
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setOrders(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      const updateData: any = { status: newStatus }
      
      // Set delivered_at when status is delivered
      if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error

      toast.success(`Order status updated to ${newStatus}`)
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const debouncedSearch = debounce((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setCurrentPage(1)
  }, 500)

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <MainLayout title="Orders" subtitle="Manage customer orders">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 pr-4 py-2 w-64"
              placeholder="Search orders..."
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-input pr-8"
            value={filters.status || ''}
            onChange={(e) => {
              setFilters(prev => ({ 
                ...prev, 
                status: e.target.value as Order['status'] || undefined 
              }))
              setCurrentPage(1)
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Method Filter */}
          <select
            className="form-input pr-8"
            value={filters.payment_method || ''}
            onChange={(e) => {
              setFilters(prev => ({ 
                ...prev, 
                payment_method: e.target.value as Order['payment_method'] || undefined 
              }))
              setCurrentPage(1)
            }}
          >
            <option value="">All Methods</option>
            <option value="online">Online</option>
            <option value="cod">COD</option>
          </select>

          {/* Sort */}
          <select
            className="form-input pr-8"
            value={filters.sortBy}
            onChange={(e) => {
              setFilters(prev => ({ 
                ...prev, 
                sortBy: e.target.value as OrderFilters['sortBy']
              }))
              setCurrentPage(1)
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount_high">Amount High-Low</option>
            <option value="amount_low">Amount Low-High</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}>
                        <div className="pulse-bg h-6 w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          #{order.order_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.id.split('-')[0]}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {order.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-900">
                        {order.order_items?.length || 0} items
                      </span>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <PaymentMethodBadge method={order.payment_method} />
                        <PaymentStatusBadge status={order.payment_status} />
                      </div>
                    </td>
                    <td>
                      {order.status === 'pending' || order.status === 'confirmed' ? (
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value as Order['status'])}
                          className="text-xs border-0 bg-transparent cursor-pointer focus:ring-2 focus:ring-primary-500 rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <OrderStatusBadge status={order.status} />
                      )}
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="text-xs text-success-600">
                            -{formatCurrency(order.discount_amount)}
                          </div>
                        )}
                        {order.applied_delivery_fee > 0 && (
                          <div className="text-xs text-gray-500">
                            +{formatCurrency(order.applied_delivery_fee)} delivery
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td>
                      <Link
                        href={`/orders/${order.id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                        title="View order details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="text-gray-500">
                      No orders found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
                {totalCount} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, currentPage - 2) + i
                  if (pageNumber > totalPages) return null
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === pageNumber
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  )
}