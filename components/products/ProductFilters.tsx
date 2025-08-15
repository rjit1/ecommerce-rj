'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Filter } from 'lucide-react'
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
  
  const router = useRouter()
  const urlSearchParams = useSearchParams()

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

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Special Filters */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Special Collections</h4>
        <div className="space-y-2">
          {[
            { key: 'featured', label: 'Featured Products' },
            { key: 'trending', label: 'Trending Now' },
            { key: 'hot_sale', label: '🔥 Hot Sale' }
          ].map(filter => (
            <label key={filter.key} className="flex items-center">
              <input
                type="checkbox"
                checked={searchParams[filter.key] === 'true'}
                onChange={() => handleSpecialFilter(filter.key)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.map(category => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={searchParams.category === category.slug}
                  onChange={() => handleCategoryFilter(category.slug)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={handlePriceFilter}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm"
          >
            Apply Price Filter
          </button>
        </div>
      </div>

      {/* Quick Price Filters */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Quick Price Filters</h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Under ₹500', min: '', max: '500' },
            { label: '₹500 - ₹1000', min: '500', max: '1000' },
            { label: '₹1000 - ₹2000', min: '1000', max: '2000' },
            { label: 'Above ₹2000', min: '2000', max: '' }
          ].map(range => (
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
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors duration-200"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block bg-white rounded-lg border border-gray-200 p-6">
        <FilterContent />
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterContent />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}