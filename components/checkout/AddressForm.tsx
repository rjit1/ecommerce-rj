'use client'

import { useState, useEffect } from 'react'
import { MapPin, Plus, Check, User, Phone, Home, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import toast from 'react-hot-toast'

interface Address {
  id?: string
  full_name: string
  email?: string
  phone: string
  address_line_1: string
  address_line_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default?: boolean
}

interface AddressFormProps {
  onAddressSelect: (address: Address) => void
  selectedAddress: Address | null
}

export default function AddressForm({ onAddressSelect, selectedAddress }: AddressFormProps) {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Address>({
    full_name: '',
    email: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India'
  })

  const user = useUser()
  const supabase = useSupabaseClient()

  // Load saved addresses for authenticated users and pre-populate email
  useEffect(() => {
    if (user) {
      loadSavedAddresses()
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }))
    }
  }, [user])

  const loadSavedAddresses = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedAddresses(data || [])
    } catch (error) {
      console.error('Error loading addresses:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.full_name.trim() || !formData.phone.trim() || !formData.address_line_1.trim() || 
        !formData.city.trim() || !formData.state.trim() || !formData.postal_code.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    // Email validation for guest users
    if (!user && (!formData.email?.trim() || !formData.email.includes('@'))) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      // Save address for authenticated users
      if (user) {
        console.log('Attempting to save address for user:', user.id)
        console.log('Form data:', formData)
        console.log('Saved addresses count:', savedAddresses.length)
        
        const addressData = {
          user_id: user.id,
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          address_line_1: formData.address_line_1.trim(),
          address_line_2: formData.address_line_2?.trim() || null,
          city: formData.city.trim(),
          state: formData.state,
          postal_code: formData.postal_code.trim(),
          country: formData.country,
          is_default: savedAddresses.length === 0
        }
        
        console.log('Address data to insert:', addressData)
        
        const { data, error } = await supabase
          .from('user_addresses')
          .insert(addressData)
          .select()
          .single()

        if (error) {
          console.error('Database error details:', error)
          throw error
        }

        console.log('Address saved successfully:', data)
        
        // Update saved addresses
        await loadSavedAddresses()
        toast.success('Address saved successfully!')
        
        // Select the new address
        onAddressSelect(data)
      } else {
        // For guest users, just use the form data
        onAddressSelect(formData)
        toast.success('Address selected for checkout!')
      }

      setShowNewAddressForm(false)
      resetForm()
    } catch (error) {
      console.error('Error saving address:', error)
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          toast.error('Permission denied. Please try logging out and back in.')
        } else if (error.message.includes('duplicate')) {
          toast.error('This address already exists.')
        } else if (error.message.includes('violates check')) {
          toast.error('Please check all required fields are filled correctly.')
        } else {
          toast.error(`Failed to save address: ${error.message}`)
        }
      } else {
        toast.error('Failed to save address. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: user?.email || '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India'
    })
  }

  const handleAddressSelect = (address: Address) => {
    onAddressSelect(address)
  }

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi'
  ]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          <span>Delivery Address</span>
        </h2>
        
        {user && (
          <button
            onClick={() => setShowNewAddressForm(!showNewAddressForm)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        )}
      </div>

      {/* Saved Addresses for Authenticated Users */}
      {user && savedAddresses.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Saved Addresses</h3>
          <div className="space-y-3">
            {savedAddresses.map((address) => (
              <motion.div
                key={address.id}
                whileHover={{ scale: 1.02 }}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  selectedAddress?.id === address.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleAddressSelect(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="font-medium text-gray-900">{address.full_name}</p>
                      {address.is_default && (
                        <span className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                    <p className="text-sm text-gray-600">
                      {address.address_line_1}
                      {address.address_line_2 && `, ${address.address_line_2}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                  </div>
                  
                  {selectedAddress?.id === address.id && (
                    <div className="flex-shrink-0 ml-4">
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* New Address Form */}
      <AnimatePresence>
        {(showNewAddressForm || (!user || savedAddresses.length === 0)) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                {user ? 'Add New Address' : 'Delivery Address'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="input pl-10"
                        placeholder="Enter full name"
                        required
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      Email Address {!user && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input pl-10"
                        placeholder="Enter email address"
                        required={!user}
                        disabled={!!user}
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    {user && (
                      <p className="text-xs text-gray-500 mt-1">
                        Using your account email
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input pl-10"
                        placeholder="Enter phone number"
                        required
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label">Address Line 1 *</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="address_line_1"
                      value={formData.address_line_1}
                      onChange={handleInputChange}
                      className="input pl-10"
                      placeholder="House/Flat No., Building Name, Street"
                      required
                    />
                    <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input
                    type="text"
                    name="address_line_2"
                    value={formData.address_line_2}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Landmark, Area"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="input"
                      required
                    >
                      <option value="">Select State</option>
                      {indianStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">PIN Code *</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter PIN code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  {showNewAddressForm && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewAddressForm(false)
                        resetForm()
                      }}
                      className="text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ml-auto"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="spinner" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      user ? 'Save & Continue' : 'Continue'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Guest User Notice */}
      {!user && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>💡 Tip:</strong> Create an account to save addresses for faster checkout next time!
          </p>
        </div>
      )}
    </div>
  )
}