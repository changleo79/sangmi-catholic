import { useState, useEffect, useCallback } from 'react'
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

  useEffect(() => {
    let cancelled = false
    let retryCount = 0
    const maxRetries = 5

    const loadAlbum = async (retry = false) => {
      if (cancelled) return
      
      try {
        // 재시도 시 대기 시간 증가
        const delay = retry ? Math.min(200 * retryCount, 1000) : 100
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // 캐시 무시하고 getAlbums() 사용
        ensureDefaultAlbumExists()
        const albums = getAlbums(true) // 강제 새로고침
        console.log(`[AlbumDetail] getAlbums()로 로드: ${albums.length}개 앨범`)
        
        console.log(`[AlbumDetail] 시도 ${retryCount + 1}/${maxRetries} - 로드된 앨범 목록:`, albums.map(a => ({ id: a.id, title: a.title, photosCount: a.photos?.length || 0 })))
        
        // ID로 앨범 찾기
        const found = id ? albums.find((a) => a.id === id) || null : null
        
        if (found) {
          console.log('[AlbumDetail] 앨범 찾음:', { id: found.id, title: found.title, photosCount: found.photos?.length || 0 })
          setAlbum(found)
          setCurrentPhotoIndex(0)
          setIsLoading(false)
          return
        }
        
        // 찾지 못한 경우
        console.warn(`[AlbumDetail] 앨범을 찾을 수 없습니다. ID: ${id}`)
        console.log('[AlbumDetail] 사용 가능한 앨범 IDs:', albums.map(a => a.id))
        
        if (id && retryCount < maxRetries) {
          console.warn(`[AlbumDetail] 재시도 중... (${retryCount + 1}/${maxRetries})`)
          retryCount++
          setTimeout(() => loadAlbum(true), 300)
          return
        }
        
        // 최대 재시도 횟수 초과
        console.error('[AlbumDetail] 최대 재시도 횟수 초과. 앨범을 찾을 수 없습니다.', {
          searchId: id,
          availableIds: albums.map(a => a.id),
          availableTitles: albums.map(a => a.title)
        })
        
        setAlbum(null)
        setIsLoading(false)
      } catch (error) {
        console.error('[AlbumDetail] 앨범 로드 오류:', error)
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(() => loadAlbum(true), 300)
        } else {
          setAlbum(null)
          setIsLoading(false)
        }
      }
    }

    // 초기 로드
    loadAlbum()

    const handleAlbumsUpdate = () => {
      if (!cancelled) {
        console.log('[AlbumDetail] albumsUpdated 이벤트 수신 - 데이터 다시 로드')
        retryCount = 0
        loadAlbum()
      }
    }

    const handleFocus = () => {
      if (!cancelled) {
        console.log('[AlbumDetail] focus 이벤트 수신 - 데이터 다시 로드')
        retryCount = 0
        loadAlbum()
      }
    }

    // visibilitychange 이벤트도 추가 (탭 전환 시)
    const handleVisibilityChange = () => {
      if (!cancelled && !document.hidden) {
        console.log('[AlbumDetail] visibilitychange 이벤트 수신 - 데이터 다시 로드')
        retryCount = 0
        loadAlbum()
      }
    }

    window.addEventListener('albumsUpdated', handleAlbumsUpdate)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      window.removeEventListener('albumsUpdated', handleAlbumsUpdate)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [id])

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

  const photos = album?.photos || []

  const goToPrevious = useCallback(() => {
    if (photos.length === 0) return
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }, [photos])

  const goToNext = useCallback(() => {
    if (photos.length === 0) return
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }, [photos])

  useEffect(() => {
    if (!isAutoPlay || photos.length === 0) return
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isAutoPlay, photos])

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
              style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={photos[currentPhotoIndex]?.src}
                alt={photos[currentPhotoIndex]?.alt || `${album.title} - ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                style={{ objectPosition: 'center' }}
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
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
                  >
                    <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={goToNext}
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
                <span>{currentPhotoIndex + 1} / {album.photos.length}</span>
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
                    key={index}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentPhotoIndex
                        ? 'border-catholic-logo scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={index === currentPhotoIndex ? { borderColor: '#7B1F4B' } : {}}
                  >
                    <img
                      src={photo.src}
                      alt={photo.alt || `${album.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
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

