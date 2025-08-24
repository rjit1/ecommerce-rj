'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, TrashIcon, CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { supabase } from '@/lib/supabase'
import { ProductVariant } from '@/types'
import toast from 'react-hot-toast'

interface ProductVariantsManagerProps {
  productId: string
  variants: ProductVariant[]
  onVariantsChange: (variants: ProductVariant[]) => void
}

interface VariantFormData {
  id?: string
  size: string
  color: string
  color_code: string
  stock_quantity: number
  sku: string
  image_url?: string
}

export default function ProductVariantsManager({ 
  productId, 
  variants, 
  onVariantsChange 
}: ProductVariantsManagerProps) {
  const [editingVariant, setEditingVariant] = useState<VariantFormData | null>(null)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')

  const handleAddVariant = () => {
    setEditingVariant({
      size: '',
      color: '',
      color_code: '#000000',
      stock_quantity: 0,
      sku: '',
    })
    setImagePreview('')
  }

  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      color_code: variant.color_code || '#000000',
      stock_quantity: variant.stock_quantity,
      sku: variant.sku || '',
      image_url: variant.image_url || '',
    })
    setImagePreview(variant.image_url || '')
  }

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
      const filePath = `variants/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('variants')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('variants')
        .getPublicUrl(filePath)

      const imageUrl = publicData.publicUrl
      setImagePreview(imageUrl)
      
      if (editingVariant) {
        setEditingVariant({
          ...editingVariant,
          image_url: imageUrl
        })
      }
      
      toast.success('Image uploaded successfully!')
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveVariant = async () => {
    if (!editingVariant) return

    // Validation
    if (!editingVariant.size || !editingVariant.color) {
      toast.error('Size and color are required')
      return
    }

    try {
      const variantData = {
        product_id: productId,
        size: editingVariant.size,
        color: editingVariant.color,
        color_code: editingVariant.color_code,
        stock_quantity: editingVariant.stock_quantity,
        sku: editingVariant.sku || null,
        image_url: editingVariant.image_url || null,
      }

      if (editingVariant.id) {
        // Update existing variant
        const { error } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', editingVariant.id)

        if (error) throw error

        // Update local state
        const updatedVariants = variants.map(v => 
          v.id === editingVariant.id ? { ...v, ...variantData } : v
        )
        onVariantsChange(updatedVariants)
        toast.success('Variant updated successfully!')
      } else {
        // Create new variant
        const { data, error } = await supabase
          .from('product_variants')
          .insert(variantData)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const updatedVariants = [...variants, data]
        onVariantsChange(updatedVariants)
        toast.success('Variant created successfully!')
      }

      setEditingVariant(null)
      setImagePreview('')
    } catch (error: any) {
      console.error('Failed to save variant:', error)
      
      if (error.code === '23505') {
        toast.error('A variant with this size and color already exists')
      } else {
        toast.error('Failed to save variant')
      }
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId)

      if (error) throw error

      // Update local state
      const updatedVariants = variants.filter(v => v.id !== variantId)
      onVariantsChange(updatedVariants)
      toast.success('Variant deleted successfully!')
    } catch (error: any) {
      console.error('Failed to delete variant:', error)
      toast.error('Failed to delete variant')
    }
  }

  const handleCancel = () => {
    setEditingVariant(null)
    setImagePreview('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
        <button
          onClick={handleAddVariant}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Variant</span>
        </button>
      </div>

      {/* Variants List */}
      {variants.length > 0 ? (
        <div className="space-y-4">
          {variants.map((variant) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border border-gray-200 rounded-lg bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {variant.image_url && (
                    <img
                      src={variant.image_url}
                      alt={`${variant.color} ${variant.size}`}
                      className="w-12 h-12 object-cover rounded border border-gray-300"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {variant.size} - {variant.color}
                      </span>
                      <div
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: variant.color_code || '#000000' }}
                      />
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>Stock: {variant.stock_quantity}</span>
                      {variant.sku && <span>SKU: {variant.sku}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditVariant(variant)}
                    className="px-3 py-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteVariant(variant.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No variants added yet.</p>
          <p className="text-sm">Add variants like different sizes, colors, or styles.</p>
        </div>
      )}

      {/* Edit/Add Variant Modal */}
      {editingVariant && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 overflow-y-auto"
        >
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCancel} />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingVariant.id ? 'Edit Variant' : 'Add Variant'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                {/* Variant Image */}
                <div>
                  <label className="form-label">Variant Image (Optional)</label>
                  
                  {imagePreview && (
                    <div className="relative mb-4">
                      <img
                        src={imagePreview}
                        alt="Variant preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('')
                          setEditingVariant({ ...editingVariant, image_url: '' })
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Size *</label>
                    <input
                      type="text"
                      value={editingVariant.size}
                      onChange={(e) => setEditingVariant({
                        ...editingVariant,
                        size: e.target.value
                      })}
                      className="form-input"
                      placeholder="S, M, L, XL, 30, 32..."
                    />
                  </div>

                  <div>
                    <label className="form-label">Stock Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      value={editingVariant.stock_quantity}
                      onChange={(e) => setEditingVariant({
                        ...editingVariant,
                        stock_quantity: parseInt(e.target.value) || 0
                      })}
                      className="form-input"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Color *</label>
                  <input
                    type="text"
                    value={editingVariant.color}
                    onChange={(e) => setEditingVariant({
                      ...editingVariant,
                      color: e.target.value
                    })}
                    className="form-input"
                    placeholder="Red, Blue, Black..."
                  />
                </div>

                <div>
                  <label className="form-label">Color Code</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={editingVariant.color_code}
                      onChange={(e) => setEditingVariant({
                        ...editingVariant,
                        color_code: e.target.value
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={editingVariant.color_code}
                      onChange={(e) => setEditingVariant({
                        ...editingVariant,
                        color_code: e.target.value
                      })}
                      className="form-input"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">SKU (Optional)</label>
                  <input
                    type="text"
                    value={editingVariant.sku}
                    onChange={(e) => setEditingVariant({
                      ...editingVariant,
                      sku: e.target.value
                    })}
                    className="form-input"
                    placeholder="PRD-SIZE-COLOR"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVariant}
                    disabled={uploading}
                    className="btn-primary"
                  >
                    {editingVariant.id ? 'Update Variant' : 'Add Variant'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}