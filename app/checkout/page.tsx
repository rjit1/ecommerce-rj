import { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/supabase-server'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import CheckoutContent from '@/components/checkout/CheckoutContent'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Checkout | RJ4WEAR',
  description: 'Complete your purchase securely with multiple payment options and fast delivery.',
}

async function getSettings() {
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['cod_fee', 'free_delivery_threshold'])

    if (data) {
      return data.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)
    }
    
    return {}
  } catch (error) {
    console.error('Error fetching settings:', error)
    return {}
  }
}

export default async function CheckoutPage() {
  const settings = await getSettings()

  return (
    <main className="min-h-screen bg-gray-50">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <CheckoutContent settings={settings} />
      </div>

      <Footer />
    </main>
  )
}