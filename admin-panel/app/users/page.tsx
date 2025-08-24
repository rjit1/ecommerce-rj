'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types'
import { formatDate, debounce } from '@/utils/helpers'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 10

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' })
      
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      }
      
      query = query.order('created_at', { ascending: false })

      // Apply pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setUsers(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }, 500)

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <MainLayout title="Users" subtitle="Manage customer accounts">
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
              placeholder="Search users..."
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}>
                        <div className="pulse-bg h-6 w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          {user.full_name ? (
                            <span className="text-sm font-medium text-gray-700">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <UserIcon className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.full_name || 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.split('-')[0]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{user.email}</span>
                      </div>
                    </td>
                    <td>
                      {user.phone ? (
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not provided</span>
                      )}
                    </td>
                    <td>
                      <span className="text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-gray-900">
                        0 orders {/* We'll implement this count later */}
                      </span>
                    </td>
                    <td>
                      <button
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                        title="View user details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      No users found.
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