import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NoticeItem } from '../../data/notices'
import { getNotices, saveNotices, exportNotices, importJSON, initializeData } from '../../utils/storage'
import { notices as defaultNotices } from '../../data/notices'

export default function NoticesManage() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<NoticeItem>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    content: '',
    imageUrl: '',
    linkUrl: ''
  })
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('url')

  useEffect(() => {
    loadNotices()
  }, [])

  const loadNotices = () => {
    const stored = getNotices()
    if (stored.length > 0) {
      setNotices(stored)
    } else {
      // 기본 데이터 로드
      setNotices(defaultNotices)
      saveNotices(defaultNotices)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newNotices = [...notices]
    
    if (editingIndex !== null) {
      newNotices[editingIndex] = formData
    } else {
      newNotices.unshift(formData)
    }
    
    setNotices(newNotices)
    saveNotices(newNotices)
    resetForm()
  }


  const handleDelete = (index: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newNotices = notices.filter((_, i) => i !== index)
      setNotices(newNotices)
      saveNotices(newNotices)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      content: '',
      imageUrl: '',
      linkUrl: ''
    })
    setImageInputType('url')
    setIsEditing(false)
    setEditingIndex(null)
  }

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData({ ...formData, imageUrl: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEdit = (index: number) => {
    const notice = notices[index]
    // imageUrl이 data:로 시작하면 업로드된 파일, 아니면 URL
    if (notice.imageUrl) {
      setImageInputType(notice.imageUrl.startsWith('data:') ? 'upload' : 'url')
    }
    setFormData(notice)
    setEditingIndex(index)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">공지사항 관리</h1>
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

        <div className="max-w-6xl mx-auto">
          {/* Export/Import 버튼 */}
          <div className="mb-6 flex gap-4 justify-end">
            <button
              onClick={async () => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'application/json'
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    try {
                      const data = await importJSON<NoticeItem[]>(file)
                      setNotices(data)
                      saveNotices(data)
                      await initializeData()
                      alert('데이터를 가져왔습니다.')
                    } catch (error) {
                      alert('JSON 파일을 불러오는데 실패했습니다.')
                    }
                  }
                }
                input.click()
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              JSON 가져오기
            </button>
            <button
              onClick={exportNotices}
              className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#7B1F4B' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
            >
              JSON 내보내기
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isEditing ? '공지사항 수정' : '새 공지사항 추가'}
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
                  요약 (목록에 표시)
                </label>
                <textarea
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  rows={3}
                  placeholder="공지사항 목록에 표시될 간단한 요약"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 내용 (선택)
                </label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  rows={8}
                  placeholder="상세 페이지에 표시될 전체 내용"
                />
                <p className="mt-1 text-xs text-gray-500">
                  💡 상세 내용을 입력하면 상세 페이지에서 표시됩니다. 없으면 요약만 표시됩니다.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이미지 (선택)
                </label>
                
                {/* 입력 방식 선택 */}
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="upload"
                      checked={imageInputType === 'upload'}
                      onChange={(e) => setImageInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">파일 업로드</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="url"
                      checked={imageInputType === 'url'}
                      onChange={(e) => setImageInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">URL 입력</span>
                  </label>
                </div>

                {imageInputType === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 이미지 파일을 선택하면 Base64로 변환되어 저장됩니다.
                    </p>
                    {formData.imageUrl && formData.imageUrl.startsWith('data:') && (
                      <div className="mt-3 w-full max-w-md rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={formData.imageUrl} alt="이미지 미리보기" className="w-full h-auto object-contain" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.imageUrl && !formData.imageUrl.startsWith('data:') ? formData.imageUrl : ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      placeholder="예: /images/notice.jpg 또는 https://..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 이미지 URL을 입력하세요. (예: /images/notice.jpg 또는 https://...)
                    </p>
                    {formData.imageUrl && !formData.imageUrl.startsWith('data:') && formData.imageUrl.trim() !== '' && (
                      <div className="mt-3 w-full max-w-md rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={formData.imageUrl} alt="이미지 미리보기" className="w-full h-auto object-contain" onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E이미지 없음%3C/text%3E%3C/svg%3E'
                        }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  링크 URL (선택)
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  placeholder="https://..."
                />
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">공지사항 목록</h2>
            <div className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">공지사항이 없습니다.</p>
              ) : (
                notices.map((notice, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 hover:border-catholic-logo/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{notice.date}</p>
                        {notice.summary && (
                          <p className="text-sm text-gray-500">{notice.summary}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="px-3 py-1 rounded text-sm text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                          style={{ backgroundColor: '#7B1F4B' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
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
    </div>
  )
}

