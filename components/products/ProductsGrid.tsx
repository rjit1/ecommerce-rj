'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/types'
import ProductCard from './ProductCard'

interface ProductsGridProps {
  products: Product[]
  totalCount: number
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export default function ProductsGrid({
  products,
  totalCount,
  currentPage,
  totalPages,
  searchParams
}: ProductsGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const router = useRouter()
  const urlSearchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    params.set('page', page.toString())
    router.push(`/products?${params.toString()}`)
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(urlSearchParams.toString())
    params.set('sort', sort)
    params.delete('page') // Reset to first page when sorting
    router.push(`/products?${params.toString()}`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchParams.search ? `Search Results for "${searchParams.search}"` : 
             searchParams.category ? `${searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1)} Products` :
             searchParams.featured ? 'Featured Products' :
             searchParams.trending ? 'Trending Products' :
             searchParams.hot_sale ? 'Hot Sale Products' :
             'All Products'}
          </h1>
          <p className="text-gray-600 mt-1">
            {totalCount} {totalCount === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <select
            value={searchParams.sort || 'newest'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="popularity">Most Popular</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Grid className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6'
              : 'space-y-4'
          }
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard 
                product={product} 
                className={viewMode === 'list' ? 'flex' : ''}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-12">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum
            if (totalPages <= 5) {
              pageNum = i + 1
            } else if (currentPage <= 3) {
              pageNum = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i
            } else {
              pageNum = currentPage - 2 + i
            }

            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-2 border rounded-lg ${
                  currentPage === pageNum
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            )
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}