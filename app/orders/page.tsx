'use client'

import { useState } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { User, Search } from 'lucide-react'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import OrdersList from '@/components/orders/OrdersList'
import OrderLookup from '@/components/orders/OrderLookup'
import Footer from '@/components/layout/Footer'

export default function OrdersPage() {
  const user = useUser()
  const [activeTab, setActiveTab] = useState<'my-orders' | 'track-order'>(
    user ? 'my-orders' : 'track-order'
  )

  return (
    <main className="min-h-screen bg-gray-50">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Orders</h1>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
            {user && (
              <button
                onClick={() => setActiveTab('my-orders')}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                  activeTab === 'my-orders'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5" />
                <span>My Orders</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('track-order')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
                activeTab === 'track-order'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-5 h-5" />
              <span>Track Order</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'my-orders' && user && <OrdersList />}
            {activeTab === 'track-order' && <OrderLookup />}
            {activeTab === 'my-orders' && !user && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <User className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your orders</h3>
                <p className="text-gray-600 mb-6">
                  Access your order history and track your purchases.
                </p>
                <a
                  href="/auth/login?redirect=/orders"
                  className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}