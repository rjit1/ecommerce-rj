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
    product.description
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
      product.images.sort((a, b) => a.display_order - b.display_order)
    }

    // Sort variants by size and color
    if (product.variants) {
      product.variants.sort((a, b) => {
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

async function getRelatedProducts(categoryId: string, currentProductId: string): Promise<Product[]> {
  try {
    const { data: products } = await supabaseAdmin
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
      .limit(8)

    return products?.map(product => ({
      ...product,
      featured_image: product.images?.[0]?.image_url || null
    })) as Product[] || []
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
    ? await getRelatedProducts(product.category_id, product.id)
    : []

  return (
    <main className="min-h-screen">
      <TopHeader />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <ProductDetail product={product} />
      </div>

      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}

      <Footer />
    </main>
  )
}