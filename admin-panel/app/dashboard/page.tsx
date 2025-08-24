'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  ClockIcon,
  CogIcon,
} from '@heroicons/react/24/outline'
import MainLayout from '@/components/layout/MainLayout'
import { supabase } from '@/lib/supabase'
import { DashboardStats, Order } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/utils/helpers'

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  trendValue 
}: {
  title: string
  value: string | number
  icon: any
  color: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="stats-card"
  >
    <div className="flex items-center">
      <div className={`flex-shrink-0 p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4 w-0 flex-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm font-medium text-gray-500">{title}</div>
        {trend && trendValue && (
          <div className={`text-xs mt-1 ${
            trend === 'up' ? 'text-success-600' : 
            trend === 'down' ? 'text-danger-600' : 
            'text-gray-500'
          }`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </div>
        )}
      </div>
    </div>
  </motion.div>
)

const OrderStatusBadge = ({ status }: { status: Order['status'] }) => {
  const statusConfig = {
    pending: { class: 'status-badge-pending', text: 'Pending' },
    confirmed: { class: 'status-badge-confirmed', text: 'Confirmed' },
    processing: { class: 'status-badge-processing', text: 'Processing' },
    shipped: { class: 'status-badge-shipped', text: 'Shipped' },
    delivered: { class: 'status-badge-delivered', text: 'Delivered' },
    cancelled: { class: 'status-badge-cancelled', text: 'Cancelled' },
  }

  const config = statusConfig[status]
  return <span className={config.class}>{config.text}</span>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [
        ordersResult,
        usersResult,
        lowStockResult,
        recentOrdersResult
      ] = await Promise.all([
        // Total orders and revenue
        supabase
          .from('orders')
          .select('total_amount, created_at, status')
          .order('created_at', { ascending: false }),
        
        // Total users
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true }),
        
        // Low stock products - get products with total stock < 10
        supabase
          .from('products')
          .select(`
            id,
            name,
            product_variants(stock_quantity)
          `)
          .eq('is_active', true),
        
        // Recent orders
        supabase
          .from('orders')
          .select(`
            *,
            order_items(*)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      const orders = ordersResult.data || []
      const today = new Date().toISOString().split('T')[0]
      
      const todayOrders = orders.filter(order => 
        order.created_at?.split('T')[0] === today
      )
      
      const pendingOrders = orders.filter(order => 
        order.status === 'pending'
      )

      const totalRevenue = orders.reduce((sum, order) => 
        sum + (order.total_amount || 0), 0
      )
      
      const todayRevenue = todayOrders.reduce((sum, order) => 
        sum + (order.total_amount || 0), 0
      )

      // Calculate low stock products (products with total stock < 10)
      const productsWithStock = lowStockResult.data || []
      const lowStockCount = productsWithStock.filter(product => {
        const totalStock = (product.product_variants || []).reduce((sum: number, variant: any) => 
          sum + (variant.stock_quantity || 0), 0
        )
        return totalStock < 10
      }).length

      const dashboardStats: DashboardStats = {
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: usersResult.count || 0,
        lowStockProducts: lowStockCount,
        pendingOrders: pendingOrders.length,
        todayOrders: todayOrders.length,
        todayRevenue,
        monthlyRevenue: [], // We'll implement this later with proper aggregation
        recentOrders: recentOrdersResult.data || [],
        topProducts: [] // We'll implement this later
      }

      setStats(dashboardStats)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <MainLayout title="Dashboard" subtitle="Overview of your e-commerce platform">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stats-card">
              <div className="pulse-bg h-20 w-full"></div>
            </div>
          ))}
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout title="Dashboard" subtitle="Overview of your e-commerce platform">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingBagIcon}
          color="bg-primary-500"
          trend="up"
          trendValue={`${stats?.todayOrders || 0} today`}
        />
        
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={CurrencyRupeeIcon}
          color="bg-success-500"
          trend="up"
          trendValue={`${formatCurrency(stats?.todayRevenue || 0)} today`}
        />
        
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={UsersIcon}
          color="bg-secondary-500"
        />
        
        <StatCard
          title="Low Stock Items"
          value={stats?.lowStockProducts || 0}
          icon={ExclamationTriangleIcon}
          color="bg-warning-500"
        />
        
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={ClockIcon}
          color="bg-orange-500"
        />
        
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          icon={TruckIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link 
              href="/orders"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>

          <div className="space-y-4">
            {stats?.recentOrders?.length ? (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      #{order.order_number}
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {order.customer_name} • {order.customer_email}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent orders found
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/products/new"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <ShoppingBagIcon className="w-8 h-8 text-primary-500 mb-2" />
              <div className="font-medium text-gray-900">Add Product</div>
              <div className="text-sm text-gray-500">Create new product</div>
            </Link>
            
            <Link
              href="/orders?status=pending"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <ClockIcon className="w-8 h-8 text-warning-500 mb-2" />
              <div className="font-medium text-gray-900">Pending Orders</div>
              <div className="text-sm text-gray-500">{stats?.pendingOrders || 0} pending</div>
            </Link>
            
            <Link
              href="/products?filter=low_stock"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <ExclamationTriangleIcon className="w-8 h-8 text-danger-500 mb-2" />
              <div className="font-medium text-gray-900">Low Stock</div>
              <div className="text-sm text-gray-500">{stats?.lowStockProducts || 0} items</div>
            </Link>
            
            <Link
              href="/settings"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <CogIcon className="w-8 h-8 text-gray-500 mb-2" />
              <div className="font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-500">Manage site settings</div>
            </Link>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  )
}