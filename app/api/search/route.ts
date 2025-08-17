import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const supabase = createSupabaseServerClient()

  try {
    // Search products with images and pricing - improved query with better ordering
    const { data: products } = await supabase
      .from('products')
      .select(`
        id, 
        name, 
        slug, 
        price, 
        discount_price,
        is_featured,
        is_trending,
        is_hot_sale,
        category:categories(name, slug),
        images:product_images(image_url, alt_text, display_order)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('is_trending', { ascending: false })
      .order('is_hot_sale', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6)

    // Search categories with better matching
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(3)

    // Format product suggestions with featured image
    const productSuggestions = (products || []).map(product => ({
      type: 'product',
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.discount_price || product.price,
      originalPrice: product.discount_price ? product.price : null,
      category: (product.category as any)?.name,
      image: product.images?.[0]?.image_url || null,
      hasDiscount: !!product.discount_price
    }))

    // Format category suggestions
    const categorySuggestions = (categories || []).map(category => ({
      type: 'category',
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: category.image_url
    }))

    const suggestions = [...productSuggestions, ...categorySuggestions]

    return NextResponse.json({ 
      suggestions,
      total: suggestions.length,
      query: query.trim()
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ 
      suggestions: [], 
      total: 0, 
      query: query.trim(),
      error: 'Search failed' 
    }, { status: 500 })
  }
}