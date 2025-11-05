import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAlbums, saveAlbums, getAlbumCategories, type AlbumWithCategory } from '../utils/storage'
import img01 from '../../사진파일/KakaoTalk_20251104_172439243_01.jpg'
import img02 from '../../사진파일/KakaoTalk_20251104_172439243_02.jpg'
import img03 from '../../사진파일/KakaoTalk_20251104_172439243_03.jpg'
import img04 from '../../사진파일/KakaoTalk_20251104_172439243_04.jpg'

export default function Albums() {
  const [albums, setAlbums] = useState<AlbumWithCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('전체')
  const categories = getAlbumCategories()

  useEffect(() => {
    loadAlbums()
    // 기본 앨범이 없으면 초기 데이터 생성
    const stored = getAlbums()
    if (stored.length === 0) {
      initializeDefaultAlbum()
      loadAlbums() // 다시 로드
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

  const filteredAlbums = selectedCategory === '전체' 
    ? albums 
    : albums.filter(album => album.category === selectedCategory)

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
        <div className="mb-12 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'text-white shadow-lg'
                  : 'text-gray-700 bg-white border border-gray-200 hover:border-catholic-logo/30'
              }`}
              style={selectedCategory === category ? { backgroundColor: '#7B1F4B' } : {}}
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
            >
              {category}
            </button>
          ))}
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
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)', color: '#7B1F4B' }}>
                      {album.category}
                    </span>
                    <span className="text-sm text-gray-500">{album.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">
                    {album.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

