import { Metadata } from 'next'
import { Suspense } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Product, Category } from '@/types'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import ProductsGrid from '@/components/products/ProductsGrid'
import ProductFilters from '@/components/products/ProductFilters'
import Footer from '@/components/layout/Footer'

interface ProductsPageProps {
  searchParams: {
    category?: string
    search?: string
    featured?: string
    trending?: string
    hot_sale?: string
    sort?: string
    page?: string
  }
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const { category, search, featured, trending, hot_sale } = searchParams
  
  let title = 'All Products'
  let description = 'Browse our complete collection of premium fashion and lifestyle products.'
  
  if (category) {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)} Products`
    description = `Shop ${category} products at RJ4WEAR. Premium quality with fast delivery.`
  } else if (search) {
    title = `Search Results for "${search}"`
    description = `Find products matching "${search}" at RJ4WEAR.`
  } else if (featured) {
    title = 'Featured Products'
    description = 'Discover our handpicked featured products with premium quality and style.'
  } else if (trending) {
    title = 'Trending Products'
    description = 'Shop the most popular trending products loved by our customers.'
  } else if (hot_sale) {
    title = 'Hot Sale Products'
    description = 'Limited time offers on premium products. Don\'t miss out!'
  }
  
  return {
    title: `${title} | RJ4WEAR`,
    description,
    openGraph: {
      title: `${title} | RJ4WEAR`,
      description,
    },
  }
}

export const revalidate = 1800 // Revalidate every 30 minutes

async function getProductsData(searchParams: ProductsPageProps['searchParams']) {
  const supabase = createSupabaseServerClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const offset = (page - 1) * limit

  try {
    // Build query
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `, { count: 'exact' })
      .eq('is_active', true)

    // Apply filters
    if (searchParams.category) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', searchParams.category)
        .single()
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      }
    }

    if (searchParams.search) {
      query = query.ilike('name', `%${searchParams.search}%`)
    }

    if (searchParams.featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (searchParams.trending === 'true') {
      query = query.eq('is_trending', true)
    }

    if (searchParams.hot_sale === 'true') {
      query = query.eq('is_hot_sale', true)
    }

    // Apply sorting
    switch (searchParams.sort) {
      case 'price_low':
        query = query.order('price', { ascending: true })
        break
      case 'price_high':
        query = query.order('price', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, count, error } = await query

    if (error) throw error

    // Get categories for filters
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Process products to add featured_image
    const processedProducts = products?.map(product => ({
      ...product,
      featured_image: product.images?.[0]?.image_url || null
    })) || []

    return {
      products: processedProducts as Product[],
      categories: (categories as Category[]) || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      products: [],
      categories: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0
    }
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { products, categories, totalCount, currentPage, totalPages } = await getProductsData(searchParams)

  return (
    <main className="min-h-screen">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 xl:w-80 flex-shrink-0">
            <Suspense fallback={
              <div className="animate-pulse">
                <div className="bg-gray-200 h-16 rounded-xl mb-4 lg:hidden"></div>
                <div className="bg-gray-200 h-96 rounded-xl hidden lg:block"></div>
              </div>
            }>
              <ProductFilters 
                categories={categories}
                searchParams={searchParams}
              />
            </Suspense>
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <Suspense fallback={
              <div className="animate-pulse">
                <div className="bg-gray-200 h-12 rounded-lg mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array(12).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
                  ))}
                </div>
              </div>
            }>
              <ProductsGrid
                products={products}
                totalCount={totalCount}
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={searchParams}
              />
            </Suspense>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}