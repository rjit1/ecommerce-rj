'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeftIcon, PhotoIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { Product, Category, ProductFormData, ProductImage, ProductVariant } from '@/types'
import { generateSlug } from '@/utils/helpers'
import toast from 'react-hot-toast'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  specifications: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  discount_price: z.number().optional(),
  is_featured: z.boolean(),
  is_trending: z.boolean(),
  is_hot_sale: z.boolean(),
  is_active: z.boolean(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
}).refine(data => {
  if (data.discount_price && data.discount_price >= data.price) {
    return false
  }
  return true
}, {
  message: "Discount price must be less than regular price",
  path: ["discount_price"]
})

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newImageUrls, setNewImageUrls] = useState<string[]>([])
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const watchName = watch('name')

  useEffect(() => {
    if (watchName && product && watchName !== product.name) {
      const slug = generateSlug(watchName)
      setValue('slug', slug)
    }
  }, [watchName, setValue, product])

  useEffect(() => {
    fetchData()
  }, [productId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (productError) throw productError
      setProduct(productData)

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (categoriesError) throw categoriesError
      setCategories(categoriesData || [])

      // Fetch product images
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', productId)
        .order('display_order')

      if (imagesError) throw imagesError
      setExistingImages(imagesData || [])

      // Fetch product variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('size')
        .order('color')

      if (variantsError) throw variantsError
      setVariants(variantsData || [])

      // Set form values
      setValue('name', productData.name)
      setValue('slug', productData.slug)
      setValue('description', productData.description || '')
      setValue('specifications', productData.specifications || '')
      setValue('category_id', productData.category_id || '')
      setValue('price', productData.price)
      setValue('discount_price', productData.discount_price || 0)
      setValue('is_featured', productData.is_featured)
      setValue('is_trending', productData.is_trending)
      setValue('is_hot_sale', productData.is_hot_sale)
      setValue('is_active', productData.is_active)
      setValue('meta_title', productData.meta_title || '')
      setValue('meta_description', productData.meta_description || '')

    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load product data')
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setNewImages(prev => [...prev, ...validFiles])

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setNewImageUrls(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = async (imageId: string, index: number) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      setExistingImages(prev => prev.filter((_, i) => i !== index))
      toast.success('Image removed successfully')
    } catch (error) {
      console.error('Error removing image:', error)
      toast.error('Failed to remove image')
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return []

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i]
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
      // Upload new images first
      const newImageUrls = await uploadNewImages()

      // Update product
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          specifications: data.specifications || null,
          category_id: data.category_id || null,
          price: data.price,
          discount_price: data.discount_price || null,
          is_featured: data.is_featured,
          is_trending: data.is_trending,
          is_hot_sale: data.is_hot_sale,
          is_active: data.is_active,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
        })
        .eq('id', productId)

      if (productError) throw productError

      // Insert new product images
      if (newImageUrls.length > 0) {
        const imageInserts = newImageUrls.map((url, index) => ({
          product_id: productId,
          image_url: url,
          alt_text: `${data.name} - Image ${existingImages.length + index + 1}`,
          display_order: existingImages.length + index,
        }))

        const { error: imageError } = await supabase
          .from('product_images')
          .insert(imageInserts)

        if (imageError) throw imageError
      }

      toast.success('Product updated successfully!')
      router.push('/products')
    } catch (error: any) {
      console.error('Failed to update product:', error)
      
      if (error.code === '23505') {
        if (error.message.includes('slug')) {
          toast.error('A product with this slug already exists')
        } else {
          toast.error('Product already exists')
        }
      } else {
        toast.error('Failed to update product')
      }
    }
  }

  if (loading) {
    return (
      <MainLayout title="Edit Product" subtitle="Loading product data...">
        <div className="flex items-center justify-center min-h-96">
          <div className="spinner w-8 h-8"></div>
        </div>
      </MainLayout>
    )
  }

  if (!product) {
    return (
      <MainLayout title="Product Not Found">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product not found</h2>
          <Link href="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Edit Product" subtitle="Update product information and images">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/products"
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600">Update product information and images</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200"
        >
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
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

                  <div>
                    <label className="form-label">Category *</label>
                    <select {...register('category_id')} className="form-select">
                      <option value="">Select a category</option>
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

                  <div>
                    <label className="form-label">Price *</label>
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
                    <label className="form-label">Discount Price</label>
                    <input
                      {...register('discount_price', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="0.00"
                    />
                    {errors.discount_price && (
                      <p className="mt-1 text-sm text-danger-600">{errors.discount_price.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Images */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Current Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || `Product image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(image.id, index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images */}
                {newImageUrls.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">New Images to Add</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {newImageUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`New image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB each</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Description & Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="form-input resize-none"
                    placeholder="Product description..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Specifications</label>
                  <textarea
                    {...register('specifications')}
                    rows={4}
                    className="form-input resize-none"
                    placeholder="Product specifications..."
                  />
                  {errors.specifications && (
                    <p className="mt-1 text-sm text-danger-600">{errors.specifications.message}</p>
                  )}
                </div>
              </div>

              {/* Product Flags */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Flags</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center">
                    <input
                      {...register('is_featured')}
                      type="checkbox"
                      id="is_featured"
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_featured" className="ml-2 text-sm font-medium text-gray-900">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('is_trending')}
                      type="checkbox"
                      id="is_trending"
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_trending" className="ml-2 text-sm font-medium text-gray-900">
                      Trending Product
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('is_hot_sale')}
                      type="checkbox"
                      id="is_hot_sale"
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_hot_sale" className="ml-2 text-sm font-medium text-gray-900">
                      Hot Sale
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      {...register('is_active')}
                      type="checkbox"
                      id="is_active"
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-900">
                      Active Product
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Meta Title</label>
                    <input
                      {...register('meta_title')}
                      type="text"
                      className="form-input"
                      placeholder="SEO title for search engines"
                    />
                    {errors.meta_title && (
                      <p className="mt-1 text-sm text-danger-600">{errors.meta_title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Meta Description</label>
                    <textarea
                      {...register('meta_description')}
                      rows={3}
                      className="form-input resize-none"
                      placeholder="SEO description for search engines"
                    />
                    {errors.meta_description && (
                      <p className="mt-1 text-sm text-danger-600">{errors.meta_description.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/products" className="btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="btn-primary flex items-center space-x-2"
                >
                  {isSubmitting || uploading ? (
                    <>
                      <div className="spinner w-4 h-4"></div>
                      <span>{uploading ? 'Uploading...' : 'Updating...'}</span>
                    </>
                  ) : (
                    <span>Update Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  )
}