import { useState, useEffect, useMemo } from 'react'
import { getBulletins, type BulletinItem } from '../utils/storage'
import PdfViewerModal from '../components/PdfViewerModal'
import InfiniteScroll from '../components/InfiniteScroll'
import FilterBar, { FilterOptions } from '../components/FilterBar'
import LazyImage from '../components/LazyImage'

const ITEMS_PER_PAGE = 12

// 이미지 URL을 프록시를 통해 로드하는 함수
const getProxiedImageUrl = (url: string): string => {
  // data: URL이나 같은 도메인 이미지는 그대로 사용
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url
  }
  
  // 외부 이미지는 프록시를 통해 로드
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`
  }
  
  return url
}

// 모바일 감지 함수
const isMobile = () => {
  return window.innerWidth < 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         (window.matchMedia && window.matchMedia('(max-width: 767px)').matches)
}

export default function Bulletins() {
  const [bulletins, setBulletins] = useState<BulletinItem[]>([])
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinItem | null>(null)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [filters, setFilters] = useState<FilterOptions>({})

  // 필터링된 주보
  const filteredBulletins = useMemo(() => {
    return bulletins.filter((bulletin) => {
      // 연도 필터
      if (filters.year) {
        const bulletinYear = new Date(bulletin.date).getFullYear().toString()
        if (bulletinYear !== filters.year) {
          return false
        }
      }

      // 날짜 범위 필터
      if (filters.startDate) {
        const bulletinDate = new Date(bulletin.date)
        const startDate = new Date(filters.startDate)
        if (bulletinDate < startDate) {
          return false
        }
      }

      if (filters.endDate) {
        const bulletinDate = new Date(bulletin.date)
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (bulletinDate > endDate) {
          return false
        }
      }

      return true
    })
  }, [bulletins, filters])

  const loadBulletins = async (forceRefresh = false) => {
    // 초기 로드 시에만 서버에서 강제 로드, 이후에는 캐시 활용
    const loadedBulletins = await getBulletins(forceRefresh)
    
    // 최신순 정렬
    const sortedBulletins = loadedBulletins.sort((a: BulletinItem, b: BulletinItem) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    setBulletins(sortedBulletins)
  }

  useEffect(() => {
    // App.tsx에서 이미 initializeData()로 데이터를 로드했으므로 캐시 활용
    loadBulletins(false)

    // 주보 업데이트 이벤트 리스너만 유지 (어드민에서 저장 시에만 새로고침)
    const handleBulletinsUpdate = async () => {
      // 서버 저장 완료 대기 후 로드
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadBulletins(true) // 업데이트 이벤트 시에만 강제 새로고침
    }
    
    window.addEventListener('bulletinsUpdated', handleBulletinsUpdate)
    
    return () => {
      window.removeEventListener('bulletinsUpdated', handleBulletinsUpdate)
    }
  }, [])

  const handleBulletinClick = (bulletin: BulletinItem) => {
    if (bulletin && bulletin.fileUrl) {
      // 모달이 열릴 때 페이지 스크롤을 맨 위로 이동 (News 페이지와 동일하게)
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      
      setSelectedBulletin(bulletin)
      setIsPdfModalOpen(true)
    } else {
      console.error('[Bulletins] 주보 데이터 없음:', bulletin)
      alert('주보 파일을 불러올 수 없습니다.')
    }
  }

  // 표시할 항목들 계산
  const displayedBulletins = useMemo(() => {
    return filteredBulletins.slice(0, displayedCount)
  }, [filteredBulletins, displayedCount])

  const hasMore = displayedCount < filteredBulletins.length

  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredBulletins.length))
  }

  // 필터 변경 시 카운트 리셋
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [filters])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            주보 안내
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-4" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          <p className="text-gray-600 text-lg mb-6">
            {filteredBulletins.length > 0 ? `총 ${filteredBulletins.length}개의 주보가 있습니다.` : '등록된 주보가 없습니다.'}
            {filters.year || filters.startDate || filters.endDate ? ` (필터 적용: ${bulletins.length}개 중)` : bulletins.length > 0 ? ` (전체 ${bulletins.length}개)` : ''}
          </p>
          
          {/* 필터 바 */}
          {bulletins.length > 0 && (
            <FilterBar
              onFilterChange={setFilters}
              showYearFilter={true}
              showDateRange={true}
            />
          )}
        </div>

        {/* Bulletins Grid */}
        {displayedBulletins.length > 0 ? (
          <InfiniteScroll
            hasMore={hasMore}
            loadMore={loadMore}
            loading={false}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {displayedBulletins.map((bulletin) => {
              // 썸네일 URL 우선, 없거나 빈 문자열이면 fileUrl이 이미지인 경우 사용
              const isImageFile = bulletin.fileUrl && (
                bulletin.fileUrl.startsWith('data:image/') || 
                bulletin.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ||
                (bulletin.fileUrl.startsWith('http') && bulletin.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i))
              )
              
              // thumbnailUrl이 없거나 빈 문자열이면 이미지 파일인 경우 fileUrl 사용
              const thumbnailUrl = (bulletin.thumbnailUrl && bulletin.thumbnailUrl.trim() !== '') 
                ? bulletin.thumbnailUrl 
                : (isImageFile ? bulletin.fileUrl : null)
              
              return (
                <div
                  key={bulletin.id}
                  onClick={() => handleBulletinClick(bulletin)}
                  onTouchStart={(e) => {
                    if (window.innerWidth < 768) {
                      e.stopPropagation()
                      const touch = e.touches[0]
                      if (touch) {
                        (e.currentTarget as any).__touchStartX = touch.clientX
                        ;(e.currentTarget as any).__touchStartY = touch.clientY
                      }
                    }
                  }}
                  onTouchMove={(e) => {
                    if (window.innerWidth < 768) {
                      const touch = e.touches[0]
                      if (touch && (e.currentTarget as any).__touchStartX !== undefined) {
                        const deltaX = Math.abs(touch.clientX - (e.currentTarget as any).__touchStartX)
                        const deltaY = Math.abs(touch.clientY - (e.currentTarget as any).__touchStartY)
                        if (deltaX > 10 || deltaY > 10) {
                          ;(e.currentTarget as any).__isScrolling = true
                        }
                      }
                    }
                  }}
                  onTouchEnd={(e) => {
                    if (window.innerWidth < 768) {
                      const isScrolling = (e.currentTarget as any).__isScrolling
                      if (!isScrolling) {
                        e.preventDefault()
                        e.stopPropagation()
                        handleBulletinClick(bulletin)
                      }
                      delete (e.currentTarget as any).__touchStartX
                      delete (e.currentTarget as any).__touchStartY
                      delete (e.currentTarget as any).__isScrolling
                    }
                  }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl active:shadow-xl transition-all duration-500 border border-gray-100 hover:border-catholic-logo/20 active:border-catholic-logo/40 group cursor-pointer hover:-translate-y-1 active:scale-95 touch-manipulation overflow-hidden"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                    {thumbnailUrl ? (
                      <LazyImage
                        src={getProxiedImageUrl(bulletin.fileUrl || '')}
                        thumbnailUrl={getProxiedImageUrl(thumbnailUrl)}
                        alt={bulletin.title}
                        className="group-hover:scale-105 transition-transform duration-500"
                        loading={bulletins.indexOf(bulletin) < 6 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={bulletins.indexOf(bulletin) === 0 ? "high" : bulletins.indexOf(bulletin) < 6 ? "auto" : "low"}
                        width="300"
                        height="400"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ 
                          backgroundColor: '#f3f4f6', 
                          pointerEvents: 'none'
                        }}
                        onError={(e) => {
                          console.error('[Bulletins] 썸네일 로드 실패:', thumbnailUrl)
                          const target = e.currentTarget as HTMLImageElement
                          const parent = target.parentElement?.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                <div class="text-center p-4">
                                  <svg class="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                  </svg>
                                  <p class="text-sm text-gray-500">주보</p>
                                </div>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <div className="text-center p-4">
                          <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <p className="text-sm text-gray-500">주보</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2 group-hover:text-catholic-logo transition-colors">
                      {bulletin.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(bulletin.date).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {bulletin.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {bulletin.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
            </div>
          </InfiniteScroll>
        ) : (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-500 text-lg">등록된 주보가 없습니다.</p>
          </div>
        )}
      </div>
      {/* PDF Viewer Modal - News 페이지와 동일한 위치로 이동 */}
      {selectedBulletin && selectedBulletin.fileUrl && (
        <PdfViewerModal
          isOpen={isPdfModalOpen}
          title={selectedBulletin.title}
          description={selectedBulletin.description}
          fileUrl={selectedBulletin.fileUrl}
          fileUrl2={selectedBulletin.fileUrl2}
          onClose={() => {
            setIsPdfModalOpen(false)
            setTimeout(() => setSelectedBulletin(null), 300)
          }}
        />
      )}
    </div>
  )
}

