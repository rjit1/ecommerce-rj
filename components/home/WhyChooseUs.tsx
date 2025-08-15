'use client'

import { motion } from 'framer-motion'
import { Shield, Truck, Clock, MessageCircle, Award, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: Award,
    title: 'Premium Quality Materials',
    description: 'We source only the finest fabrics and materials to ensure durability and comfort in every piece.',
    color: 'text-primary-600'
  },
  {
    icon: Truck,
    title: 'Fast Delivery Promise',
    description: 'Quick and reliable delivery across India. Free shipping on orders above ₹999.',
    color: 'text-green-600'
  },
  {
    icon: Shield,
    title: 'Trusted by 1000+ Customers',
    description: 'Join thousands of satisfied customers who trust us for their fashion needs.',
    color: 'text-blue-600'
  },
  {
    icon: MessageCircle,
    title: '24/7 WhatsApp Support',
    description: 'Get instant help and support through our dedicated WhatsApp customer service.',
    color: 'text-emerald-600'
  },
  {
    icon: Clock,
    title: 'Easy Returns & Exchange',
    description: '7-day hassle-free returns and exchanges. Your satisfaction is our priority.',
    color: 'text-orange-600'
  },
  {
    icon: RefreshCw,
    title: 'Size Exchange Guarantee',
    description: 'Not sure about the size? We offer free size exchanges within 7 days.',
    color: 'text-purple-600'
  }
]

export default function WhyChooseUs() {
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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Why Choose RJ4WEAR?
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            We're committed to providing you with the best fashion experience through quality products, 
            exceptional service, and customer satisfaction.
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center ${feature.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-500 to-accent-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Experience Premium Fashion?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of satisfied customers and discover your perfect style today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                Shop Now
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}