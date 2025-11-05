import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAlbums, type AlbumWithCategory } from '../utils/storage'
import ImageLightbox from '../components/ImageLightbox'

export default function AlbumDetail() {
  const { id } = useParams<{ id: string }>()
  const [album, setAlbum] = useState<AlbumWithCategory | null>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  useEffect(() => {
    if (id) {
      const albums = getAlbums()
      const found = albums.find(a => a.id === id)
      setAlbum(found || null)
    }
  }, [id])

  if (!album) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">앨범을 찾을 수 없습니다.</p>
          <Link
            to="/albums"
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#7B1F4B' }}
          >
            앨범 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + album.photos.length) % album.photos.length)
  }

  const goToNext = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % album.photos.length)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/albums"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-catholic-logo transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            앨범 목록으로
          </Link>
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
        {album.photos.length > 0 ? (
          <div className="mb-8">
            <div 
              className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={album.photos[currentPhotoIndex].src}
                alt={album.photos[currentPhotoIndex].alt || `${album.title} - ${currentPhotoIndex + 1}`}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
              
              {/* Navigation Arrows */}
              {album.photos.length > 1 && (
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white text-sm">
                {currentPhotoIndex + 1} / {album.photos.length}
              </div>
            </div>

            {/* Photo Thumbnails */}
            {album.photos.length > 1 && (
              <div className="mt-6 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {album.photos.map((photo, index) => (
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
          imageSrc={album.photos[currentPhotoIndex]?.src || ''}
          imageAlt={album.photos[currentPhotoIndex]?.alt || `${album.title} - ${currentPhotoIndex + 1}`}
          onClose={() => setIsLightboxOpen(false)}
          onPrevious={goToPrevious}
          onNext={goToNext}
          hasPrevious={album.photos.length > 1}
          hasNext={album.photos.length > 1}
        />
      </div>
    </div>
  )
}

