'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { Category, CategoryFormData } from '@/types'
import { generateSlug } from '@/utils/helpers'
import toast from 'react-hot-toast'

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  is_active: z.boolean(),
  display_order: z.number().min(0, 'Display order must be positive'),
})

interface CategoryModalProps {
  category?: Category | null
  onSuccess: () => void
  onClose: () => void
}

export default function CategoryModalEnhanced({ category, onSuccess, onClose }: CategoryModalProps) {
  const isEditing = !!category
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(category?.image_url || '')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      is_active: category?.is_active ?? true,
      display_order: category?.display_order || 0,
    },
  })

  const watchName = watch('name')

  useEffect(() => {
    if (watchName && !isEditing) {
      const slug = generateSlug(watchName)
      setValue('slug', slug)
    }
  }, [watchName, setValue, isEditing])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    try {
      setUploading(true)

      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `categories/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('categories')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('categories')
        .getPublicUrl(filePath)

      const imageUrl = publicData.publicUrl
      setImagePreview(imageUrl)
      
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const categoryData = {
        ...data,
        image_url: imagePreview || null,
        // Convert empty strings to null for better database consistency
        description: data.description?.trim() || null,
      }

      if (isEditing) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id)

        if (error) throw error
        toast.success('Category updated successfully!')
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert(categoryData)

        if (error) throw error
        toast.success('Category created successfully!')
      }

      onSuccess()
    } catch (error: any) {
      console.error('Failed to save category:', error)
      
      // Handle specific errors
      if (error.code === '23505') {
        if (error.message.includes('slug')) {
          toast.error('A category with this slug already exists')
        } else if (error.message.includes('name')) {
          toast.error('A category with this name already exists')
        } else {
          toast.error('Category already exists')
        }
      } else {
        toast.error('Failed to save category')
      }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="form-label">Category Image</label>
                
                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative mb-4">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview('')}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Upload a category image</p>
                    <p className="text-sm text-gray-400">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )}

                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <button
                    type="button"
                    className="btn-secondary flex items-center space-x-2 w-full justify-center"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="spinner w-4 h-4"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-4 h-4" />
                        <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Category image helps customers identify the category (optional)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Category Name *</label>
                  <input
                    {...register('name')}
                    type="text"
                    className="form-input"
                    placeholder="Enter category name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Slug *</label>
                  <input
                    {...register('slug')}
                    type="text"
                    className="form-input"
                    placeholder="category-slug"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-danger-600">{errors.slug.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    URL-friendly version of the name
                  </p>
                </div>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="form-input resize-none"
                  placeholder="Category description (optional)"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Display Order</label>
                <input
                  {...register('display_order', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="0"
                />
                {errors.display_order && (
                  <p className="mt-1 text-sm text-danger-600">{errors.display_order.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Categories with lower numbers appear first
                </p>
              </div>

              <div className="flex items-center">
                <input
                  {...register('is_active')}
                  type="checkbox"
                  id="is_active"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900">
                  Active category
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner w-4 h-4"></div>
                      <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{isEditing ? 'Update Category' : 'Create Category'}</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}