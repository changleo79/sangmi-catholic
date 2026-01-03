import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAlbums, getAlbumCategories, type AlbumWithCategory } from '../utils/storage'
import InfiniteScroll from '../components/InfiniteScroll'
import Pagination from '../components/Pagination'
import LazyImage from '../components/LazyImage'

const ITEMS_PER_PAGE = 12

export default function Albums() {
  const [albums, setAlbums] = useState<AlbumWithCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const [tagQuery, setTagQuery] = useState<string>('')
  const [displayMode, setDisplayMode] = useState<'infinite' | 'pagination'>('infinite')
  const [currentPage, setCurrentPage] = useState(1)
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const categories = getAlbumCategories()

  // 모바일 감지 함수
  const isMobile = () => {
    return window.innerWidth < 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.matchMedia && window.matchMedia('(max-width: 767px)').matches)
  }

  useEffect(() => {
    // App.tsx에서 이미 initializeData()로 데이터를 로드했으므로 캐시 활용
    loadAlbums(false)

    // 앨범 업데이트 이벤트 리스너만 유지 (어드민에서 저장 시에만 새로고침)
    const handleAlbumsUpdate = async () => {
      // 서버 저장 완료 대기 후 로드
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadAlbums(true) // 업데이트 이벤트 시에만 강제 새로고침
    }
    
    window.addEventListener('albumsUpdated', handleAlbumsUpdate)
    
    return () => {
      window.removeEventListener('albumsUpdated', handleAlbumsUpdate)
    }
  }, [])

  const loadAlbums = async (forceRefresh = false) => {
    try {
      // App.tsx에서 이미 initializeData()로 데이터를 로드했으므로 캐시 활용
      const loadedAlbums = await getAlbums(forceRefresh)
      
      // 유효성 검사 및 필터링
      const validAlbums = loadedAlbums.map((album: any) => ({
        ...album,
        photos: Array.isArray(album.photos) ? album.photos : []
      })).filter((album: any) => {
        // draft-로 시작하지만 실제로 저장된 앨범만 표시
        if (album.id.startsWith('draft-')) {
          return album.photos && album.photos.length > 0 && album.title && album.title.trim() !== ''
        }
        return true
      }).sort((a: any, b: any) => {
        // 최신순 정렬
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      })
      
      setAlbums(validAlbums)
    } catch (error) {
      console.error('[Albums] 로드 오류:', error)
      setAlbums([])
    }
  }


  const filteredAlbums = useMemo(() => {
    const query = tagQuery.trim().toLowerCase()
    return albums.filter((album) => {
      // draft-로 시작하지만 실제로 저장된 앨범은 표시 (photos와 title이 있으면 저장된 것으로 간주)
      if (album.id.startsWith('draft-')) {
        const hasContent = album.photos && album.photos.length > 0 && album.title && album.title.trim() !== ''
        if (!hasContent) {
          return false // 저장되지 않은 임시 앨범만 제외
        }
      }
      const categoryMatch = selectedCategory === '전체' || album.category === selectedCategory
      const tagMatch = query
        ? album.photos.some((photo) =>
            photo.tags?.some((tag) => tag.toLowerCase().includes(query))
          )
        : true
      return categoryMatch && tagMatch
    })
  }, [albums, selectedCategory, tagQuery])

  // 표시할 항목들 계산
  const displayedAlbums = useMemo(() => {
    if (displayMode === 'infinite') {
      return filteredAlbums.slice(0, displayedCount)
    } else {
      const start = (currentPage - 1) * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE
      return filteredAlbums.slice(start, end)
    }
  }, [filteredAlbums, displayMode, displayedCount, currentPage])

  const totalPages = Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE)
  const hasMore = displayedCount < filteredAlbums.length

  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredAlbums.length))
  }

  // 필터 변경 시 페이지/카운트 리셋
  useEffect(() => {
    setCurrentPage(1)
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [selectedCategory, tagQuery])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            본당앨범
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-4" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          <p className="text-gray-600 text-lg mb-6">
            총 {filteredAlbums.length}개의 앨범
          </p>
          
          {/* 표시 모드 선택 */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => {
                setDisplayMode('infinite')
                setDisplayedCount(ITEMS_PER_PAGE)
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                displayMode === 'infinite'
                  ? 'bg-catholic-logo text-white border-catholic-logo'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              자동 로드
            </button>
            <button
              onClick={() => {
                setDisplayMode('pagination')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                displayMode === 'pagination'
                  ? 'bg-catholic-logo text-white border-catholic-logo'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              페이지 번호
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap justify-center gap-3 px-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 sm:px-6 py-2.5 rounded-full font-medium transition-all duration-300 text-sm sm:text-base touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedCategory === category
                  ? 'text-white shadow-lg focus:ring-catholic-logo'
                  : 'text-gray-700 bg-white border border-gray-200 hover:border-catholic-logo/30 active:bg-gray-50 focus:ring-catholic-logo/50'
              }`}
              style={selectedCategory === category ? { backgroundColor: '#7B1F4B', color: '#ffffff' } : {}}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = '#7B1F4B'
                  e.currentTarget.style.color = '#7B1F4B'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.borderColor = ''
                  e.currentTarget.style.color = ''
                }
              }}
              onTouchStart={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.backgroundColor = 'rgba(123, 31, 75, 0.05)'
                }
              }}
              onTouchEnd={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.backgroundColor = ''
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mb-12 max-w-xl mx-auto">
          <input
            type="text"
            value={tagQuery}
            onChange={(e) => setTagQuery(e.target.value)}
            placeholder="태그로 검색해보세요 (예: 전례, 청년, 행사)"
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-catholic-logo focus:border-transparent shadow-sm"
          />
        </div>

        {/* Albums Grid */}
        {displayedAlbums.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">앨범이 없습니다.</p>
          </div>
        ) : (
          <InfiniteScroll
            hasMore={displayMode === 'infinite' && hasMore}
            loadMore={loadMore}
            loading={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedAlbums.map((album) => (
              <Link
                key={album.id}
                to={`/albums/${album.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                  {(() => {
                    // 썸네일 우선 사용 (빠른 로딩)
                    const firstPhoto = album.photos?.[0]
                    const thumbnailUrl = firstPhoto?.thumbnailUrl
                    const coverUrl = album.cover || firstPhoto?.src
                    
                    if (!coverUrl && !thumbnailUrl) {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          이미지 없음
                        </div>
                      )
                    }
                    
                    return (
                      <LazyImage
                        src={coverUrl}
                        thumbnailUrl={thumbnailUrl}
                        alt={album.title}
                        className="transition-transform duration-500 group-hover:scale-110"
                        width="400"
                        height="300"
                        style={{ backgroundColor: '#f3f4f6' }}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3E이미지 없음%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    )
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2 text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">{album.photos.length}장</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col gap-2 mb-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold w-fit" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)', color: '#7B1F4B' }}>
                        {album.category}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{album.date}</span>
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-catholic-logo transition-colors leading-tight">
                      {album.title}
                    </h3>
                    {album.photos.some((photo) => photo.tags?.length) && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {Array.from(new Set(album.photos.flatMap((photo) => photo.tags || []))).slice(0, 6).map((tag) => (
                          <span key={`${album.id}-${tag}`} className="px-2 py-1 text-xs sm:text-[11px] rounded-full bg-gray-100 text-gray-600">
                            #{tag}
                          </span>
                        ))}
                        {Array.from(new Set(album.photos.flatMap((photo) => photo.tags || []))).length > 6 && (
                          <span className="text-xs sm:text-[11px] text-gray-400">+ 더보기</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
              ))}
            </div>
          </InfiniteScroll>
        )}
        
        {/* 페이지네이션 */}
        {displayMode === 'pagination' && filteredAlbums.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredAlbums.length}
          />
        )}
      </div>
    </div>
  )
}

