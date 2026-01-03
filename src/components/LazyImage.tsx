import { useState } from 'react'
import SkeletonLoader from './SkeletonLoader'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  thumbnailUrl?: string
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
  [key: string]: any
}

export default function LazyImage({
  src,
  alt,
  className = '',
  thumbnailUrl,
  onError,
  ...props
}: LazyImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(thumbnailUrl || src)

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget
    img.style.backgroundColor = 'transparent'
    setImageLoaded(true)
    
    // 썸네일이 로드되었고 원본이 있으면 백그라운드에서 원본 로드 후 교체
    if (thumbnailUrl && src && img.src === thumbnailUrl) {
      const originalImg = new Image()
      originalImg.onload = () => {
        setCurrentSrc(src)
      }
      originalImg.src = src
    }
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 썸네일 로드 실패 시 원본 시도
    if (thumbnailUrl && currentSrc === thumbnailUrl && src) {
      setCurrentSrc(src)
    } else {
      setImageError(true)
      if (onError) {
        onError(e)
      }
    }
  }

  return (
    <div className="relative w-full h-full">
      {!imageLoaded && !imageError && (
        <SkeletonLoader type="image" className="absolute inset-0" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
        } ${className}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
        {...props}
      />
    </div>
  )
}

