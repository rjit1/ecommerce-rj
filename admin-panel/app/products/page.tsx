'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { Product, ProductFilters } from '@/types'
import { formatCurrency, formatDate, debounce } from '@/utils/helpers'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    status: undefined,
    featured: undefined,
    trending: undefined,
    hotSale: undefined,
    sortBy: 'newest',
  })

  useEffect(() => {
    fetchProducts()
  }, [currentPage, filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          images:product_images(image_url, display_order),
          variants:product_variants(stock_quantity)
        `, { count: 'exact' })
      
      // Apply filters
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      if (filters.status === 'active') {
        query = query.eq('is_active', true)
      } else if (filters.status === 'inactive') {
        query = query.eq('is_active', false)
      }
      
      if (filters.featured) {
        query = query.eq('is_featured', true)
      }
      
      if (filters.trending) {
        query = query.eq('is_trending', true)
      }
      
      if (filters.hotSale) {
        query = query.eq('is_hot_sale', true)
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'name_asc':
          query = query.order('name', { ascending: true })
          break
        case 'name_desc':
          query = query.order('name', { ascending: false })
          break
        case 'price_low':
          query = query.order('price', { ascending: true })
          break
        case 'price_high':
          query = query.order('price', { ascending: false })
          break
      }

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      // Calculate total stock for each product
      const productsWithStock = (data || []).map(product => ({
        ...product,
        total_stock: product.variants?.reduce((sum: number, variant: any) => sum + variant.stock_quantity, 0) || 0,
        is_low_stock: (product.variants?.reduce((sum: number, variant: any) => sum + variant.stock_quantity, 0) || 0) <= 3,
        featured_image: product.images?.find((img: any) => img.display_order === 0)?.image_url || 
                      product.images?.[0]?.image_url || 
                      '/images/placeholder.svg'
      }))

      setProducts(productsWithStock)
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) throw error

      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchProducts()
    } catch (error) {
      console.error('Failed to toggle product status:', error)
      toast.error('Failed to update product status')
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error('Failed to delete product')
    }
  }

  const debouncedSearch = debounce((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setCurrentPage(1)
  }, 500)

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <MainLayout title="Products" subtitle="Manage your product catalog">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 pr-4 py-2 w-64"
              placeholder="Search products..."
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="relative">
            <select
              className="form-input pr-8"
              value={filters.status || ''}
              onChange={(e) => {
                setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value as ProductFilters['status'] || undefined 
                }))
                setCurrentPage(1)
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="relative">
            <select
              className="form-input pr-8"
              value={filters.sortBy}
              onChange={(e) => {
                setFilters(prev => ({ 
                  ...prev, 
                  sortBy: e.target.value as ProductFilters['sortBy']
                }))
                setCurrentPage(1)
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="price_low">Price Low-High</option>
              <option value="price_high">Price High-Low</option>
            </select>
          </div>
        </div>

        <Link href="/products/new" className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}>
                        <div className="pulse-bg h-6 w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <Image
                            src={product.featured_image || '/images/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.slug}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {product.is_featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                            {product.is_trending && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Trending
                              </span>
                            )}
                            {product.is_hot_sale && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Hot Sale
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-900">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </div>
                        {product.discount_price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatCurrency(product.discount_price)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${
                          product.is_low_stock 
                            ? 'text-danger-600' 
                            : product.total_stock === 0 
                            ? 'text-gray-500' 
                            : 'text-gray-900'
                        }`}>
                          {product.total_stock}
                        </span>
                        {product.is_low_stock && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-danger-100 text-danger-800">
                            Low
                          </span>
                        )}
                        {product.total_stock === 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            Out
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(product.id, product.is_active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-success-100 text-success-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.is_active ? (
                          <>
                            <EyeIcon className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeSlashIcon className="w-3 h-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {formatDate(product.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="Edit product"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                          title="Delete product"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-gray-500">
                      No products found. 
                      <Link href="/products/new" className="text-primary-600 hover:text-primary-700 ml-1">
                        Create your first product
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
                {totalCount} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = Math.max(1, currentPage - 2) + i
                  if (pageNumber > totalPages) return null
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        currentPage === pageNumber
                          ? 'bg-primary-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </MainLayout>
  )
}