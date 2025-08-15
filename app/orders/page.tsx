'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@supabase/auth-helpers-react'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import OrdersList from '@/components/orders/OrdersList'
import Footer from '@/components/layout/Footer'

export default function OrdersPage() {
  const user = useUser()
  const router = useRouter()
  
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/orders')
    }
  }, [user, router])

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>
          <OrdersList />
        </div>
      </div>

      <Footer />
    </main>
  )
}