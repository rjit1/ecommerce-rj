'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { cn } from '@/utils/helpers'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  sizes?: string
  priority?: boolean
  quality?: number
  fallbackSrc?: string
}

const DEFAULT_FALLBACK = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNmM2Y0ZjYiLz48cmVjdCB4PSIxNTAiIHk9IjE1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNkMWQ1ZGIiIHJ4PSI4Ii8+PHRleHQgeD0iMjAwIiB5PSIyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZiNzI4MCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  sizes,
  priority = false,
  quality = 75,
  fallbackSrc = DEFAULT_FALLBACK
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Update imgSrc when src prop changes
  useEffect(() => {
    if (src && src !== imgSrc) {
      setImgSrc(src)
      setIsLoading(true)
      setHasError(false)
    }
  }, [src, imgSrc])

  const handleError = () => {
    console.log('Image failed to load:', imgSrc)
    if (imgSrc !== fallbackSrc) {
      console.log('Falling back to:', fallbackSrc)
      setImgSrc(fallbackSrc)
      setHasError(false)
    } else {
      setHasError(true)
    }
    setIsLoading(false)
  }

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  // If we have a final error, show a placeholder div
  if (hasError) {
    return (
      <div 
        className={cn(
          "bg-gray-200 flex items-center justify-center text-gray-400 text-sm",
          fill ? "absolute inset-0" : "",
          className
        )}
        style={!fill ? { width: width || 400, height: height || 400 } : undefined}
      >
        <span>Image not available</span>
      </div>
    )
  }

  const imageProps = {
    src: imgSrc,
    alt,
    onError: handleError,
    onLoad: handleLoad,
    quality,
    priority,
    className: cn(
      "transition-opacity duration-300",
      isLoading ? "opacity-0" : "opacity-100",
      className
    ),
    unoptimized: imgSrc.startsWith('data:') // Don't optimize data URLs
  }

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={sizes}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 400}
      sizes={sizes}
    />
  )
}