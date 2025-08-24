'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  TicketIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import CouponModal from '@/components/coupons/CouponModal'
import { supabase } from '@/lib/supabase'
import { Coupon } from '@/types'
import { formatCurrency, formatDate, debounce } from '@/utils/helpers'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [currentPage, searchTerm, filterStatus])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('coupons')
        .select('*', { count: 'exact' })
      
      if (searchTerm) {
        query = query.ilike('code', `%${searchTerm}%`)
      }
      
      if (filterStatus === 'active') {
        query = query.eq('is_active', true)
        query = query.or('expires_at.is.null,expires_at.gte.now()')
      } else if (filterStatus === 'expired') {
        query = query.lt('expires_at', new Date().toISOString())
      }

      query = query.order('created_at', { ascending: false })

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setCoupons(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (couponId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !currentStatus })
        .eq('id', couponId)

      if (error) throw error

      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchCoupons()
    } catch (error) {
      console.error('Failed to update coupon status:', error)
      toast.error('Failed to update coupon status')
    }
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', couponId)

      if (error) throw error

      toast.success('Coupon deleted successfully')
      fetchCoupons()
    } catch (error) {
      console.error('Failed to delete coupon:', error)
      toast.error('Failed to delete coupon')
    }
  }

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }, 500)

  const handleModalSuccess = () => {
    setShowModal(false)
    setSelectedCoupon(null)
    fetchCoupons()
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedCoupon(null)
  }

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon)
    setShowModal(true)
  }

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <MainLayout title="Coupons" subtitle="Manage discount coupons">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="form-input pl-10 pr-4 py-2 w-64"
              placeholder="Search coupons..."
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-input pr-8"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as 'all' | 'active' | 'expired')
              setCurrentPage(1)
            }}
          >
            <option value="all">All Coupons</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j}>
                        <div className="pulse-bg h-6 w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center space-x-2">
                        <TicketIcon className="w-4 h-4 text-primary-600" />
                        <span className="font-mono font-medium text-gray-900">
                          {coupon.code}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        coupon.discount_type === 'percentage' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {coupon.discount_type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium text-gray-900">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}%` 
                          : formatCurrency(coupon.discount_value)
                        }
                      </span>
                      {coupon.max_discount_amount && coupon.discount_type === 'percentage' && (
                        <div className="text-xs text-gray-500">
                          Max: {formatCurrency(coupon.max_discount_amount)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="text-sm text-gray-900">
                        {formatCurrency(coupon.min_order_amount)}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="text-gray-900">
                          {coupon.used_count} used
                        </div>
                        {coupon.usage_limit && (
                          <div className="text-gray-500">
                            of {coupon.usage_limit}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          coupon.is_active 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {isExpired(coupon.expires_at) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-800">
                            Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {coupon.expires_at ? formatDate(coupon.expires_at) : 'Never'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleToggleStatus(coupon.id, coupon.is_active)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            coupon.is_active 
                              ? 'text-warning-600 hover:bg-warning-50' 
                              : 'text-success-600 hover:bg-success-50'
                          }`}
                          title={coupon.is_active ? 'Deactivate coupon' : 'Activate coupon'}
                        >
                          {coupon.is_active ? (
                            <EyeSlashIcon className="w-4 h-4" />
                          ) : (
                            <EyeIcon className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="Edit coupon"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                          title="Delete coupon"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No coupons found
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Create your first coupon to offer discounts to customers.
                    </p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="btn-primary"
                    >
                      Create Coupon
                    </button>
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

      {/* Coupon Modal */}
      {showModal && (
        <CouponModal
          coupon={selectedCoupon}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}
    </MainLayout>
  )
}