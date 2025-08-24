'use client'

import { motion } from 'framer-motion'
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/app/providers'

interface HeaderProps {
  title: string
  subtitle?: string
  setIsMobileOpen: (open: boolean) => void
}

export default function Header({ title, subtitle, setIsMobileOpen }: HeaderProps) {
  const { user } = useAuth()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200"
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={() => setIsMobileOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Page title */}
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-danger-400"></span>
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  Welcome back!
                </div>
                <div className="text-xs text-gray-500 truncate max-w-32">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}