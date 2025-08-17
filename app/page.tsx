import { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { Banner, Category, Product } from '@/types'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import HeroBanner from '@/components/home/HeroBanner'
import CategorySection from '@/components/home/CategorySection'
import ProductSection from '@/components/home/ProductSection'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'RJ4WEAR - Premium Fashion & Lifestyle Store',
  description: 'Discover premium quality fashion and lifestyle products at RJ4WEAR. Shop the latest trends in clothing, accessories, and more with fast delivery and great prices.',
  openGraph: {
    title: 'RJ4WEAR - Premium Fashion & Lifestyle Store',
    description: 'Discover premium quality fashion and lifestyle products at RJ4WEAR.',
    images: ['/images/og-home.jpg'],
  },
}

// This page uses ISR for better performance and SEO
export const revalidate = 3600 // Revalidate every hour

async function getHomePageData() {
  const supabase = createSupabaseServerClient()

  try {
    // Fetch site settings
    const { data: settings } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['top_header_text', 'top_header_enabled'])

    // Fetch active banners
    const { data: banners } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Fetch active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(10)

    // Fetch featured products with their images and variants
    const { data: featuredProducts } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)

    // Fetch trending products
    const { data: trendingProducts } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('is_active', true)
      .eq('is_trending', true)
      .order('created_at', { ascending: false })
      .limit(8)

    // Fetch hot sale products
    const { data: hotSaleProducts } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('is_active', true)
      .eq('is_hot_sale', true)
      .order('created_at', { ascending: false })
      .limit(8)

    // Process products to add featured_image
    const processProducts = (products: any[] | null) => {
      return products?.map(product => ({
        ...product,
        featured_image: product.images?.[0]?.image_url || null
      })) || []
    }

    return {
      settings: settings?.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>) || {},
      banners: (banners as Banner[]) || [],
      categories: (categories as Category[]) || [],
      featuredProducts: processProducts(featuredProducts) as Product[],
      trendingProducts: processProducts(trendingProducts) as Product[],
      hotSaleProducts: processProducts(hotSaleProducts) as Product[]
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      settings: {},
      banners: [],
      categories: [],
      featuredProducts: [],
      trendingProducts: [],
      hotSaleProducts: []
    }
  }
}

export default async function HomePage() {
  const {
    settings,
    banners,
    categories,
    featuredProducts,
    trendingProducts,
    hotSaleProducts
  } = await getHomePageData()

  return (
    <main className="min-h-screen">
      {/* Top Header */}
      <TopHeader 
        initialText={settings.top_header_text || '🎉 Free Delivery on Orders Above ₹999! 🚚'}
        initialEnabled={settings.top_header_enabled !== 'false'}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Banner */}
      <HeroBanner banners={banners} />

      {/* Categories Section */}
      <CategorySection categories={categories} />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <ProductSection
          title="Featured Products"
          subtitle="Handpicked premium products just for you"
          products={featuredProducts}
          viewAllLink="/products?featured=true"
          className="bg-white"
        />
      )}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <ProductSection
          title="Trending Now"
          subtitle="What's popular among our customers"
          products={trendingProducts}
          viewAllLink="/products?trending=true"
          className="bg-gray-50"
        />
      )}

      {/* Hot Sale Products */}
      {hotSaleProducts.length > 0 && (
        <ProductSection
          title="🔥 Hot Sale"
          subtitle="Limited time offers you don't want to miss"
          products={hotSaleProducts}
          viewAllLink="/products?hot_sale=true"
          className="bg-white"
        />
      )}

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Footer */}
      <Footer />
    </main>
  )
}