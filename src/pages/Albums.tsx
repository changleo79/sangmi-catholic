import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAlbums, getAlbumCategories, initializeData, ensureDefaultAlbumExists, type AlbumWithCategory } from '../utils/storage'

export default function Albums() {
  const [albums, setAlbums] = useState<AlbumWithCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const [tagQuery, setTagQuery] = useState<string>('')
  const categories = getAlbumCategories()

  useEffect(() => {
    // 초기 데이터 로드
    // 모바일에서는 initializeData를 호출하지 않음 (localStorage 데이터 보호)
    const loadData = async () => {
      const isMobileDevice = isMobile()
      if (!isMobileDevice) {
        // PC에서만 initializeData 호출 (모바일에서는 localStorage 직접 읽기)
        await initializeData()
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      await loadAlbums()
      // 기본 앨범이 없으면 초기 데이터 생성
      const stored = getAlbums(true) // 강제 새로고침
      if (stored.length === 0) {
        initializeDefaultAlbum()
        await loadAlbums() // 다시 로드
      }
    }
    loadData()

    // 페이지 포커스 시 데이터 다시 로드
    const handleFocus = async () => {
      console.log('[Albums] focus 이벤트 - 데이터 다시 로드')
      // 캐시 무시하고 강제 새로고침
      if ((window as any).__albumsCache) {
        delete (window as any).__albumsCache
      }
      await loadAlbums()
    }
    
    // 앨범 업데이트 이벤트 리스너 (모바일/PC 모두 동작)
    const handleAlbumsUpdate = () => {
      console.log('[Albums] albumsUpdated 이벤트 수신 - 데이터 다시 로드')
      // 캐시 무시하고 강제 새로고침
      if ((window as any).__albumsCache) {
        delete (window as any).__albumsCache
      }
      // 약간의 지연 후 로드 (저장 완료 대기)
      setTimeout(async () => {
        await loadAlbums()
      }, 100)
    }
    
    // visibilitychange 이벤트 (탭 전환, 모바일에서 앱 전환 등)
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        console.log('[Albums] visibilitychange 이벤트 - 데이터 다시 로드')
        // 캐시 무시하고 강제 새로고침
        if ((window as any).__albumsCache) {
          delete (window as any).__albumsCache
        }
        await loadAlbums()
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('focus', handleFocus)
    window.addEventListener('albumsUpdated', handleAlbumsUpdate)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // 모바일에서도 이벤트가 제대로 작동하도록 추가 이벤트
    // localStorage 변경 감지 (storage 이벤트는 다른 탭에서만 발생하므로 직접 체크)
    let lastAlbumsData: string | null = null
    const checkAlbumsChange = async () => {
      // 'admin_albums' 키 사용 (storage.ts의 ALBUMS_KEY)
      const currentData = localStorage.getItem('admin_albums')
      if (currentData !== lastAlbumsData) {
        console.log('[Albums] localStorage 변경 감지 - 데이터 다시 로드', {
          oldLength: lastAlbumsData ? JSON.parse(lastAlbumsData).length : 0,
          newLength: currentData ? JSON.parse(currentData).length : 0
        })
        lastAlbumsData = currentData
        // 캐시 무효화 후 로드
        if ((window as any).__albumsCache) {
          delete (window as any).__albumsCache
        }
        if ((window as any).cachedData && (window as any).cachedData.albums) {
          (window as any).cachedData.albums = undefined
        }
        await loadAlbums()
      }
    }
    
    // 초기값 설정
    lastAlbumsData = localStorage.getItem('admin_albums')
    
    // 모바일에서는 더 자주 체크
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
    if (isMobileDevice) {
      // 모바일에서는 페이지 표시 시마다 체크 (더 자주)
      const intervalId = setInterval(() => {
        if (!document.hidden) {
          checkAlbumsChange()
        }
      }, 1000) // 1초마다 체크
      
      return () => {
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('albumsUpdated', handleAlbumsUpdate)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        clearInterval(intervalId)
      }
    } else {
      // PC에서는 덜 자주 체크
      const intervalId = setInterval(() => {
        if (!document.hidden) {
          checkAlbumsChange()
        }
      }, 3000) // 3초마다 체크
      
      return () => {
        window.removeEventListener('focus', handleFocus)
        window.removeEventListener('albumsUpdated', handleAlbumsUpdate)
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        clearInterval(intervalId)
      }
    }

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('albumsUpdated', handleAlbumsUpdate)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // 모바일 감지 함수 (더 정확한 감지)
  const isMobile = () => {
    return window.innerWidth < 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.matchMedia && window.matchMedia('(max-width: 767px)').matches)
  }

  const loadAlbums = async () => {
    try {
      // 캐시 완전히 무효화
      if ((window as any).__albumsCache) {
        delete (window as any).__albumsCache
      }
      // storage.ts의 cachedData도 무효화
      if ((window as any).cachedData && (window as any).cachedData.albums) {
        (window as any).cachedData.albums = undefined
      }
      
      // 모바일/PC 모두 동일하게 getAlbums 사용 (localStorage 우선, 서버 동기화)
      // getAlbums는 이미 localStorage를 우선시하고, 없으면 서버에서 로드하도록 구현됨
      ensureDefaultAlbumExists()
      const loadedAlbums = getAlbums(true) // forceRefresh=true: localStorage 직접 읽기, 없으면 서버에서 로드 시도
      
      const isMobileDevice = isMobile()
      console.log('[Albums]', isMobileDevice ? '모바일' : 'PC', '- getAlbums로 로드:', loadedAlbums.length, '개 앨범', loadedAlbums.map(a => ({ id: a.id, title: a.title, photosCount: a.photos?.length || 0 })))
      
      // 디버깅: localStorage 직접 확인
      const directCheck = localStorage.getItem('admin_albums')
      if (directCheck) {
        const directParsed = JSON.parse(directCheck)
        console.log('[Albums] localStorage 직접 확인:', directParsed.length, '개 앨범', directParsed.map((a: any) => ({ id: a.id, title: a.title })))
      } else {
        console.log('[Albums] localStorage 직접 확인: 데이터 없음')
      }
      
      // setAlbums로 상태 업데이트
      setAlbums(loadedAlbums)
      
      // 유효성 검사 및 필터링
      const validAlbums = albums.map((album: any) => ({
        ...album,
        photos: Array.isArray(album.photos) ? album.photos : []
      })).filter((album: any) => {
        // draft-로 시작하지만 실제로 저장된 앨범만 표시
        if (album.id.startsWith('draft-')) {
          return album.photos && album.photos.length > 0 && album.title && album.title.trim() !== ''
        }
        return true
      })
      
      setAlbums(validAlbums)
    } catch (error) {
      console.error('[Albums] 로드 오류:', error)
      // 에러 발생 시 빈 배열로 설정
      setAlbums([])
    }
  }

  const initializeDefaultAlbum = () => {
    ensureDefaultAlbumExists()
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            성당앨범
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
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
        {filteredAlbums.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">앨범이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAlbums.map((album) => (
              <Link
                key={album.id}
                to={`/albums/${album.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                  {album.cover ? (
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      이미지 없음
                    </div>
                  )}
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
                          <span key={`${album.id}-${tag}`} className="px-2 py-1 text-[11px] rounded-full bg-gray-100 text-gray-600">
                            #{tag}
                          </span>
                        ))}
                        {Array.from(new Set(album.photos.flatMap((photo) => photo.tags || []))).length > 6 && (
                          <span className="text-[11px] text-gray-400">+ 더보기</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

