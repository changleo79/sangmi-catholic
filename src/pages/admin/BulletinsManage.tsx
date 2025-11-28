import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getBulletins, saveBulletins, type BulletinItem } from '../../utils/storage'

// 이미지 URL을 프록시를 통해 로드하는 함수
const getProxiedImageUrl = (url: string): string => {
  // data: URL이나 같은 도메인 이미지는 그대로 사용
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url
  }
  
  // 외부 이미지는 프록시를 통해 로드
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`
  }
  
  return url
}

export default function BulletinsManage() {
  const [bulletins, setBulletins] = useState<BulletinItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [pdfInputType, setPdfInputType] = useState<'upload' | 'url'>('upload')
  const [formData, setFormData] = useState<Omit<BulletinItem, 'id'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    fileUrl: '',
    thumbnailUrl: '',
    description: ''
  })

  useEffect(() => {
    // 어드민 진입 시 캐시 먼저 표시, 백그라운드에서 최신 데이터 로드
    console.log('[BulletinsManage] 어드민 페이지 진입')
    loadBulletins(false) // 먼저 캐시 표시
    
    // 페이지 포커스 시에도 최신 데이터 로드 (다른 탭에서 네이버 클라우드 수정 시 반영)
    const handleFocus = () => {
      console.log('[BulletinsManage] 페이지 포커스 - 최신 데이터 로드')
      loadBulletins(true)
    }
    
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadBulletins = async (forceRefresh = false) => {
    console.log('[BulletinsManage] 주보 로드 시작 - forceRefresh:', forceRefresh)
    
    // 먼저 캐시된 데이터를 빠르게 표시 (앨범처럼)
    if (!forceRefresh) {
      const cachedBulletins = await getBulletins(false) // 캐시 우선 사용
      if (cachedBulletins.length > 0) {
        setBulletins(cachedBulletins)
        console.log('[BulletinsManage] 캐시된 주보 표시:', cachedBulletins.length, '개')
      }
    }
    
    // 백그라운드에서 서버에서 최신 데이터 로드 (setTimeout 제거 - 즉시 처리)
    const stored = await getBulletins(forceRefresh)
    console.log('[BulletinsManage] 서버에서 주보 로드 완료:', stored.length, '개')
    setBulletins(stored)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 파일 URL이 필수인지 확인
    if (!formData.fileUrl) {
      alert('주보 파일(PDF 또는 JPG)을 업로드하거나 URL을 입력해주세요.')
      return
    }
    
    // 이미지 파일인지 확인하고 썸네일 자동 설정
    const isImageFile = formData.fileUrl && (
      formData.fileUrl.startsWith('data:image/') ||
      formData.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
    )
    
    // 이미지 파일이면 자동으로 원본 URL을 썸네일로 사용
    // 이미지 파일이 아니면 썸네일을 빈 문자열로 설정 (PDF 아이콘 표시)
    const finalFormData = {
      ...formData,
      thumbnailUrl: isImageFile ? formData.fileUrl : ''
    }
    
    console.log('[BulletinsManage] 저장 시 썸네일 설정:', {
      fileUrl: finalFormData.fileUrl?.substring(0, 80),
      isImageFile,
      thumbnailUrl: finalFormData.thumbnailUrl?.substring(0, 80),
      thumbnailUrlLength: finalFormData.thumbnailUrl?.length
    })
    
    // 현재 상태를 기반으로 업데이트 (서버 재로드 불필요)
    const currentBulletins = [...bulletins]
    const newBulletins = [...currentBulletins]

    if (editingId) {
      const index = newBulletins.findIndex(b => b.id === editingId)
      if (index !== -1) {
        newBulletins[index] = { ...finalFormData, id: editingId }
      } else {
        // 수정 중인 주보가 서버에 없으면 추가
        newBulletins.unshift({ ...finalFormData, id: editingId })
      }
    } else {
      // 고유 ID 생성 (Date.now() + 랜덤 문자열로 충돌 방지)
      const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      newBulletins.unshift({ ...finalFormData, id: newId })
    }

    try {
      console.log('[BulletinsManage] 주보 저장 시작:', {
        editingId,
        newBulletinsCount: newBulletins.length,
        newBulletins: newBulletins.map(b => ({ id: b.id, title: b.title, fileUrl: b.fileUrl?.substring(0, 50) }))
      })
      
      // 낙관적 업데이트: 즉시 UI 업데이트
      setBulletins(newBulletins)
      
      // 네이버 클라우드에 저장
      await saveBulletins(newBulletins)
      
      console.log('[BulletinsManage] 주보 저장 완료:', newBulletins.length, '개')
      
      // 이벤트 발생 (지연 없이)
      window.dispatchEvent(new CustomEvent('bulletinsUpdated'))
      resetForm()
    } catch (error) {
      console.error('[BulletinsManage] 주보 저장 실패:', error)
      // 에러 상세 정보 로깅
      if (error instanceof Error) {
        console.error('[BulletinsManage] 에러 상세:', error.message, error.stack)
      }
      alert('주보 저장 중 오류가 발생했습니다. 다시 시도해 주세요.')
      // 실패 시 원래 상태로 복구
      await loadBulletins(true)
    }
  }

  const handleEdit = (bulletin: BulletinItem) => {
    // fileUrl이 data:로 시작하면 업로드된 파일, 아니면 URL
    const isFileUploaded = bulletin.fileUrl.startsWith('data:')
    
    // 이미지 파일인지 확인
    const isImageFile = bulletin.fileUrl && (
      bulletin.fileUrl.startsWith('data:image/') ||
      bulletin.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
    )
    
    setPdfInputType(isFileUploaded ? 'upload' : 'url')
    
    // 이미지 파일이면 자동으로 원본 URL을 썸네일로 사용
    const thumbnailUrl = isImageFile ? bulletin.fileUrl : (bulletin.thumbnailUrl || '')
    
    setFormData({
      title: bulletin.title,
      date: bulletin.date,
      fileUrl: bulletin.fileUrl,
      thumbnailUrl: thumbnailUrl,
      description: bulletin.description || ''
    })
    setEditingId(bulletin.id)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        // 낙관적 업데이트: 즉시 UI에서 제거
        const currentBulletins = [...bulletins]
        const newBulletins = currentBulletins.filter(b => b.id !== id)
        setBulletins(newBulletins) // 즉시 UI 업데이트
        
        console.log('[BulletinsManage] 삭제 시작 - 낙관적 업데이트:', id, '남은 주보 수:', newBulletins.length)
        
        // 백그라운드에서 서버 동기화
        // 현재 상태에서 삭제 (서버에서 최신 데이터 로드 불필요)
        await saveBulletins(newBulletins)
        console.log('[BulletinsManage] 주보 삭제 저장 완료:', id)
        
        // 이벤트 발생 (지연 없이)
        window.dispatchEvent(new CustomEvent('bulletinsUpdated'))
      } catch (error) {
        console.error('[BulletinsManage] 주보 삭제 실패:', error)
        alert('주보 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.')
        // 실패 시 원래 상태로 복구
        await loadBulletins(true)
      }
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
    setIsEditing(false)
    setEditingId(null)
  }

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // PDF 또는 이미지 파일 허용
    const isPdf = file.type === 'application/pdf'
    const isImage = file.type.startsWith('image/')
    
    if (!isPdf && !isImage) {
      alert('PDF 또는 이미지 파일(JPG, PNG 등)만 업로드 가능합니다.')
      return
    }

    try {
      // 파일을 서버에 업로드 (Base64 대신 서버에 저장)
      const uploadFormData = new FormData()
      uploadFormData.append('files', file)
      uploadFormData.append('albumId', 'bulletins') // 주보는 bulletins 폴더에 저장

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[BulletinsManage] 파일 업로드 실패:', response.status, errorText)
        throw new Error('파일 업로드 실패')
      }

      const result = await response.json()
      if (result.uploads && result.uploads.length > 0) {
        const uploadedFile = result.uploads[0]
        const fileUrl = uploadedFile.url
        // 이미지 파일인 경우 원본 URL을 썸네일로 사용 (별도 썸네일 생성 불필요)
        const thumbnailUrl = isImage ? fileUrl : (uploadedFile.thumbnailUrl || undefined)

        // 이미지 파일인 경우 자동으로 원본을 썸네일로 설정
        if (isImage) {
          setFormData(prev => ({ ...prev, fileUrl, thumbnailUrl: fileUrl }))
        } else {
          setFormData(prev => ({ ...prev, fileUrl, thumbnailUrl: thumbnailUrl || prev.thumbnailUrl }))
        }
      } else {
        throw new Error('업로드 응답에 파일이 없습니다.')
      }
    } catch (error) {
      console.error('[BulletinsManage] 파일 업로드 실패:', error)
      alert('파일 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.')
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
                      onChange={(e) => {
                        const url = e.target.value
                        // 이미지 파일인 경우 자동으로 썸네일로 설정
                        const isImageUrl = url && (
                          url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) || 
                          url.startsWith('data:image/')
                        )
                        setFormData({ 
                          ...formData, 
                          fileUrl: url,
                          // 이미지 파일이면 원본 URL을 썸네일로 사용, 아니면 빈 문자열
                          thumbnailUrl: isImageUrl ? url : ''
                        })
                        console.log('[BulletinsManage] URL 입력 - 썸네일 자동 설정:', {
                          url: url.substring(0, 50),
                          isImageUrl,
                          thumbnailUrl: isImageUrl ? url.substring(0, 50) : ''
                        })
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      placeholder="예: /files/bulletin-2025-11.pdf 또는 https://..."
                      required={!formData.fileUrl || !formData.fileUrl.startsWith('data:')}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 PDF 또는 이미지 파일 URL을 입력하세요. 이미지 파일인 경우 자동으로 썸네일로 설정됩니다.
                    </p>
                    {formData.fileUrl && formData.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-700">
                          ✓ 이미지 파일이 감지되었습니다. 썸네일이 자동으로 설정됩니다.
                        </p>
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
                      {(() => {
                        // 썸네일 URL이 없으면 이미지 파일인지 확인하여 자동 설정
                        const isImageFile = bulletin.fileUrl && (
                          bulletin.fileUrl.startsWith('data:image/') ||
                          bulletin.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
                        )
                        const thumbnailUrl = bulletin.thumbnailUrl || (isImageFile ? bulletin.fileUrl : null)
                        
                        return thumbnailUrl ? (
                          <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <img 
                              src={getProxiedImageUrl(thumbnailUrl)} 
                              alt={bulletin.title} 
                              className="w-full h-full object-cover"
                              loading={bulletins.indexOf(bulletin) < 10 ? "eager" : "lazy"}
                              decoding="async"
                              fetchPriority={bulletins.indexOf(bulletin) < 10 ? "high" : "auto"}
                              onError={(e) => {
                                console.error('[BulletinsManage] 썸네일 로드 실패:', thumbnailUrl, '프록시 URL:', e.currentTarget.src)
                                const target = e.currentTarget as HTMLImageElement
                                // 프록시 실패 시 프록시 URL에 타임스탬프 추가하여 재시도 (원본 URL로 재시도하지 않음)
                                if (target.src.includes('/api/proxy-image') && !target.src.includes('_retry=')) {
                                  console.log('[BulletinsManage] 프록시 실패, 프록시 URL 재시도:', thumbnailUrl)
                                  const proxiedUrl = getProxiedImageUrl(thumbnailUrl)
                                  target.src = `${proxiedUrl}&_retry=${Date.now()}`
                                  return
                                }
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="w-20 h-28 rounded-lg bg-gradient-to-br from-catholic-logo/20 to-catholic-logo/5 flex items-center justify-center">
                                      <svg class="w-8 h-8 text-catholic-logo opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                      </svg>
                                    </div>
                                  `
                                }
                              }}
                              onLoad={(e) => {
                                (e.target as HTMLImageElement).style.backgroundColor = 'transparent'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-catholic-logo/20 to-catholic-logo/5 flex items-center justify-center flex-shrink-0">
                            <svg className="w-8 h-8 text-catholic-logo opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )
                      })()}
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

