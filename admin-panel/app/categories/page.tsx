'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types'
import { formatDate, debounce } from '@/utils/helpers'
import toast from 'react-hot-toast'
import CategoryModal from '@/components/categories/CategoryModal'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'display_order'>('display_order')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [searchTerm, sortBy, sortOrder])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      let query = supabase.from('categories').select('*')
      
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`)
      }
      
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      
      const { data, error } = await query
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId)

      if (error) throw error

      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
      fetchCategories()
    } catch (error) {
      console.error('Failed to toggle category status:', error)
      toast.error('Failed to update category status')
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error('Failed to delete category')
    }
  }

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value)
  }, 500)

  const openCreateModal = () => {
    setEditingCategory(null)
    setShowModal(true)
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
  }

  const handleCategorySuccess = () => {
    fetchCategories()
    closeModal()
  }

  return (
    <MainLayout title="Categories" subtitle="Manage product categories">
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
              placeholder="Search categories..."
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('display_order')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Order</span>
                    <ArrowsUpDownIcon className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ArrowsUpDownIcon className="w-4 h-4" />
                  </div>
                </th>
                <th>Description</th>
                <th>Products</th>
                <th>Status</th>
                <th 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <ArrowsUpDownIcon className="w-4 h-4" />
                  </div>
                </th>
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
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td>
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                        {category.display_order}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {category.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{category.slug}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description || 'No description'}
                        </p>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-900">
                        0 products {/* We'll calculate this later */}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(category.id, category.is_active)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          category.is_active
                            ? 'bg-success-100 text-success-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {category.is_active ? (
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
                        {formatDate(category.created_at)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="Edit category"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                          title="Delete category"
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
                      No categories found. Create your first category to get started.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onSuccess={handleCategorySuccess}
          onClose={closeModal}
        />
      )}
    </MainLayout>
  )
}