'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import toast from 'react-hot-toast'
import MagicLinkDialog from './MagicLinkDialog'

export default function SignupForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMagicLinkDialog, setShowMagicLinkDialog] = useState(false)
  const [registrationMethod, setRegistrationMethod] = useState<'email' | 'magic' | null>(null)

  const supabase = useSupabaseClient()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})
    setRegistrationMethod('email')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone
          }
        }
      })

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('already registered')) {
          setErrors({ email: 'This email is already registered. Please try logging in instead.' })
        } else if (error.message.includes('invalid email')) {
          setErrors({ email: 'Please enter a valid email address' })
        } else if (error.message.includes('password')) {
          setErrors({ password: error.message })
        } else {
          toast.error(error.message)
        }
      } else {
        setEmailVerificationSent(true)
        toast.success('Account created successfully! Please check your email to verify your account.')
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkClick = () => {
    setRegistrationMethod('magic')
    setShowMagicLinkDialog(true)
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-soft border border-gray-200 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join RJ4WEAR for exclusive deals and more</p>
        </div>

        <form onSubmit={handleEmailSignup} className="space-y-6">
          {/* Full Name Field */}
          <div>
            <label className="form-label">Full Name</label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`input pl-10 ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your full name"
                required
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="form-label">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your email"
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="form-label">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`input pl-10 ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your phone number"
                required
              />
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`input pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Create a password (min. 6 characters)"
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="form-label">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Show Create Account button only when using email/password method or no method selected */}
          {(registrationMethod === null || registrationMethod === 'email') && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading && registrationMethod === 'email' ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="spinner" />
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          )}

          {/* Show divider and magic link button only when no method is selected */}
          {registrationMethod === null && (
            <>
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Magic Link Button */}
              <button
                type="button"
                onClick={handleMagicLinkClick}
                className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Sign up with Magic Link
              </button>
            </>
          )}
        </form>

        {/* Email Verification Success Message */}
        {emailVerificationSent && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Mail className="w-5 h-5 text-green-600 mt-0.5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Verification Email Sent!
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  We've sent a verification link to <strong>{formData.email}</strong>.
                  Please check your email and click the link to verify your account.
                </p>
                <p className="mt-2 text-xs text-green-600">
                  Don't see the email? Check your spam folder or{' '}
                  <button
                    onClick={handleEmailSignup}
                    className="underline hover:no-underline"
                    disabled={loading}
                  >
                    resend verification email
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Magic Link Dialog */}
      <MagicLinkDialog
        isOpen={showMagicLinkDialog}
        onClose={() => setShowMagicLinkDialog(false)}
        mode="signup"
      />
    </div>
  )
}