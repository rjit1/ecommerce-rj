'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Menu, X, User, LogOut, Package } from 'lucide-react'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { useCartSidebar } from '@/contexts/CartContext'
import { debounce, formatCurrency, getImageUrl } from '@/utils/helpers'
import toast from 'react-hot-toast'

interface SearchSuggestion {
  type: 'product' | 'category'
  id: string
  name: string
  slug: string
  price?: number
  originalPrice?: number
  category?: string
  image?: string
  hasDiscount?: boolean
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const router = useRouter()
  const user = useUser()
  const supabase = useSupabaseClient()
  const { totalQuantity } = useCart()
  const { openCart } = useCartSidebar()
  
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Navigation links
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products?featured=true', label: 'Popular Products' },
    { href: '/products?hot_sale=true', label: 'Hot Sale' },
    { href: '/orders', label: 'My Orders' },
  ]

  // Enhanced search functionality
  const searchProducts = async (query: string) => {
    if (!query.trim()) {
      setSearchSuggestions([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.suggestions) {
        setSearchSuggestions(data.suggestions)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchSuggestions([])
    } finally {
      setIsSearching(false)
    }
  }

  const debouncedSearch = useCallback(debounce(searchProducts, 300), [])

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery)
      setShowSuggestions(true)
    } else {
      setSearchSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery, debouncedSearch])

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSuggestions(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.slug}`)
    } else {
      router.push(`/products?category=${suggestion.slug}`)
    }
    setSearchQuery('')
    setShowSuggestions(false)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logged out successfully')
      router.push('/')
    } catch (error) {
      toast.error('Error logging out')
    }
    setShowUserMenu(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RJ</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RJ4WEAR</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="spinner" />
                  </div>
                )}
              </div>
            </form>

            {/* Enhanced Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && searchSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50"
                >
                  <div className="p-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={`${suggestion.type}-${suggestion.id}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors duration-200"
                      >
                        {/* Product/Category Image */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {suggestion.image ? (
                            <Image
                              src={getImageUrl(suggestion.image)}
                              alt={suggestion.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className={`w-3 h-3 rounded-full ${
                                suggestion.type === 'product' ? 'bg-primary-500' : 'bg-accent-500'
                              }`} />
                            </div>
                          )}
                        </div>

                        {/* Product/Category Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {suggestion.name}
                          </p>
                          
                          {suggestion.type === 'product' ? (
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center space-x-1">
                                {suggestion.hasDiscount && suggestion.originalPrice ? (
                                  <>
                                    <span className="text-sm font-semibold text-primary-600">
                                      {formatCurrency(suggestion.price!)}
                                    </span>
                                    <span className="text-xs text-gray-500 line-through">
                                      {formatCurrency(suggestion.originalPrice)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(suggestion.price!)}
                                  </span>
                                )}
                              </div>
                              {suggestion.category && (
                                <span className="text-xs text-gray-500">
                                  in {suggestion.category}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">
                              Category
                            </p>
                          )}
                        </div>

                        {/* Type Badge */}
                        <div className="flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            suggestion.type === 'product' 
                              ? 'bg-primary-100 text-primary-600' 
                              : 'bg-accent-100 text-accent-600'
                          }`}>
                            {suggestion.type === 'product' ? 'Product' : 'Category'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* View All Results */}
                  <div className="border-t border-gray-200 p-2">
                    <button
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
                        setSearchQuery('')
                        setShowSuggestions(false)
                      }}
                      className="w-full p-2 text-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Search Icon - Mobile */}
            <button className="md:hidden p-2 text-gray-700 hover:text-primary-600">
              <Search className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
              )}

              {/* User Dropdown */}
              <AnimatePresence>
                {showUserMenu && user && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                  >
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {totalQuantity > 99 ? '99+' : totalQuantity}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search products, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-2 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}