'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Product } from '@/types'
import ProductCard from '@/components/products/ProductCard'

interface ProductSectionProps {
  title: string
  subtitle?: string
  products: Product[]
  viewAllLink?: string
  className?: string
}

export default function ProductSection({ 
  title, 
  subtitle, 
  products, 
  viewAllLink,
  className = ''
}: ProductSectionProps) {
  if (!products || products.length === 0) {
    return null
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          
          {viewAllLink && (
            <Link
              href={viewAllLink}
              className="hidden md:flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile View All Button */}
        {viewAllLink && (
          <div className="text-center mt-12 md:hidden">
            <Link
              href={viewAllLink}
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
            >
              <span>View All {title}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}