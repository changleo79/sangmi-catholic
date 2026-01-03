import { useEffect, useRef, useState } from 'react'

interface InfiniteScrollProps {
  hasMore: boolean
  loadMore: () => void
  loading?: boolean
  threshold?: number
  children: React.ReactNode
}

export default function InfiniteScroll({
  hasMore,
  loadMore,
  loading = false,
  threshold = 200,
  children
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || loading) return

    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore()
      }
    }, options)

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => {
      if (observerRef.current && sentinelRef.current) {
        observerRef.current.unobserve(sentinelRef.current)
      }
    }
  }, [hasMore, loadMore, loading, threshold])

  return (
    <>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="w-full h-10 flex items-center justify-center">
          {loading && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-catholic-logo rounded-full animate-spin"></div>
              <span className="text-sm">로딩 중...</span>
            </div>
          )}
        </div>
      )}
    </>
  )
}

