import { Metadata } from 'next'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import LoginForm from '@/components/auth/LoginForm'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Login | RJ4WEAR',
  description: 'Sign in to your RJ4WEAR account to access your orders, wishlist, and more.',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <LoginForm />
      </div>

      <Footer />
    </main>
  )
}