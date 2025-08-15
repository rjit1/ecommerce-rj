import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import ProfileContent from '@/components/profile/ProfileContent'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'My Profile | RJ4WEAR',
  description: 'Manage your RJ4WEAR account, personal information, and preferences.',
}

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <ProfileContent user={user} profile={profile} />
      </div>

      <Footer />
    </main>
  )
}