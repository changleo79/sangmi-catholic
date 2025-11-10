import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlbumWithCategory, getAlbums, saveAlbums, getAlbumCategories, initializeData, ensureDefaultAlbumExists } from '../../utils/storage'
import type { AlbumPhoto } from '../../data/albums'

export default function AlbumsManage() {
  const [albums, setAlbums] = useState<AlbumWithCategory[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AlbumWithCategory>({
    id: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    cover: '',
    category: '주일 미사',
    photos: []
  })
  const [newPhotoSrc, setNewPhotoSrc] = useState('')
  const [newPhotoAlt, setNewPhotoAlt] = useState('')
  const [newPhotoTags, setNewPhotoTags] = useState('')
  const categories = getAlbumCategories().filter(c => c !== '전체')

  useEffect(() => {
    initializeDefaultAlbum()
    loadAlbums()
  }, [])

  const loadAlbums = () => {
    const stored = getAlbums()
    setAlbums(stored)
  }

  const initializeDefaultAlbum = () => {
    ensureDefaultAlbumExists()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 커버 이미지가 없으면 첫 번째 사진을 자동으로 사용
    let finalCover = formData.cover
    if (!finalCover && formData.photos.length > 0) {
      finalCover = formData.photos[0].src
    }
    
    const albumData = {
      ...formData,
      cover: finalCover || '' // 여전히 없으면 빈 문자열
    }
    
    const newAlbums = [...albums]
    
    if (editingId) {
      const index = newAlbums.findIndex(a => a.id === editingId)
      if (index !== -1) {
        newAlbums[index] = albumData
      }
    } else {
      const newId = Date.now().toString()
      newAlbums.unshift({ ...albumData, id: newId })
    }
    
    setAlbums(newAlbums)
    saveAlbums(newAlbums)
    // 캐시 업데이트를 위해 initializeData 호출
    initializeData()
    resetForm()
  }

  const handleEdit = (album: AlbumWithCategory) => {
    setFormData(album)
    setEditingId(album.id)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newAlbums = albums.filter(a => a.id !== id)
      setAlbums(newAlbums)
      saveAlbums(newAlbums)
      // 캐시 업데이트를 위해 initializeData 호출
      initializeData()
    }
  }

  const parseTags = (value: string) => value.split(',').map(tag => tag.trim()).filter(Boolean)

  const addPhoto = () => {
    if (newPhotoSrc.trim()) {
      setFormData({
        ...formData,
        photos: [...formData.photos, { src: newPhotoSrc, alt: newPhotoAlt || undefined, tags: parseTags(newPhotoTags) }]
      })
      setNewPhotoSrc('')
      setNewPhotoAlt('')
      setNewPhotoTags('')
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index)
    setFormData({ ...formData, photos: newPhotos })
  }

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      date: new Date().toISOString().split('T')[0],
      cover: '',
      category: '주일 미사',
      photos: []
    })
    setIsEditing(false)
    setEditingId(null)
    setNewPhotoSrc('')
    setNewPhotoAlt('')
    setNewPhotoTags('')
    loadAlbums()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">성당앨범 관리</h1>
              <div className="w-24 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              ← 대시보드
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isEditing ? '앨범 수정' : '새 앨범 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  커버 이미지 URL (선택)
                  {(!formData.cover && formData.photos.length > 0) && (
                    <span className="ml-2 text-xs text-gray-500">
                      (첫 번째 사진이 자동으로 사용됩니다)
                    </span>
                  )}
                </label>
                <input
                  type="url"
                  value={formData.cover}
                  onChange={(e) => setFormData({ ...formData, cover: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  placeholder="https://... 또는 /albums/... 또는 프로젝트 내 이미지 경로 (선택사항)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  💡 사용 방법: 외부 URL(https://...), 프로젝트 내 경로(/albums/...), 또는 로컬 이미지 경로를 입력하세요.
                  <br />
                  💡 비워두면 첫 번째 사진이 자동으로 커버 이미지로 사용됩니다.
                  <br />
                  예시: /albums/2025-11-성탄준비/001.jpg 또는 https://example.com/image.jpg
                </p>
                {(formData.cover || formData.photos.length > 0) && (
                  <div className="mt-3 w-32 h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img 
                      src={formData.cover || formData.photos[0]?.src || ''} 
                      alt="커버 미리보기" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3E이미지 없음%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* 사진 추가 */}
              <div className="border-t border-gray-200 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사진 추가
                </label>
                
                {/* 파일 업로드 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    파일 업로드 (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      files.forEach((file) => {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          const base64 = reader.result as string
                          setFormData(prev => ({
                            ...prev,
                            photos: [...prev.photos, { src: base64, alt: file.name }]
                          }))
                        }
                        reader.readAsDataURL(file)
                      })
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 파일을 선택하면 Base64로 변환되어 저장됩니다. (브라우저에 저장됨)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    또는 URL로 추가
                  </label>
                  <input
                    type="url"
                    value={newPhotoSrc}
                    onChange={(e) => setNewPhotoSrc(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    placeholder="이미지 URL (예: /albums/2025-11/001.jpg 또는 https://...)"
                  />
                  <p className="text-xs text-gray-500">
                    💡 외부 URL, 프로젝트 내 경로, 또는 로컬 이미지 경로를 입력하세요.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      이미지 ALT 텍스트 (선택)
                    </label>
                    <input
                      type="text"
                      value={newPhotoAlt}
                      onChange={(e) => setNewPhotoAlt(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      placeholder="예: 부활대축일 미사"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      태그 (쉼표)
                    </label>
                    <input
                      type="text"
                      value={newPhotoTags}
                      onChange={(e) => setNewPhotoTags(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      placeholder="예: 부활, 전례, 합창"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addPhoto}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    URL로 사진 추가
                  </button>
                </div>
                
                {/* 추가된 사진 목록 */}
                {formData.photos.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm font-medium text-gray-700">사진 목록 ({formData.photos.length}개)</p>
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2 truncate">{photo.src}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">ALT 텍스트</label>
                            <input
                              type="text"
                              value={photo.alt || ''}
                              onChange={(e) => {
                                const updated = [...formData.photos]
                                updated[index] = { ...photo, alt: e.target.value || undefined }
                                setFormData({ ...formData, photos: updated })
                              }}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-catholic-logo focus:border-transparent text-sm"
                              placeholder="사진 설명"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">태그 (쉼표)</label>
                            <input
                              type="text"
                              value={photo.tags?.join(', ') || ''}
                              onChange={(e) => {
                                const updated = [...formData.photos]
                                updated[index] = { ...photo, tags: parseTags(e.target.value) }
                                setFormData({ ...formData, photos: updated })
                              }}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-catholic-logo focus:border-transparent text-sm"
                              placeholder="예: 전례, 청년"
                            />
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs text-gray-500">태그: {photo.tags?.length ? photo.tags.join(', ') : '없음'}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  {isEditing ? '수정' : '추가'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">앨범 목록</h2>
            <div className="space-y-4">
              {albums.length === 0 ? (
                <p className="text-gray-500 text-center py-8">앨범이 없습니다.</p>
              ) : (
                albums.map((album) => (
                  <div
                    key={album.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-catholic-logo/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {album.cover ? (
                          <img src={album.cover} alt={album.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">이미지 없음</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{album.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{album.date}</p>
                        <p className="text-xs text-gray-500 mb-2">
                          <span className="inline-block px-2 py-1 rounded bg-gray-100">{album.category}</span>
                        </p>
                        <p className="text-xs text-gray-500">사진 {album.photos.length}개</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(album)}
                          className="px-3 py-1 rounded text-sm text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                          style={{ backgroundColor: '#7B1F4B' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(album.id)}
                          className="px-3 py-1 rounded text-sm bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

