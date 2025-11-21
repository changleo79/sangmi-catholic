import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBulletins, saveBulletins, type BulletinItem } from '../../utils/storage'

export default function BulletinsManage() {
  const [bulletins, setBulletins] = useState<BulletinItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pdfInputType, setPdfInputType] = useState<'upload' | 'url'>('upload')
  const [thumbnailInputType, setThumbnailInputType] = useState<'upload' | 'url'>('url')
  const [formData, setFormData] = useState<Omit<BulletinItem, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    fileUrl: '',
    thumbnailUrl: '',
    description: ''
  })

  useEffect(() => {
    loadBulletins()
  }, [])

  const loadBulletins = () => {
    // 캐시 무효화하고 강제 새로고침
    if ((window as any).__bulletinsCache) {
      delete (window as any).__bulletinsCache
    }
    if ((window as any).cachedData && (window as any).cachedData.bulletins) {
      (window as any).cachedData.bulletins = undefined
    }
    const stored = getBulletins(true) // 강제 새로고침
    console.log('[BulletinsManage] 주보 로드:', stored.length, '개', stored)
    setBulletins(stored)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 파일 URL이 필수인지 확인
    if (!formData.fileUrl) {
      alert('주보 파일(PDF 또는 JPG)을 업로드하거나 URL을 입력해주세요.')
      return
    }
    
    const newBulletins = [...bulletins]

    if (editingId) {
      const index = newBulletins.findIndex(b => b.id === editingId)
      if (index !== -1) {
        newBulletins[index] = { ...formData, id: editingId }
      }
    } else {
      const newId = Date.now().toString()
      newBulletins.unshift({ ...formData, id: newId })
    }

    setBulletins(newBulletins)
    saveBulletins(newBulletins)
    console.log('[BulletinsManage] 주보 저장 완료:', newBulletins.length, '개', newBulletins)
    // 저장 후 즉시 다시 로드하여 확인
    setTimeout(() => {
      loadBulletins()
    }, 100)
    resetForm()
  }

  const handleEdit = (bulletin: BulletinItem) => {
    // fileUrl이 data:로 시작하면 업로드된 파일, 아니면 URL
    const isFileUploaded = bulletin.fileUrl.startsWith('data:')
    const isThumbnailUploaded = bulletin.thumbnailUrl?.startsWith('data:')
    
    setPdfInputType(isFileUploaded ? 'upload' : 'url')
    setThumbnailInputType(isThumbnailUploaded ? 'upload' : 'url')
    
    setFormData({
      title: bulletin.title,
      date: bulletin.date,
      fileUrl: bulletin.fileUrl,
      thumbnailUrl: bulletin.thumbnailUrl || '',
      description: bulletin.description || ''
    })
    setEditingId(bulletin.id)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newBulletins = bulletins.filter(b => b.id !== id)
      setBulletins(newBulletins)
      saveBulletins(newBulletins)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      fileUrl: '',
      thumbnailUrl: '',
      description: ''
    })
    setPdfInputType('upload')
    setThumbnailInputType('url')
    setIsEditing(false)
    setEditingId(null)
  }

  const handlePdfFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // PDF 또는 이미지 파일 허용
      const isPdf = file.type === 'application/pdf'
      const isImage = file.type.startsWith('image/')
      
      if (!isPdf && !isImage) {
        alert('PDF 또는 이미지 파일(JPG, PNG 등)만 업로드 가능합니다.')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        // 이미지 파일인 경우 자동으로 썸네일로도 사용
        if (isImage && !formData.thumbnailUrl) {
          setFormData({ ...formData, fileUrl: base64, thumbnailUrl: base64 })
        } else {
          setFormData({ ...formData, fileUrl: base64 })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleThumbnailFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setFormData({ ...formData, thumbnailUrl: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">주보 안내 관리</h1>
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

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isEditing ? '주보 수정' : '새 주보 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  placeholder="예: 2025년 11월 주보"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">날짜 *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">주보 파일 (PDF 또는 JPG) *</label>
                
                {/* 입력 방식 선택 */}
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pdfInputType"
                      value="upload"
                      checked={pdfInputType === 'upload'}
                      onChange={(e) => setPdfInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">파일 업로드</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pdfInputType"
                      value="url"
                      checked={pdfInputType === 'url'}
                      onChange={(e) => setPdfInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">URL 입력</span>
                  </label>
                </div>

                {pdfInputType === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/jpg,image/png"
                      onChange={handlePdfFileUpload}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      required={!formData.fileUrl}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 PDF 또는 이미지 파일(JPG, PNG)을 선택하면 Base64로 변환되어 저장됩니다. (브라우저에 저장됨)
                    </p>
                    {formData.fileUrl && formData.fileUrl.startsWith('data:') && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-700">
                          ✓ {formData.fileUrl.startsWith('data:application/pdf') ? 'PDF' : '이미지'} 파일이 업로드되었습니다.
                        </p>
                        {formData.fileUrl.startsWith('data:image/') && (
                          <div className="mt-2 w-32 h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={formData.fileUrl} alt="파일 미리보기" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.fileUrl && formData.fileUrl.startsWith('data:') ? '' : (formData.fileUrl || '')}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      placeholder="예: /files/bulletin-2025-11.pdf 또는 https://..."
                      required={!formData.fileUrl || !formData.fileUrl.startsWith('data:')}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 PDF 또는 이미지 파일 URL을 입력하세요. (예: /files/bulletin-2025-11.pdf 또는 https://...)
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  썸네일 이미지 (선택)
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    💡 JPG 파일 업로드 시 자동으로 썸네일이 설정됩니다. PDF 파일인 경우에만 별도로 썸네일을 올려주세요.
                  </span>
                </label>
                
                {/* 입력 방식 선택 */}
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="thumbnailInputType"
                      value="upload"
                      checked={thumbnailInputType === 'upload'}
                      onChange={(e) => setThumbnailInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">파일 업로드</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="thumbnailInputType"
                      value="url"
                      checked={thumbnailInputType === 'url'}
                      onChange={(e) => setThumbnailInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">URL 입력</span>
                  </label>
                </div>

                {thumbnailInputType === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFileUpload}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 이미지 파일을 선택하면 Base64로 변환되어 저장됩니다. (PDF 파일인 경우에만 필요)
                    </p>
                    {formData.thumbnailUrl && formData.thumbnailUrl.startsWith('data:') && (
                      <div className="mt-3 w-32 h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={formData.thumbnailUrl} alt="썸네일 미리보기" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.thumbnailUrl && formData.thumbnailUrl.startsWith('data:') ? '' : (formData.thumbnailUrl || '')}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      placeholder="예: /files/bulletin-2025-11-thumb.jpg"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 주보의 썸네일 이미지 URL을 입력하세요. 없으면 기본 PDF 아이콘이 표시됩니다. (PDF 파일인 경우에만 필요)
                    </p>
                    {formData.thumbnailUrl && !formData.thumbnailUrl.startsWith('data:') && formData.thumbnailUrl.trim() !== '' && (
                      <div className="mt-3 w-32 h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={formData.thumbnailUrl} alt="썸네일 미리보기" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  placeholder="주보에 대한 간단한 설명을 입력하세요."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  {isEditing ? '수정 완료' : '추가'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">주보 목록</h2>
            <div className="space-y-4">
              {bulletins.length === 0 ? (
                <p className="text-gray-500 text-center py-8">등록된 주보가 없습니다.</p>
              ) : (
                bulletins.map((bulletin) => (
                  <div
                    key={bulletin.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-catholic-logo/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {bulletin.thumbnailUrl ? (
                        <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img src={bulletin.thumbnailUrl} alt={bulletin.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-catholic-logo/20 to-catholic-logo/5 flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-catholic-logo opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{bulletin.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{bulletin.date}</p>
                        {bulletin.description && (
                          <p className="text-xs text-gray-500 mb-2">{bulletin.description}</p>
                        )}
                        <a
                          href={bulletin.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          {bulletin.fileUrl}
                        </a>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(bulletin)}
                          className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(bulletin.id)}
                          className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
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

