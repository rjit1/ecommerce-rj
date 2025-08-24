import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path, tag, secret } = await request.json()

    // Check for secret to confirm this is a valid request
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid revalidation secret' 
        }, 
        { status: 401 }
      )
    }

    // Validate required parameters
    if (!path && !tag) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Either path or tag is required' 
        }, 
        { status: 400 }
      )
    }

    // Revalidate by path
    if (path) {
      revalidatePath(path)
      console.log(`✅ Revalidated path: ${path}`)
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag)
      console.log(`✅ Revalidated tag: ${tag}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Revalidation completed successfully',
      revalidated: {
        path: path || null,
        tag: tag || null,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('❌ Revalidation error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Revalidation failed',
        error: error.message 
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Revalidation API is healthy',
    timestamp: new Date().toISOString()
  })
}