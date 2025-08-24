'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import BannerModal from '@/components/banners/BannerModal'
import { supabase } from '@/lib/supabase'
import { Banner } from '@/types'
import { formatDate } from '@/utils/helpers'
import toast from 'react-hot-toast'

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error

      setBanners(data || [])
    } catch (error) {
      console.error('Failed to fetch banners:', error)
      toast.error('Failed to load banners')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', bannerId)

      if (error) throw error

      toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchBanners()
    } catch (error) {
      console.error('Failed to update banner status:', error)
      toast.error('Failed to update banner status')
    }
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId)

      if (error) throw error

      toast.success('Banner deleted successfully')
      fetchBanners()
    } catch (error) {
      console.error('Failed to delete banner:', error)
      toast.error('Failed to delete banner')
    }
  }

  const handleUpdateOrder = async (bannerId: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ display_order: newOrder })
        .eq('id', bannerId)

      if (error) throw error

      fetchBanners()
    } catch (error) {
      console.error('Failed to update banner order:', error)
      toast.error('Failed to update banner order')
    }
  }

  const handleModalSuccess = () => {
    setShowModal(false)
    setSelectedBanner(null)
    fetchBanners()
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedBanner(null)
  }

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner)
    setShowModal(true)
  }

  return (
    <MainLayout title="Banners" subtitle="Manage homepage banners">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-sm text-gray-600">
          Manage homepage banners and promotional content
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Banners Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="pulse-bg h-48 w-full mb-4"></div>
              <div className="space-y-3">
                <div className="pulse-bg h-4 w-3/4"></div>
                <div className="pulse-bg h-3 w-1/2"></div>
              </div>
            </div>
          ))
        ) : banners.length > 0 ? (
          banners.map((banner) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card overflow-hidden"
            >
              {/* Banner Image */}
              <div className="relative">
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  className="w-full h-48 object-cover"
                />
                {!banner.is_active && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-medium">Inactive</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-75 text-white rounded">
                    #{banner.display_order}
                  </span>
                </div>
              </div>

              {/* Banner Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {banner.title || 'Untitled Banner'}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {banner.subtitle}
                      </p>
                    )}
                  </div>
                  <div className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    banner.is_active 
                      ? 'bg-success-100 text-success-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>

                {banner.link_url && (
                  <div className="text-sm text-primary-600 truncate mb-3">
                    🔗 {banner.link_url}
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  Created {formatDate(banner.created_at)}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={banner.display_order}
                      onChange={(e) => handleUpdateOrder(banner.id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                      min="0"
                    />
                    <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleStatus(banner.id, banner.is_active)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        banner.is_active 
                          ? 'text-warning-600 hover:bg-warning-50' 
                          : 'text-success-600 hover:bg-success-50'
                      }`}
                      title={banner.is_active ? 'Deactivate banner' : 'Activate banner'}
                    >
                      {banner.is_active ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                      title="Edit banner"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                      title="Delete banner"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="card text-center py-12"
            >
              <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No banners yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first banner to showcase on the homepage.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary"
              >
                Create Banner
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Banner Modal */}
      {showModal && (
        <BannerModal
          banner={selectedBanner}
          onSuccess={handleModalSuccess}
          onClose={handleModalClose}
        />
      )}
    </MainLayout>
  )
}