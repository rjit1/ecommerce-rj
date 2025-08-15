import { Product } from '@/types'
import { formatCurrency } from '@/utils/helpers'

interface StructuredDataProps {
  type: 'product' | 'organization' | 'website'
  data?: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: any = {}

  switch (type) {
    case 'product':
      if (data as Product) {
        const product = data as Product
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.images?.map(img => img.image_url) || [],
          brand: {
            '@type': 'Brand',
            name: 'RJ4WEAR'
          },
          category: product.category?.name,
          offers: {
            '@type': 'Offer',
            price: product.discount_price || product.price,
            priceCurrency: 'INR',
            availability: product.variants?.some(v => v.stock_quantity > 0) 
              ? 'https://schema.org/InStock' 
              : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: 'RJ4WEAR'
            }
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.5',
            reviewCount: '100'
          }
        }
      }
      break

    case 'organization':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'RJ4WEAR',
        description: 'Premium Fashion & Lifestyle Store',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        logo: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-9876543210',
          contactType: 'customer service',
          availableLanguage: ['English', 'Hindi']
        },
        sameAs: [
          'https://www.facebook.com/rj4wear',
          'https://www.instagram.com/rj4wear',
          'https://www.twitter.com/rj4wear'
        ]
      }
      break

    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'RJ4WEAR',
        url: process.env.NEXT_PUBLIC_SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/products?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      }
      break
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}