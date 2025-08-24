'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '@/app/providers'

interface MainLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export default function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const router = useRouter()
  const { user, adminProfile, loading } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || !adminProfile)) {
      router.push('/login')
    }
  }, [user, adminProfile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="spinner w-6 h-6"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user || !adminProfile) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          title={title} 
          subtitle={subtitle}
          setIsMobileOpen={setIsMobileOpen}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}