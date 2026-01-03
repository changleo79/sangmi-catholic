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
    linkUrl: '',
    isImportant: false
  })
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('url')
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadNotices()
  }, [])

  const loadNotices = async () => {
    console.log('[NoticesManage] 서버에서 공지사항 로드 시작')
    // 캐시 무효화하고 서버에서 강제 로드
    if ((window as any).cachedData && (window as any).cachedData.notices) {
      (window as any).cachedData.notices = undefined
    }
    const stored = await getNotices(true) // 서버에서 강제 로드
    // null이나 undefined 항목 필터링
    const validNotices = stored.filter((notice): notice is NoticeItem => 
      notice !== null && notice !== undefined && notice.title !== undefined
    )
    if (validNotices.length > 0) {
      console.log('[NoticesManage] 서버에서 공지사항 로드 완료:', validNotices.length, '개')
      setNotices(validNotices)
    } else {
      // 기본 데이터 로드
      console.log('[NoticesManage] 기본 데이터 사용')
      setNotices(defaultNotices)
      await saveNotices(defaultNotices)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // null 항목 필터링
    const validNotices = notices.filter((notice): notice is NoticeItem => 
      notice !== null && notice !== undefined && notice.title !== undefined
    )
    const newNotices = [...validNotices]
    
    if (editingIndex !== null && editingIndex >= 0 && editingIndex < validNotices.length) {
      newNotices[editingIndex] = formData
    } else {
      newNotices.unshift(formData)
    }
    
    setNotices(newNotices)
    await saveNotices(newNotices) // 서버에 저장 완료 대기
    resetForm()
  }


  const handleDelete = async (index: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      // null 항목 필터링 후 삭제
      const validNotices = notices.filter((notice): notice is NoticeItem => 
        notice !== null && notice !== undefined && notice.title !== undefined
      )
      const newNotices = validNotices.filter((_, i) => i !== index)
      setNotices(newNotices)
      await saveNotices(newNotices) // 서버에 저장 완료 대기
      setSelectedIndices(new Set())
    }
  }

  // 일괄 작업 함수들
  const handleSelectAll = () => {
    const validNotices = notices.filter((notice): notice is NoticeItem => 
      notice !== null && notice !== undefined && notice.title !== undefined
    )
    if (selectedIndices.size === validNotices.length) {
      setSelectedIndices(new Set())
    } else {
      setSelectedIndices(new Set(validNotices.map((_, i) => i)))
    }
  }

  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selectedIndices)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedIndices(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedIndices.size === 0) {
      alert('삭제할 항목을 선택해주세요.')
      return
    }
    if (confirm(`선택한 ${selectedIndices.size}개의 공지사항을 삭제하시겠습니까?`)) {
      const validNotices = notices.filter((notice): notice is NoticeItem => 
        notice !== null && notice !== undefined && notice.title !== undefined
      )
      const newNotices = validNotices.filter((_, i) => !selectedIndices.has(i))
      setNotices(newNotices)
      await saveNotices(newNotices)
      setSelectedIndices(new Set())
    }
  }

  const handleBulkImportant = async (isImportant: boolean) => {
    if (selectedIndices.size === 0) {
      alert('설정할 항목을 선택해주세요.')
      return
    }
    const validNotices = notices.filter((notice): notice is NoticeItem => 
      notice !== null && notice !== undefined && notice.title !== undefined
    )
    const newNotices = validNotices.map((notice, i) => 
      selectedIndices.has(i) ? { ...notice, isImportant } : notice
    )
    setNotices(newNotices)
    await saveNotices(newNotices)
    setSelectedIndices(new Set())
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      content: '',
      imageUrl: '',
      linkUrl: '',
      isImportant: false
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
    // null 항목 필터링
    const validNotices = notices.filter((notice): notice is NoticeItem => 
      notice !== null && notice !== undefined && notice.title !== undefined
    )
    if (index < 0 || index >= validNotices.length) {
      console.error('[NoticesManage] 잘못된 인덱스:', index)
      return
    }
    const notice = validNotices[index]
    // imageUrl이 data:로 시작하면 업로드된 파일, 아니면 URL
    if (notice.imageUrl) {
      setImageInputType(notice.imageUrl.startsWith('data:') ? 'upload' : 'url')
    }
    setFormData(notice)
    // 원본 배열에서의 실제 인덱스 찾기
    const actualIndex = notices.findIndex(n => n === notice)
    setEditingIndex(actualIndex >= 0 ? actualIndex : index)
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
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isImportant || false}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-catholic-logo focus:ring-2 focus:ring-catholic-logo"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">중요공지로 설정</span>
                    <p className="text-xs text-gray-500 mt-1">체크하면 메인페이지 배너 영역에 표시됩니다.</p>
                  </div>
                </label>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">공지사항 목록</h2>
              {notices.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {selectedIndices.size === notices.filter((n): n is NoticeItem => n !== null && n !== undefined && n.title !== undefined).length ? '전체 해제' : '전체 선택'}
                  </button>
                  {selectedIndices.size > 0 && (
                    <>
                      <button
                        onClick={() => handleBulkImportant(true)}
                        className="px-3 py-1.5 text-sm rounded-lg text-white font-medium transition-colors"
                        style={{ backgroundColor: '#7B1F4B' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                      >
                        중요 설정 ({selectedIndices.size})
                      </button>
                      <button
                        onClick={() => handleBulkImportant(false)}
                        className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        중요 해제 ({selectedIndices.size})
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 text-sm rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                      >
                        삭제 ({selectedIndices.size})
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">공지사항이 없습니다.</p>
              ) : (
                notices
                  .filter((notice): notice is NoticeItem => notice !== null && notice !== undefined && notice.title !== undefined)
                  .map((notice, index) => {
                    // 필터링 후 실제 인덱스 찾기
                    const actualIndex = notices.findIndex(n => n === notice)
                    // key는 title과 date 조합으로 고유성 보장
                    const uniqueKey = `${notice.title}-${notice.date}-${index}`
                    const isSelected = selectedIndices.has(actualIndex)
                    return (
                      <div
                        key={uniqueKey}
                        className={`p-4 rounded-lg border transition-all ${
                          isSelected 
                            ? 'border-catholic-logo bg-purple-50/30' 
                            : 'border-gray-200 hover:border-catholic-logo/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(actualIndex)}
                              className="mt-1 w-4 h-4 rounded border-gray-300 text-catholic-logo focus:ring-catholic-logo"
                            />
                            <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{notice.title || '(제목 없음)'}</h3>
                              {notice.isImportant && (
                                <span className="px-2 py-0.5 text-xs font-semibold text-white rounded-full" style={{ backgroundColor: '#7B1F4B' }}>
                                  중요
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{notice.date || ''}</p>
                            {notice.summary && (
                              <p className="text-sm text-gray-500">{notice.summary}</p>
                            )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(actualIndex)}
                              className="px-3 py-1 rounded text-sm text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                              style={{ backgroundColor: '#7B1F4B' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(actualIndex)}
                              className="px-3 py-1 rounded text-sm bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

