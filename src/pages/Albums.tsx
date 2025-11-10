import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAlbums, saveAlbums, getAlbumCategories, type AlbumWithCategory } from '../utils/storage'
import img01 from '../../사진파일/KakaoTalk_20251104_172439243_01.jpg'
import img02 from '../../사진파일/KakaoTalk_20251104_172439243_02.jpg'
import img03 from '../../사진파일/KakaoTalk_20251104_172439243_03.jpg'
import img04 from '../../사진파일/KakaoTalk_20251104_172439243_04.jpg'

export default function Albums() {
  const [albums, setAlbums] = useState<AlbumWithCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const [tagQuery, setTagQuery] = useState<string>('')
  const categories = getAlbumCategories()

  useEffect(() => {
    // 페이지 포커스 시 데이터 다시 로드
    const handleFocus = () => {
      loadAlbums()
    }
    
    // JSON 파일에서 데이터 로드 (initializeData가 이미 호출됨)
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      loadAlbums()
      // 기본 앨범이 없으면 초기 데이터 생성
      const stored = getAlbums()
      if (stored.length === 0) {
        initializeDefaultAlbum()
        loadAlbums() // 다시 로드
      }
    }
    loadData()
    
    // 페이지 포커스 시 데이터 다시 로드 (다른 탭에서 관리자가 수정한 경우)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadAlbums = () => {
    const stored = getAlbums()
    setAlbums(stored)
  }

  const initializeDefaultAlbum = () => {
    // 기본 앨범 데이터 생성 (4개 이미지)
    const defaultAlbum: AlbumWithCategory = {
      id: Date.now().toString(),
      title: '상미성당 앨범',
      date: new Date().toISOString().split('T')[0],
      cover: img01,
      category: '행사',
      photos: [
        { src: img01, alt: '성당 사진 1' },
        { src: img02, alt: '성당 사진 2' },
        { src: img03, alt: '성당 사진 3' },
        { src: img04, alt: '성당 사진 4' }
      ]
    }
    const albums = getAlbums()
    albums.push(defaultAlbum)
    saveAlbums(albums)
  }

  const filteredAlbums = useMemo(() => {
    return albums.filter((album) => {
      const categoryMatch = selectedCategory === '전체' || album.category === selectedCategory
      const tagMatch = tagQuery.trim()
        ? album.photos.some((photo) =>
            photo.tags?.some((tag) => tag.includes(tagQuery.trim()))
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

