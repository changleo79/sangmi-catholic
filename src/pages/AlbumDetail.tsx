import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getAlbums, ensureDefaultAlbumExists, type AlbumWithCategory } from '../utils/storage'
import ImageLightbox from '../components/ImageLightbox'

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [album, setAlbum] = useState<AlbumWithCategory | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // useRef로 추적하여 무한 루프 방지
  const loadedAlbumIdRef = useRef<string | null>(null)
  const isLoadingRef = useRef(false)
  const mountedRef = useRef(true)

  // photos 배열을 안정적으로 가져오기
  const photos = album?.photos && Array.isArray(album.photos) ? album.photos : []

  // 앨범 로드 - useEffect와 완전히 분리
  const loadAlbumData = async (albumId: string) => {
    if (isLoadingRef.current || !mountedRef.current) {
      return
    }

    isLoadingRef.current = true
    setIsLoading(true)

    try {
      // 캐시 완전히 무효화
      if ((window as any).__albumsCache) {
        delete (window as any).__albumsCache
      }
      // storage.ts의 cachedData도 무효화
      if ((window as any).cachedData && (window as any).cachedData.albums) {
        (window as any).cachedData.albums = undefined
      }

      // 기본 앨범 확인
      ensureDefaultAlbumExists()

      // 모바일에서는 localStorage에서 직접 읽기
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      let albums: AlbumWithCategory[] = []
      
      if (isMobileDevice) {
        try {
          // 서버에서만 데이터 로드 (localStorage 사용 안 함)
          // albums는 이미 getAlbums로 서버에서 로드됨
          if (albums.length > 0) {
            console.log('[AlbumDetail] 모바일 - localStorage에 앨범 데이터 없음')
            albums = getAlbums(true)
          }
        } catch (e) {
          console.error('[AlbumDetail] 모바일 - localStorage 읽기 실패:', e)
          albums = getAlbums(true)
        }
      } else {
        // PC에서는 getAlbums 사용
        albums = getAlbums(true)
        console.log(`[AlbumDetail] PC - getAlbums로 로드: ID=${albumId}, 전체 앨범 수=${albums.length}`)
      }

      const found = albums.find(a => a.id === albumId)

      if (found && mountedRef.current) {
        const photosArray = Array.isArray(found.photos) ? found.photos : []
        const albumData: AlbumWithCategory = {
          ...found,
          photos: photosArray
        }

        // 이미 같은 앨범이 로드되어 있으면 업데이트하지 않음
        if (loadedAlbumIdRef.current === albumData.id) {
          console.log('[AlbumDetail] 이미 로드된 앨범입니다.')
          setIsLoading(false)
          isLoadingRef.current = false
          return
        }

        loadedAlbumIdRef.current = albumData.id
        setAlbum(albumData)
        setCurrentPhotoIndex(0)
        console.log('[AlbumDetail] 앨범 로드 완료:', { id: albumData.id, title: albumData.title, photosCount: photosArray.length })
      } else if (mountedRef.current) {
        console.warn('[AlbumDetail] 앨범을 찾을 수 없습니다:', albumId)
        setAlbum(null)
      }
    } catch (error) {
      console.error('[AlbumDetail] 앨범 로드 오류:', error)
      if (mountedRef.current) {
        setAlbum(null)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
        isLoadingRef.current = false
      }
    }
  }

  // 컴포넌트 마운트 시 mountedRef 초기화
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // ID가 변경될 때만 앨범 로드
  useEffect(() => {
    if (!id) {
      setAlbum(null)
      setIsLoading(false)
      loadedAlbumIdRef.current = null
      return
    }

    // ID가 변경되었거나 아직 로드되지 않은 경우에만 로드
    if (loadedAlbumIdRef.current !== id) {
      loadedAlbumIdRef.current = null
      loadAlbumData(id)
    }
  }, [id])

  // 이벤트 리스너는 별도 useEffect로 분리
  useEffect(() => {
    if (!id) return

    const handleAlbumsUpdate = () => {
      if (mountedRef.current && !isLoadingRef.current) {
        console.log('[AlbumDetail] albumsUpdated 이벤트 수신')
        loadedAlbumIdRef.current = null // 강제로 다시 로드
        loadAlbumData(id)
      }
    }

    const handleFocus = () => {
      if (mountedRef.current && !isLoadingRef.current) {
        console.log('[AlbumDetail] focus 이벤트 수신')
        loadedAlbumIdRef.current = null
        loadAlbumData(id)
      }
    }

    const handleVisibilityChange = () => {
      if (mountedRef.current && !document.hidden && !isLoadingRef.current) {
        console.log('[AlbumDetail] visibilitychange 이벤트 수신')
        loadedAlbumIdRef.current = null
        loadAlbumData(id)
      }
    }

    window.addEventListener('albumsUpdated', handleAlbumsUpdate)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // localStorage는 더 이상 사용하지 않음 - 서버에서만 데이터 로드
    // 이벤트 리스너만으로 충분
  }, [id])

  // 자동 재생 useEffect는 album이 변경될 때만 실행
  useEffect(() => {
    if (!isAutoPlay || !album || !album.photos || album.photos.length === 0) return
    
    const photosLength = album.photos.length
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photosLength)
    }, 4000)
    
    return () => clearInterval(timer)
  }, [isAutoPlay, album?.id, album?.photos?.length])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center text-gray-500">앨범 정보를 불러오는 중입니다...</div>
      </div>
    )
  }

  if (!album) {
    const isDraftId = id?.startsWith('draft-')
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-gray-500 text-lg mb-2">앨범을 찾을 수 없습니다.</p>
          {isDraftId && (
            <p className="text-gray-400 text-sm mb-4">
              이 앨범은 아직 저장되지 않은 임시 앨범입니다.<br />
              앨범 관리 페이지에서 저장 후 다시 시도해 주세요.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/albums"
              className="inline-block px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#7B1F4B' }}
            >
              앨범 목록으로 돌아가기
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="inline-block px-6 py-3 rounded-lg text-gray-600 font-semibold transition-all duration-300 hover:scale-105 border border-gray-200"
            >
              이전 페이지로 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  const goToPrevious = () => {
    if (photos.length === 0) return
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const goToNext = () => {
    if (photos.length === 0) return
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const handleDownload = async () => {
    const photo = photos[currentPhotoIndex]
    if (!photo) return

    try {
      if (photo.src.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = photo.src
        link.download = `${(photo.alt || `${album?.title || 'image'}`).replace(/\s+/g, '_')}.png`
        link.click()
        return
      }

      const response = await fetch(photo.src, { mode: 'cors' })
      if (!response.ok) throw new Error('다운로드 실패')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const baseName = photo.alt || `${album?.title || 'image'}-${currentPhotoIndex + 1}`
      link.download = `${baseName.replace(/\s+/g, '_')}.jpg`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('이미지 다운로드 실패:', error)
      window.open(photo.src, '_blank', 'noopener,noreferrer')
    }
  }

  const handleShare = async () => {
    const photo = photos[currentPhotoIndex]
    if (!photo) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: album.title,
          text: photo.alt || album.title,
          url: photo.src
        })
      } catch (error) {
        console.error('이미지 공유 실패:', error)
      }
    } else {
      alert('이 브라우저에서는 공유 기능이 지원되지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Link
              to="/albums"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-catholic-logo transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              앨범 목록으로
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-catholic-logo transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              이전 페이지
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{album.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>{album.date}</span>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)', color: '#7B1F4B' }}>
                  {album.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Viewer */}
        {photos.length > 0 ? (
          <div className="mb-8">
            <div
              className="relative w-full bg-black rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
              style={{ 
                height: 'clamp(300px, calc(100vh - 300px), 800px)',
                minHeight: '300px'
              }}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                key={`main-${album.id}-${currentPhotoIndex}-${photos[currentPhotoIndex]?.src?.substring(0, 20)}`}
                src={photos[currentPhotoIndex]?.src}
                alt={photos[currentPhotoIndex]?.alt || `${album.title} - ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ objectPosition: 'center' }}
                loading="eager"
                onError={(e) => {
                  console.error('[AlbumDetail] 이미지 로드 실패:', photos[currentPhotoIndex]?.src)
                  const target = e.currentTarget
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    parent.innerHTML = `
                      <div class="flex flex-col items-center justify-center h-full p-8 text-white">
                        <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>이미지를 불러올 수 없습니다.</p>
                      </div>
                    `
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToPrevious()
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
                  >
                    <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      goToNext()
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
                  >
                    <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Photo Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white text-sm flex items-center gap-3">
                <span>{currentPhotoIndex + 1} / {photos.length}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAutoPlay((prev) => !prev)
                  }}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                  </svg>
                  {isAutoPlay ? '정지' : '재생'}
                </button>
              </div>
            </div>

            {/* Photo Thumbnails */}
            {photos.length > 1 && (
              <div className="mt-6 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {photos.map((photo, index) => (
                  <button
                    key={`thumb-${album.id}-${index}-${photo.src?.substring(0, 20)}`}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentPhotoIndex
                        ? 'border-catholic-logo scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={index === currentPhotoIndex ? { borderColor: '#7B1F4B' } : {}}
                  >
                    <img
                      key={`thumb-img-${album.id}-${index}-${photo.src?.substring(0, 20)}`}
                      src={photo.src}
                      alt={photo.alt || `${album.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500">사진이 없습니다.</p>
          </div>
        )}

        {/* Image Lightbox */}
        <ImageLightbox
          isOpen={isLightboxOpen}
          imageSrc={photos[currentPhotoIndex]?.src || ''}
          imageAlt={photos[currentPhotoIndex]?.alt || `${album.title} - ${currentPhotoIndex + 1}`}
          onClose={() => setIsLightboxOpen(false)}
          onPrevious={photos.length > 1 ? goToPrevious : undefined}
          onNext={photos.length > 1 ? goToNext : undefined}
          hasPrevious={photos.length > 1}
          hasNext={photos.length > 1}
          onDownload={handleDownload}
          onShare={handleShare}
          onToggleAutoPlay={() => setIsAutoPlay((prev) => !prev)}
          isAutoPlaying={isAutoPlay}
          tags={photos[currentPhotoIndex]?.tags}
        />
      </div>
    </div>
  )
}
