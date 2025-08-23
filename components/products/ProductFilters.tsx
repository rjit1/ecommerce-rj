'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category } from '@/types'

interface ProductFiltersProps {
  categories: Category[]
  searchParams: Record<string, string | undefined>
}

export default function ProductFilters({ categories, searchParams }: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [priceRange, setPriceRange] = useState({
    min: searchParams.minPrice || '',
    max: searchParams.maxPrice || ''
  })
  const [expandedSections, setExpandedSections] = useState({
    special: true,
    categories: true,
    price: true,
    quickPrice: true
  })
  
  const router = useRouter()
  const urlSearchParams = useSearchParams()

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryFilter = (categorySlug: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    
    if (searchParams.category === categorySlug) {
      params.delete('category')
    } else {
      params.set('category', categorySlug)
    }
    
    params.delete('page') // Reset to first page
    router.push(`/products?${params.toString()}`)
  }

  const handlePriceFilter = () => {
    const params = new URLSearchParams(urlSearchParams.toString())
    
    if (priceRange.min) {
      params.set('minPrice', priceRange.min)
    } else {
      params.delete('minPrice')
    }
    
    if (priceRange.max) {
      params.set('maxPrice', priceRange.max)
    } else {
      params.delete('maxPrice')
    }
    
    params.delete('page') // Reset to first page
    router.push(`/products?${params.toString()}`)
  }

  const handleSpecialFilter = (filterType: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    
    // Clear other special filters
    params.delete('featured')
    params.delete('trending')
    params.delete('hot_sale')
    
    // Set the selected filter
    if (searchParams[filterType] !== 'true') {
      params.set(filterType, 'true')
    }
    
    params.delete('page') // Reset to first page
    router.push(`/products?${params.toString()}`)
  }

  const clearAllFilters = () => {
    router.push('/products')
  }

  const hasActiveFilters = Object.keys(searchParams).some(key => 
    ['category', 'minPrice', 'maxPrice', 'featured', 'trending', 'hot_sale'].includes(key)
  )

  const FilterSection = ({ title, isExpanded, onToggle, children, showToggle = true }: {
    title: string
    isExpanded: boolean
    onToggle: () => void
    children: React.ReactNode
    showToggle?: boolean
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 px-1 rounded-lg transition-colors duration-200"
        disabled={!showToggle}
      >
        <h4 className="font-semibold text-gray-900 text-base">{title}</h4>
        {showToggle && (
          isExpanded ? 
            <ChevronUp className="w-4 h-4 text-gray-500" /> : 
            <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const FilterContent = () => (
    <div className="space-y-0">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center mb-6 px-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900">Active Filters</h3>
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
              {Object.keys(searchParams).filter(key => 
                ['category', 'minPrice', 'maxPrice', 'featured', 'trending', 'hot_sale'].includes(key)
              ).length}
            </span>
          </div>
          <button
            onClick={clearAllFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Special Collections */}
      <FilterSection 
        title="Special Collections" 
        isExpanded={expandedSections.special}
        onToggle={() => toggleSection('special')}
      >
        <div className="space-y-3">
          {[
            { key: 'featured', label: 'Featured Products', icon: '⭐' },
            { key: 'trending', label: 'Trending Now', icon: '📈' },
            { key: 'hot_sale', label: 'Hot Sale', icon: '🔥' }
          ].map(filter => (
            <label key={filter.key} className="flex items-center group cursor-pointer">
              <input
                type="checkbox"
                checked={searchParams[filter.key] === 'true'}
                onChange={() => handleSpecialFilter(filter.key)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
              />
              <div className="ml-3 flex items-center space-x-2">
                <span className="text-base">{filter.icon}</span>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                  {filter.label}
                </span>
              </div>
              {searchParams[filter.key] === 'true' && (
                <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      {categories.length > 0 && (
        <FilterSection 
          title="Categories" 
          isExpanded={expandedSections.categories}
          onToggle={() => toggleSection('categories')}
        >
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
            {categories.map(category => (
              <label key={category.id} className="flex items-center group cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchParams.category === category.slug}
                  onChange={() => handleCategoryFilter(category.slug)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                  {category.name}
                </span>
                {searchParams.category === category.slug && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
                )}
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection 
        title="Custom Price Range" 
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Min Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors duration-200"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Max Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                <input
                  type="number"
                  placeholder="∞"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm transition-colors duration-200"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handlePriceFilter}
            disabled={!priceRange.min && !priceRange.max}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
          >
            Apply Price Filter
          </button>
        </div>
      </FilterSection>

      {/* Quick Price Filters */}
      <FilterSection 
        title="Quick Price Filters" 
        isExpanded={expandedSections.quickPrice}
        onToggle={() => toggleSection('quickPrice')}
      >
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
          {[
            { label: 'Under ₹500', min: '', max: '500', color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
            { label: '₹500 - ₹1000', min: '500', max: '1000', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
            { label: '₹1000 - ₹2000', min: '1000', max: '2000', color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' },
            { label: 'Above ₹2000', min: '2000', max: '', color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' }
          ].map((range, index) => {
            const isActive = searchParams.minPrice === range.min && searchParams.maxPrice === range.max
            return (
              <button
                key={range.label}
                onClick={() => {
                  setPriceRange({ min: range.min, max: range.max })
                  const params = new URLSearchParams(urlSearchParams.toString())
                  if (range.min) params.set('minPrice', range.min)
                  else params.delete('minPrice')
                  if (range.max) params.set('maxPrice', range.max)
                  else params.delete('maxPrice')
                  params.delete('page')
                  router.push(`/products?${params.toString()}`)
                }}
                className={`relative text-sm py-3 px-4 border-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-600 border-primary-600 text-white shadow-md transform scale-105' 
                    : `${range.color} border-2 hover:scale-105 hover:shadow-sm`
                }`}
              >
                {range.label}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-primary-600"></div>
                )}
              </button>
            )
          })}
        </div>
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center space-x-2 w-full bg-white border-2 border-gray-300 px-4 py-3 rounded-xl hover:bg-gray-50 hover:border-primary-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">Filters</span>
          {hasActiveFilters && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                {Object.keys(searchParams).filter(key => 
                  ['category', 'minPrice', 'maxPrice', 'featured', 'trending', 'hot_sale'].includes(key)
                ).length}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Filter className="w-5 h-5 text-primary-600" />
              <span>Filters</span>
            </h3>
          </div>
          <div className="p-6">
            <FilterContent />
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                      <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full font-medium">
                        {Object.keys(searchParams).filter(key => 
                          ['category', 'minPrice', 'maxPrice', 'featured', 'trending', 'hot_sale'].includes(key)
                        ).length}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <FilterContent />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex space-x-3">
                    <button
                      onClick={clearAllFilters}
                      className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl font-medium transition-colors duration-200"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors duration-200"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}