import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-server'
import { Product } from '@/types'
import { generateMetaTitle, generateMetaDescription } from '@/utils/helpers'
import TopHeader from '@/components/layout/TopHeader'
import Navbar from '@/components/layout/Navbar'
import ProductDetail from '@/components/products/ProductDetail'
import RelatedProducts from '@/components/products/RelatedProducts'
import Footer from '@/components/layout/Footer'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug)
  
  if (!product) {
    return {
      title: 'Product Not Found | RJ4WEAR',
      description: 'The product you are looking for could not be found.'
    }
  }

  const title = product.meta_title || generateMetaTitle(product.name, product.category?.name)
  const description = product.meta_description || generateMetaDescription(
    product.name, 
    product.discount_price || product.price, 
    product.description || undefined
  )

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.images?.map(img => ({
        url: img.image_url,
        alt: img.alt_text || product.name
      })) || [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images?.[0]?.image_url ? [product.images[0].image_url] : [],
    },
  }
}

// Generate static paths for popular products - using admin client to avoid cookies issue
export async function generateStaticParams() {
  try {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('slug')
      .eq('is_active', true)
      .or('is_featured.eq.true,is_trending.eq.true,is_hot_sale.eq.true')
      .limit(50)

    return products?.map(product => ({
      slug: product.slug
    })) || []
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export const revalidate = 3600 // Revalidate every hour

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !product) {
      return null
    }

    // Sort images by display_order
    if (product.images) {
      product.images.sort((a: any, b: any) => a.display_order - b.display_order)
    }

    // Sort variants by size and color
    if (product.variants) {
      product.variants.sort((a: any, b: any) => {
        if (a.size !== b.size) {
          const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40']
          return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
        }
        return a.color.localeCompare(b.color)
      })
    }

    return {
      ...product,
      featured_image: product.images?.[0]?.image_url || null
    } as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

async function getRelatedProducts(categoryId: string, currentProductId: string, currentPrice: number): Promise<Product[]> {
  try {
    // Get products from same category
    const { data: categoryProducts } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .limit(6)

    // Get featured products from different categories
    const { data: featuredProducts } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('is_featured', true)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .neq('category_id', categoryId)
      .limit(4)

    // Get trending products
    const { data: trendingProducts } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('is_trending', true)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .limit(4)

    // Get hot sale products
    const { data: hotSaleProducts } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .eq('is_hot_sale', true)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .limit(4)

    // Get products in similar price range (±30% of current price)
    const priceMin = currentPrice * 0.7
    const priceMax = currentPrice * 1.3
    const { data: similarPriceProducts } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        category:categories(name),
        images:product_images(image_url, alt_text, display_order),
        variants:product_variants(*)
      `)
      .gte('price', priceMin)
      .lte('price', priceMax)
      .eq('is_active', true)
      .neq('id', currentProductId)
      .neq('category_id', categoryId)
      .limit(3)

    // Combine all products and remove duplicates
    const allProducts = [
      ...(categoryProducts || []),
      ...(featuredProducts || []),
      ...(trendingProducts || []),
      ...(hotSaleProducts || []),
      ...(similarPriceProducts || [])
    ]

    // Remove duplicates based on product id
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    )

    // Sort by priority: featured > trending > hot sale > same category > similar price
    const sortedProducts = uniqueProducts.sort((a, b) => {
      const getScore = (product: any) => {
        let score = 0
        if (product.is_featured) score += 100
        if (product.is_trending) score += 80
        if (product.is_hot_sale) score += 60
        if (product.category_id === categoryId) score += 40
        if (product.price >= priceMin && product.price <= priceMax) score += 20
        return score
      }
      return getScore(b) - getScore(a)
    })

    // Take top 12 products and add featured_image
    return sortedProducts.slice(0, 12).map(product => ({
      ...product,
      featured_image: product.images?.[0]?.image_url || null
    })) as Product[]
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = product.category_id 
    ? await getRelatedProducts(product.category_id, product.id, product.discount_price || product.price)
    : []

  return (
    <main className="min-h-screen">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <ProductDetail product={product} />
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProducts 
          products={relatedProducts} 
          currentProduct={product}
        />
      )}

      <Footer />
    </main>
  )
}