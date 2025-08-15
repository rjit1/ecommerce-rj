'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, Phone, MessageCircle, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase'
import { SiteSettings } from '@/types'

export default function Footer() {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({})
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('key, value')
          .in('key', ['contact_email', 'contact_phone', 'whatsapp_number', 'site_name', 'site_description'])

        if (data) {
          const settingsObj = data.reduce((acc, setting) => {
            acc[setting.key as keyof SiteSettings] = setting.value as any
            return acc
          }, {} as Partial<SiteSettings>)
          setSettings(settingsObj)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    fetchSettings()
  }, [supabase])

  const quickLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
    { href: '/products?featured=true', label: 'Featured' },
    { href: '/products?hot_sale=true', label: 'Hot Sale' },
    { href: '/categories', label: 'Categories' },
  ]

  const policyLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/terms-of-service', label: 'Terms of Service' },
    { href: '/shipping-policy', label: 'Shipping Policy' },
    { href: '/return-policy', label: 'Return Policy' },
    { href: '/faq', label: 'FAQ' },
  ]

  const customerCareLinks = [
    { href: '/contact', label: 'Contact Us' },
    { href: '/track-order', label: 'Track Order' },
    { href: '/size-guide', label: 'Size Guide' },
    { href: '/care-instructions', label: 'Care Instructions' },
    { href: '/bulk-orders', label: 'Bulk Orders' },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RJ</span>
              </div>
              <span className="text-xl font-bold">
                {settings.site_name || 'RJ4WEAR'}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {settings.site_description || 'Premium Fashion & Lifestyle Store offering quality products with fast delivery and great customer service.'}
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Care</h3>
            <ul className="space-y-2">
              {customerCareLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              {settings.contact_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              )}
              
              {settings.contact_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <a
                    href={`tel:${settings.contact_phone}`}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {settings.contact_phone}
                  </a>
                </div>
              )}
              
              {settings.whatsapp_number && (
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-4 h-4 text-primary-400 flex-shrink-0" />
                  <a
                    href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    WhatsApp Support
                  </a>
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-300 text-sm">
                  <p>123 Fashion Street</p>
                  <p>Mumbai, Maharashtra 400001</p>
                  <p>India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Policies Section */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} {settings.site_name || 'RJ4WEAR'}. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-4">
              <p className="text-gray-400 text-sm">We accept:</p>
              <div className="flex space-x-2">
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-900">VISA</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-900">MC</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-900">UPI</span>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <span className="text-xs font-semibold text-gray-900">COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}