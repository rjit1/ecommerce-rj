import { Metadata } from 'next'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import CartContent from '@/components/cart/CartContent'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Shopping Cart | RJ4WEAR',
  description: 'Review your selected items and proceed to checkout.',
}

export default function CartPage() {
  return (
    <main className="min-h-screen">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <CartContent />
      </div>

      <Footer />
    </main>
  )
}