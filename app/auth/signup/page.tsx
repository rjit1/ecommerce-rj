import { Metadata } from 'next'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import SignupForm from '@/components/auth/SignupForm'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Sign Up | RJ4WEAR',
  description: 'Create your RJ4WEAR account to access exclusive deals, track orders, and more.',
}

export default function SignupPage() {
  return (
    <main className="min-h-screen">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <SignupForm />
      </div>

      <Footer />
    </main>
  )
}