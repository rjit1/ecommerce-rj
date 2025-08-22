'use client'

import { useState, useEffect } from 'react'
import { Search, Package, AlertCircle, List } from 'lucide-react'
import { motion } from 'framer-motion'
import { Order } from '@/types'
import OrderDetails from './OrderDetails'
import OrdersList from './OrdersList'

interface OrderLookupProps {
  initialContactInfo?: {
    email?: string
    phone?: string
  }
}

export default function OrderLookup({ initialContactInfo }: OrderLookupProps) {
  const [formData, setFormData] = useState({
    email: initialContactInfo?.email || '',
    phone: initialContactInfo?.phone || '',
    orderNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [isMultiple, setIsMultiple] = useState(false)
  const [lookupMode, setLookupMode] = useState<'single' | 'all'>(() => {
    // If initial contact info is provided, default to 'all' mode
    return (initialContactInfo?.email || initialContactInfo?.phone) ? 'all' : 'single'
  })
  const [autoSearchTriggered, setAutoSearchTriggered] = useState(false)

  // Auto-search function
  const performAutoSearch = async () => {
    if (!formData.email.trim() && !formData.phone.trim()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const requestBody = {
        email: formData.email.trim(),
        phone: formData.phone.trim()
      }

      const response = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.isMultiple) {
          setOrders(data.orders)
          setIsMultiple(true)
          setOrder(null)
        } else {
          setOrder(data.order)
          setOrders([])
          setIsMultiple(false)
        }
      } else {
        setError(data.error || 'Failed to find order(s)')
      }
    } catch (error) {
      console.error('Auto order lookup error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-search when initial contact info is provided
  useEffect(() => {
    if ((initialContactInfo?.email || initialContactInfo?.phone) && !autoSearchTriggered) {
      setAutoSearchTriggered(true)
      // Trigger search after a brief delay to ensure the component is fully mounted
      setTimeout(() => {
        performAutoSearch()
      }, 500)
    }
  }, [initialContactInfo, autoSearchTriggered, formData.email, formData.phone])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (lookupMode === 'single' && !formData.orderNumber.trim()) {
      setError('Order number is required for single order lookup')
      return
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      setError('Please provide either email address or phone number')
      return
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError('')

    try {
      const requestBody: any = {
        email: formData.email.trim(),
        phone: formData.phone.trim()
      }

      // Only include order number for single lookup mode
      if (lookupMode === 'single' && formData.orderNumber.trim()) {
        requestBody.orderNumber = formData.orderNumber.trim()
      }

      const response = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.isMultiple) {
          setOrders(data.orders)
          setIsMultiple(true)
          setOrder(null)
        } else {
          setOrder(data.order)
          setOrders([])
          setIsMultiple(false)
        }
      } else {
        setError(data.error || 'Failed to find order(s)')
      }
    } catch (error) {
      console.error('Order lookup error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({ 
      email: initialContactInfo?.email || '', 
      phone: initialContactInfo?.phone || '', 
      orderNumber: '' 
    })
    setOrder(null)
    setOrders([])
    setIsMultiple(false)
    setError('')
  }

  if (order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
          <button
            onClick={handleReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Search Another Order
          </button>
        </div>
        <OrderDetails order={order} />
      </div>
    )
  }

  if (isMultiple && orders.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Orders ({orders.length} {orders.length === 1 ? 'order' : 'orders'} found)
          </h2>
          <button
            onClick={handleReset}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            New Search
          </button>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Orders Found</h3>
              <p className="text-sm text-blue-700 mt-1">
                Showing all orders associated with your contact information.
              </p>
            </div>
          </div>
        </div>
        <OrdersList orders={orders} hideAuth={true} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Orders</h2>
        <p className="text-gray-600">
          Search for a specific order or view all your orders
        </p>
      </div>

      {/* Lookup Mode Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          type="button"
          onClick={() => setLookupMode('single')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
            lookupMode === 'single'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Find Specific Order</span>
        </button>
        <button
          type="button"
          onClick={() => setLookupMode('all')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
            lookupMode === 'all'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <List className="w-4 h-4" />
          <span>View All Orders</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {lookupMode === 'single' && (
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Order Number *
            </label>
            <input
              type="text"
              id="orderNumber"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
              placeholder="e.g., RJ20241201001"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              required
            />
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">
            Contact Information (provide at least one) *
          </p>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            />
          </div>

          <div className="text-center text-sm text-gray-500">
            OR
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
            />
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Searching...</span>
            </>
          ) : (
            <>
              {lookupMode === 'single' ? <Search className="w-5 h-5" /> : <List className="w-5 h-5" />}
              <span>{lookupMode === 'single' ? 'Find My Order' : 'View All My Orders'}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
        <p className="text-sm text-gray-600 mb-2">
          Can't find your order? Make sure you're using the correct order number and contact information.
        </p>
        <p className="text-sm text-gray-600">
          For further assistance, contact us at{' '}
          <a href="mailto:support@rj4wear.com" className="text-primary-600 hover:text-primary-700">
            support@rj4wear.com
          </a>
        </p>
      </div>
    </motion.div>
  )
}