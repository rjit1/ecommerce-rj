'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, TrendingUp, Star, ShoppingBag } from 'lucide-react'
import { Product } from '@/types'
import ProductCard from './ProductCard'

interface RelatedProductsProps {
  products: Product[]
  currentProduct?: Product
}

export default function RelatedProducts({ products, currentProduct }: RelatedProductsProps) {
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  if (!products || products.length === 0) {
    return null
  }

  // Group products by type for better recommendations
  const featuredProducts = products.filter(p => p.is_featured)
  const trendingProducts = products.filter(p => p.is_trending)
  const hotSaleProducts = products.filter(p => p.is_hot_sale)

  // Create intelligent product sections
  const productSections = [
    ...(featuredProducts.length > 0 ? [{ 
      title: "Featured Picks", 
      icon: Star, 
      products: featuredProducts.slice(0, 6),
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    }] : []),
    ...(trendingProducts.length > 0 ? [{ 
      title: "Trending Now", 
      icon: TrendingUp, 
      products: trendingProducts.slice(0, 6),
      color: "text-green-600",
      bgColor: "bg-green-50"
    }] : []),
    ...(hotSaleProducts.length > 0 ? [{ 
      title: "Hot Sale", 
      icon: ShoppingBag, 
      products: hotSaleProducts.slice(0, 6),
      color: "text-red-600",
      bgColor: "bg-red-50"
    }] : []),
  ]

  // Check scroll position and update button states
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      return () => container.removeEventListener('scroll', checkScrollPosition)
    }
  }, [products])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      // Get card width based on screen size to match Tailwind breakpoints
      const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 320 : 350
      const gap = window.innerWidth < 768 ? 16 : 24
      const scrollAmount = cardWidth + gap
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      // Get card width based on screen size to match Tailwind breakpoints
      const cardWidth = window.innerWidth < 640 ? 280 : window.innerWidth < 1024 ? 320 : 350
      const gap = window.innerWidth < 768 ? 16 : 24
      const scrollAmount = cardWidth + gap
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
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
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              You Might Also Love
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked products that complement your style and preferences
            </p>
          </motion.div>

          {/* Product Section Indicators */}
          {productSections.length > 1 && (
            <motion.div 
              className="flex justify-center gap-4 mt-6 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {productSections.map((section, index) => (
                <div 
                  key={section.title}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${section.bgColor} ${section.color}`}
                >
                  <section.icon className="w-4 h-4" />
                  <span>{section.title}</span>
                  <span className="bg-white px-2 py-0.5 rounded-full text-xs">{section.products.length}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Horizontal Scrolling Products */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
              canScrollLeft 
                ? 'text-gray-700 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 hover:shadow-xl' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
              canScrollRight 
                ? 'text-gray-700 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 hover:shadow-xl' 
                : 'text-gray-300 cursor-not-allowed opacity-50'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Horizontal Scrolling Container */}
          <div className="px-8 md:px-12">
            <motion.div
              ref={scrollContainerRef}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {products.map((product, index) => (
                <motion.div 
                  key={product.id}
                  variants={itemVariants}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[350px]"
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
              
              {/* Add some padding at the end */}
              <div className="flex-shrink-0 w-4"></div>
            </motion.div>
          </div>

          {/* Scroll Indicator Dots */}
          {products.length > 3 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(products.length / 3) }).map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300 transition-colors duration-200"
                />
              ))}
            </div>
          )}
        </div>



        {/* Touch/Swipe Instructions for Mobile */}
        <motion.div 
          className="text-center mt-8 md:hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <span>👈</span>
            <span>Swipe to see more products</span>
            <span>👉</span>
          </p>
        </motion.div>
      </div>

      {/* Custom Scrollbar Hide Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}