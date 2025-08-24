'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { Category, ProductFormData } from '@/types'
import { generateSlug } from '@/utils/helpers'
import toast from 'react-hot-toast'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  specifications: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discount_price: z.number().optional().nullable(),
  is_featured: z.boolean(),
  is_trending: z.boolean(),
  is_hot_sale: z.boolean(),
  is_active: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  variants: z.array(z.object({
    size: z.string().min(1, 'Size is required'),
    color: z.string().min(1, 'Color is required'),
    color_code: z.string().optional(),
    stock_quantity: z.number().min(0, 'Stock cannot be negative'),
    sku: z.string().optional(),
  })).min(1, 'At least one variant is required'),
})

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42']
const AVAILABLE_COLORS = [
  { name: 'Red', code: '#ef4444' },
  { name: 'Blue', code: '#3b82f6' },
  { name: 'Green', code: '#10b981' },
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#ffffff' },
  { name: 'Gray', code: '#6b7280' },
  { name: 'Yellow', code: '#f59e0b' },
  { name: 'Purple', code: '#8b5cf6' },
  { name: 'Pink', code: '#ec4899' },
  { name: 'Orange', code: '#f97316' },
]

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      specifications: '',
      category_id: '',
      price: 0,
      discount_price: null,
      is_featured: false,
      is_trending: false,
      is_hot_sale: false,
      is_active: true,
      meta_title: '',
      meta_description: '',
      variants: [
        {
          size: 'M',
          color: 'Black',
          color_code: '#000000',
          stock_quantity: 0,
          sku: '',
        }
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  })

  const watchName = watch('name')

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (watchName) {
      const slug = generateSlug(watchName)
      setValue('slug', slug)
      setValue('meta_title', watchName)
    }
  }, [watchName, setValue])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      toast.error('Please select only JPEG, PNG, or WebP images')
      return
    }

    // Validate file sizes (max 5MB each)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize)
    
    if (oversizedFiles.length > 0) {
      toast.error('Image files must be smaller than 5MB')
      return
    }

    setImages(prev => [...prev, ...files])

    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      setImageUrls(prev => [...prev, url])
    })
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageUrls[index])
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return []

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
        const filePath = `products/${fileName}`

        const { data, error } = await supabase.storage
          .from('products')
          .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
      }

      return uploadedUrls
    } catch (error) {
      console.error('Failed to upload images:', error)
      throw new Error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Upload images first
      const imageUrls = await uploadImages()

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description,
          specifications: data.specifications,
          category_id: data.category_id,
          price: data.price,
          discount_price: data.discount_price,
          is_featured: data.is_featured,
          is_trending: data.is_trending,
          is_hot_sale: data.is_hot_sale,
          is_active: data.is_active,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
        })
        .select()
        .single()

      if (productError) throw productError

      // Create product images
      if (imageUrls.length > 0) {
        const imageInserts = imageUrls.map((url, index) => ({
          product_id: product.id,
          image_url: url,
          display_order: index,
          alt_text: data.name,
        }))

        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageInserts)

        if (imagesError) throw imagesError
      }

      // Create product variants
      const variantInserts = data.variants.map(variant => ({
        product_id: product.id,
        size: variant.size,
        color: variant.color,
        color_code: variant.color_code,
        stock_quantity: variant.stock_quantity,
        sku: variant.sku || `${data.slug}-${variant.size}-${variant.color}`.toLowerCase(),
      }))

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts)

      if (variantsError) throw variantsError

      toast.success('Product created successfully!')
      router.push('/products')
    } catch (error) {
      console.error('Failed to create product:', error)
      toast.error('Failed to create product')
    }
  }

  return (
    <MainLayout title="Add Product" subtitle="Create a new product for your store">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Product Name *</label>
                <input
                  {...register('name')}
                  type="text"
                  className="form-input"
                  placeholder="Enter product name"
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
                  placeholder="product-slug"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-danger-600">{errors.slug.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Description *</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="form-input resize-none"
                  placeholder="Describe your product..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="form-label">Specifications</label>
                <textarea
                  {...register('specifications')}
                  rows={3}
                  className="form-input resize-none"
                  placeholder="Product specifications (optional)"
                />
              </div>

              <div>
                <label className="form-label">Category *</label>
                <select {...register('category_id')} className="form-input">
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-sm text-danger-600">{errors.category_id.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">Regular Price (₹) *</label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-danger-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Discount Price (₹)</label>
                <input
                  {...register('discount_price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Product Images */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Images</h3>
            
            <div className="space-y-4">
              {/* Upload Button */}
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB each</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* Image Previews */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-danger-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Variants */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
              <button
                type="button"
                onClick={() => append({
                  size: 'M',
                  color: 'Black',
                  color_code: '#000000',
                  stock_quantity: 0,
                  sku: '',
                })}
                className="btn-secondary text-sm flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <label className="form-label">Size *</label>
                      <select {...register(`variants.${index}.size` as const)} className="form-input">
                        {AVAILABLE_SIZES.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Color *</label>
                      <select 
                        {...register(`variants.${index}.color` as const)}
                        onChange={(e) => {
                          const color = AVAILABLE_COLORS.find(c => c.name === e.target.value)
                          if (color) {
                            setValue(`variants.${index}.color_code`, color.code)
                          }
                        }}
                        className="form-input"
                      >
                        {AVAILABLE_COLORS.map(color => (
                          <option key={color.name} value={color.name}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Stock Quantity *</label>
                      <input
                        {...register(`variants.${index}.stock_quantity` as const, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="form-input"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="form-label">SKU</label>
                      <input
                        {...register(`variants.${index}.sku` as const)}
                        type="text"
                        className="form-input"
                        placeholder="Auto-generated"
                      />
                    </div>

                    <div>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors duration-200"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {errors.variants && (
              <p className="mt-2 text-sm text-danger-600">{errors.variants.message}</p>
            )}
          </div>

          {/* Product Flags */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Flags</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center space-x-3">
                <input
                  {...register('is_featured')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">Featured Product</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  {...register('is_trending')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">Trending Product</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  {...register('is_hot_sale')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">Hot Sale</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  {...register('is_active')}
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-900">Active</span>
              </label>
            </div>
          </div>

          {/* SEO */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">SEO Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Meta Title</label>
                <input
                  {...register('meta_title')}
                  type="text"
                  className="form-input"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <label className="form-label">Meta Description</label>
                <textarea
                  {...register('meta_description')}
                  rows={3}
                  className="form-input resize-none"
                  placeholder="SEO description for search engines"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="btn-primary flex items-center space-x-2"
            >
              {isSubmitting || uploading ? (
                <>
                  <div className="spinner w-4 h-4"></div>
                  <span>{uploading ? 'Uploading...' : 'Creating...'}</span>
                </>
              ) : (
                <span>Create Product</span>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  )
}