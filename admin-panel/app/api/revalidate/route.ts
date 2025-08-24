import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json()

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
    }

    // Make request to main site's revalidation endpoint
    const mainSiteUrl = process.env.MAIN_SITE_URL || 'http://localhost:3000'
    
    const response = await fetch(`${mainSiteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path, secret }),
    })

    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Revalidated successfully',
      data: result
    })
  } catch (error: any) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Error revalidating',
        error: error.message 
      },
      { status: 500 }
    )
  }
}