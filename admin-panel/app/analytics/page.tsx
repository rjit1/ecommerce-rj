'use client'

import MainLayout from '@/components/layout/MainLayout'
import { motion } from 'framer-motion'
import { ChartBarIcon } from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
  return (
    <MainLayout title="Analytics" subtitle="View detailed analytics and reports">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Analytics Dashboard
          </h3>
          <p className="text-gray-500 mb-6">
            Advanced analytics and reporting features will be available in the next version.
          </p>
          <div className="text-sm text-gray-400">
            Coming soon: Revenue charts, customer insights, product performance, and more.
          </div>
        </div>
      </motion.div>
    </MainLayout>
  )
}