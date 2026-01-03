import { useEffect, useRef, useState } from 'react'

interface ImageLightboxProps {
  isOpen: boolean
  imageSrc: string
  imageAlt: string
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  onDownload?: () => void
  onShare?: () => void
  onToggleAutoPlay?: () => void
  isAutoPlaying?: boolean
  tags?: string[]
}

export default function ImageLightbox({
  isOpen,
  imageSrc,
  imageAlt,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  onDownload,
  onShare,
  onToggleAutoPlay,
  isAutoPlaying = false,
  tags
}: ImageLightboxProps) {
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const touchEndY = useRef<number>(0)
  const [imageOffset, setImageOffset] = useState(0)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious()
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, hasPrevious, hasNext, onClose, onPrevious, onNext])

  // 스와이프 제스처 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!imageContainerRef.current) return
    
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = currentX - touchStartX.current
    const deltaY = currentY - touchStartY.current
    
    // 수평 스와이프가 수직 스와이프보다 크면 이미지 이동
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setImageOffset(deltaX)
      e.preventDefault() // 스크롤 방지
    }
  }

  const handleTouchEnd = () => {
    const deltaX = touchEndX.current - touchStartX.current
    const minSwipeDistance = 50 // 최소 스와이프 거리
    
    // 이미지 오프셋 초기화
    setImageOffset(0)
    
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0 && hasPrevious && onPrevious) {
        // 오른쪽으로 스와이프 -> 이전 이미지
        onPrevious()
      } else if (deltaX < 0 && hasNext && onNext) {
        // 왼쪽으로 스와이프 -> 다음 이미지
        onNext()
      }
    }
    
    touchStartX.current = 0
    touchEndX.current = 0
  }

  const handleTouchEndUpdate = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    touchEndY.current = e.changedTouches[0].clientY
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-fade-in"
      onClick={onClose}
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Top Action Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onShare()
            }}
            className="text-white/90 hover:text-white transition-colors"
            aria-label="공유"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v.01M4 12a8 8 0 018-8m-4 8a4 4 0 104 4m6 0a2 2 0 11-4 0 2 2 0 014 0zm4 0v.01" />
            </svg>
          </button>
        )}
        {onDownload && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDownload()
            }}
            className="text-white/90 hover:text-white transition-colors"
            aria-label="다운로드"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm4 4h8m-4 8V8" />
            </svg>
          </button>
        )}
        {onToggleAutoPlay && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleAutoPlay()
            }}
            className="text-white/90 hover:text-white transition-colors flex items-center gap-1 text-xs"
            aria-label="슬라이드쇼"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
            {isAutoPlaying ? '정지' : '재생'}
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="text-white/90 hover:text-white transition-colors"
          aria-label="닫기"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Buttons */}
      {hasPrevious && onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrevious()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 z-10"
          aria-label="이전 이미지"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {hasNext && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 z-10"
          aria-label="다음 이미지"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Image Container - 화면을 꽉 채우도록 */}
      <div
        ref={imageContainerRef}
        className="absolute inset-0 flex items-center justify-center touch-pan-y"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={(e) => {
          handleTouchEndUpdate(e)
          handleTouchEnd()
        }}
        style={{ top: 0, left: 0, right: 0, bottom: 0, overflow: 'auto' }}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="object-contain transition-transform duration-200"
          style={{ 
            maxWidth: '100vw', 
            maxHeight: '100vh',
            width: 'auto',
            height: 'auto',
            display: 'block',
            transform: `translateX(${imageOffset}px)`,
            touchAction: 'pan-y'
          }}
        />
      </div>

      {tags && tags.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs">
          {tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

