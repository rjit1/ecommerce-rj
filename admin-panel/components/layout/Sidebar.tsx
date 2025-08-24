'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon,
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  GiftIcon,
  PhotoIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '@/app/providers'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: ShoppingBagIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Coupons', href: '/coupons', icon: GiftIcon },
  { name: 'Banners', href: '/banners', icon: PhotoIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

interface SidebarProps {
  isMobileOpen: boolean
  setIsMobileOpen: (open: boolean) => void
}

export default function Sidebar({ isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const { user, adminProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 bg-primary-600">
        <Link href="/dashboard" className="flex items-center">
          <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary-600 font-bold text-sm">RJ</span>
          </div>
          <span className="ml-3 text-white text-lg font-semibold">Admin Panel</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-l-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              onClick={() => setIsMobileOpen(false)}
            >
              <item.icon
                className={`
                  flex-shrink-0 w-5 h-5 mr-3
                  ${isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'}
                `}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {adminProfile?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-200"
        >
          <ArrowRightOnRectangleIcon
            className="flex-shrink-0 w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500"
            aria-hidden="true"
          />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white shadow-lg border-r border-gray-200">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}