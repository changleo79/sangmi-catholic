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

// 이미지 압축 함수 (모든 이미지 압축, Vercel 4.5MB 제한 대응)
const compressImage = (file: File, maxSizeMB: number = 3.5, maxWidth: number = 1920, maxHeight: number = 1920): Promise<File> => {
  return new Promise((resolve, reject) => {
    // 이미지가 아닌 경우 그대로 반환
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    const fileSizeMB = file.size / 1024 / 1024
    
    // 모든 이미지를 압축 (크기 제한 체크 제거)
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // 원본 크기
        let width = img.width
        let height = img.height

        // 최대 크기로 리사이즈 (1920x1920px 초과 시)
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        // Canvas로 리사이즈 및 압축
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Canvas 컨텍스트를 생성할 수 없습니다.'))
          return
        }

        // 고품질 리사이징
        ctx.drawImage(img, 0, 0, width, height)

        // JPEG 품질 조정 (파일 크기에 따라 품질 조정)
        // 작은 파일은 높은 품질, 큰 파일은 더 압축
        let quality = 0.90  // 기본 품질을 90%로 높임 (작은 파일용)
        if (fileSizeMB > 5) {
          quality = 0.75  // 5MB 초과: 75%
        } else if (fileSizeMB > 4) {
          quality = 0.80  // 4MB 초과: 80%
        } else if (fileSizeMB > 2) {
          quality = 0.85  // 2MB 초과: 85%
        } else if (fileSizeMB > 1) {
          quality = 0.90  // 1MB 초과: 90%
        }
        // 1MB 이하는 90% 품질 유지

        // JPEG로 변환 (PNG도 JPEG로 변환하여 크기 감소)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 압축 실패'))
              return
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.(png|gif|webp)$/i, '.jpg'),
              { type: 'image/jpeg', lastModified: Date.now() }
            )

            const compressedSizeMB = compressedFile.size / 1024 / 1024
            console.log(`[압축 완료] ${file.name}: ${fileSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${((1 - compressedFile.size / file.size) * 100).toFixed(1)}% 감소)`)

            // 여전히 크면 품질을 더 낮춰서 재압축
            if (compressedSizeMB > maxSizeMB && quality > 0.6) {
              quality = Math.max(0.6, quality - 0.1)
              canvas.toBlob(
                (blob2) => {
                  if (!blob2) {
                    resolve(compressedFile)
                    return
                  }
                  const finalFile = new File(
                    [blob2],
                    compressedFile.name,
                    { type: 'image/jpeg', lastModified: Date.now() }
                  )
                  console.log(`[재압축 완료] ${file.name}: ${(finalFile.size / 1024 / 1024).toFixed(2)}MB`)
                  resolve(finalFile)
                },
                'image/jpeg',
                quality
              )
            } else {
              resolve(compressedFile)
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('이미지 로드 실패'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsDataURL(file)
  })
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
    fileUrl2: '',
    thumbnailUrl: '',
    description: ''
  })

  useEffect(() => {
    // 어드민 진입 시 캐시 먼저 표시, 백그라운드에서 최신 데이터 로드 (앨범처럼)
    loadBulletins()
    
    // 페이지 포커스 시에도 최신 데이터 로드 (다른 탭에서 네이버 클라우드 수정 시 반영)
    const handleFocus = () => {
      console.log('[BulletinsManage] 페이지 포커스 - 최신 데이터 로드')
      loadBulletins()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loadBulletins = async () => {
    console.log('[BulletinsManage] 주보 로드 시작')
    // 먼저 캐시된 데이터를 빠르게 표시 (앨범처럼)
    const cachedBulletins = await getBulletins(false) // 캐시 우선 사용
    if (cachedBulletins.length > 0) {
      setBulletins(cachedBulletins)
      console.log('[BulletinsManage] 캐시된 주보 표시:', cachedBulletins.length, '개')
    }
    
    // 백그라운드에서 서버에서 최신 데이터 로드
    const stored = await getBulletins(true) // 서버에서 강제 로드
    console.log('[BulletinsManage] 서버에서 주보 로드 완료:', stored.length, '개')
    setBulletins(stored)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 파일 URL이 필수인지 확인
    if (!formData.fileUrl) {
      alert('주보 이미지 파일을 최소 1개 이상 업로드하거나 URL을 입력해주세요.')
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
      await loadBulletins()
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
      fileUrl2: bulletin.fileUrl2 || '',
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
        await loadBulletins()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      fileUrl: '',
      fileUrl2: '',
      thumbnailUrl: '',
      description: ''
    })
    setPdfInputType('upload')
    setIsEditing(false)
    setEditingId(null)
  }

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // 2개만 허용
    if (files.length > 2) {
      alert('이미지 파일은 최대 2개까지 업로드 가능합니다.')
      e.target.value = ''
      return
    }

    // 이미지 파일만 허용
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    if (imageFiles.length !== files.length) {
      alert('이미지 파일(JPG, PNG 등)만 업로드 가능합니다.')
      e.target.value = ''
      return
    }

    try {
      // 첫 번째 파일 업로드
      const file1 = imageFiles[0]
      let fileToUpload1 = file1
      if (file1.type.startsWith('image/')) {
        try {
          console.log(`[주보 압축 시작] ${file1.name} (${(file1.size / 1024 / 1024).toFixed(2)}MB)`)
          fileToUpload1 = await compressImage(file1)
        } catch (compressError) {
          console.warn(`[주보 압축 실패] ${file1.name}, 원본 파일로 업로드 시도:`, compressError)
        }
      }

      const uploadFormData1 = new FormData()
      uploadFormData1.append('files', fileToUpload1)
      uploadFormData1.append('albumId', 'bulletins')

      const response1 = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData1
      })

      if (!response1.ok) {
        throw new Error('첫 번째 파일 업로드 실패')
      }

      const result1 = await response1.json()
      const uploadedFile1 = result1.uploads?.[0]
      if (!uploadedFile1) {
        throw new Error('첫 번째 파일 업로드 응답 오류')
      }

      const fileUrl1 = uploadedFile1.url
      const thumbnailUrl = fileUrl1 // 첫 번째 이미지를 썸네일로 사용

      // 두 번째 파일이 있으면 업로드
      let fileUrl2 = ''
      if (imageFiles.length === 2) {
        const file2 = imageFiles[1]
        let fileToUpload2 = file2
        if (file2.type.startsWith('image/')) {
          try {
            console.log(`[주보 압축 시작] ${file2.name} (${(file2.size / 1024 / 1024).toFixed(2)}MB)`)
            fileToUpload2 = await compressImage(file2)
          } catch (compressError) {
            console.warn(`[주보 압축 실패] ${file2.name}, 원본 파일로 업로드 시도:`, compressError)
          }
        }

        const uploadFormData2 = new FormData()
        uploadFormData2.append('files', fileToUpload2)
        uploadFormData2.append('albumId', 'bulletins')

        const response2 = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData2
        })

        if (!response2.ok) {
          throw new Error('두 번째 파일 업로드 실패')
        }

        const result2 = await response2.json()
        const uploadedFile2 = result2.uploads?.[0]
        if (uploadedFile2) {
          fileUrl2 = uploadedFile2.url
        }
      }

      setFormData(prev => ({ 
        ...prev, 
        fileUrl: fileUrl1, 
        fileUrl2: fileUrl2 || prev.fileUrl2,
        thumbnailUrl: thumbnailUrl 
      }))

      e.target.value = ''
    } catch (error) {
      console.error('[BulletinsManage] 파일 업로드 실패:', error)
      alert('파일 업로드 중 오류가 발생했습니다. 다시 시도해 주세요.')
      e.target.value = ''
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
                <label className="block text-sm font-medium text-gray-700 mb-2">주보 이미지 파일 (JPG) *</label>
                <p className="text-xs text-gray-500 mb-3">주보는 이미지 파일 2개를 업로드해주세요.</p>
                
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
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={handlePdfFileUpload}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      required={!formData.fileUrl}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      💡 이미지 파일(JPG, PNG)을 최대 2개까지 선택할 수 있습니다. 선택한 파일은 서버에 업로드됩니다.
                    </p>
                    {(formData.fileUrl || formData.fileUrl2) && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {formData.fileUrl && (
                          <div className="relative p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-green-700 font-semibold">✓ 첫 번째 이미지</p>
                              <button
                                type="button"
                              onClick={() => {
                                setFormData({ 
                                  ...formData, 
                                  fileUrl: '', 
                                  thumbnailUrl: (formData.fileUrl2 && formData.fileUrl2.trim() !== '') ? formData.fileUrl2 : ''
                                })
                              }}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                삭제
                              </button>
                            </div>
                            {formData.fileUrl.startsWith('data:image/') || formData.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
                              <div className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <img src={formData.fileUrl} alt="첫 번째 이미지 미리보기" className="w-full h-full object-cover" />
                              </div>
                            ) : null}
                            {formData.fileUrl2 && (
                              <button
                                type="button"
                                onClick={() => {
                                  // 첫 번째와 두 번째 이미지 교체
                                  setFormData({
                                    ...formData,
                                    fileUrl: formData.fileUrl2 || '',
                                    fileUrl2: formData.fileUrl,
                                    thumbnailUrl: formData.fileUrl2 || ''
                                  })
                                }}
                                className="mt-2 w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                두 번째로 이동
                              </button>
                            )}
                          </div>
                        )}
                        {formData.fileUrl2 && (
                          <div className="relative p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs text-green-700 font-semibold">✓ 두 번째 이미지</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, fileUrl2: '' })
                                }}
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                삭제
                              </button>
                            </div>
                            {formData.fileUrl2.startsWith('data:image/') || formData.fileUrl2.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
                              <div className="w-full aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                <img src={formData.fileUrl2} alt="두 번째 이미지 미리보기" className="w-full h-full object-cover" />
                              </div>
                            ) : null}
                            {formData.fileUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  // 두 번째와 첫 번째 이미지 교체
                                  setFormData({
                                    ...formData,
                                    fileUrl: formData.fileUrl2 || '',
                                    fileUrl2: formData.fileUrl,
                                    thumbnailUrl: formData.fileUrl2 || ''
                                  })
                                }}
                                className="mt-2 w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                              >
                                첫 번째로 이동
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-600">첫 번째 이미지 URL</label>
                        {formData.fileUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                fileUrl: '',
                                thumbnailUrl: (formData.fileUrl2 && formData.fileUrl2.trim() !== '') ? formData.fileUrl2 : ''
                              })
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={formData.fileUrl && formData.fileUrl.startsWith('data:') ? '' : (formData.fileUrl || '')}
                        onChange={(e) => {
                          const url = e.target.value
                          const isImageUrl = url && (
                            url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) || 
                            url.startsWith('data:image/')
                          )
                          setFormData({ 
                            ...formData, 
                            fileUrl: url,
                            thumbnailUrl: isImageUrl ? url : (formData.thumbnailUrl || '')
                          })
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                        placeholder="예: https://..."
                      />
                      {formData.fileUrl && (formData.fileUrl.startsWith('data:image/') || formData.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) && (
                        <div className="mt-2 w-full max-w-[200px] aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img src={formData.fileUrl} alt="첫 번째 이미지 미리보기" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {formData.fileUrl && formData.fileUrl2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              fileUrl: formData.fileUrl2 || '',
                              fileUrl2: formData.fileUrl,
                              thumbnailUrl: formData.fileUrl2 || ''
                            })
                          }}
                          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          두 번째로 이동
                        </button>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-600">두 번째 이미지 URL (선택)</label>
                        {formData.fileUrl2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, fileUrl2: '' })
                            }}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        value={formData.fileUrl2 && formData.fileUrl2.startsWith('data:') ? '' : (formData.fileUrl2 || '')}
                        onChange={(e) => {
                          const url = e.target.value
                          setFormData({ 
                            ...formData, 
                            fileUrl2: url
                          })
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                        placeholder="예: https://..."
                      />
                      {formData.fileUrl2 && (formData.fileUrl2.startsWith('data:image/') || formData.fileUrl2.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) && (
                        <div className="mt-2 w-full max-w-[200px] aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                          <img src={formData.fileUrl2} alt="두 번째 이미지 미리보기" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {formData.fileUrl && formData.fileUrl2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              fileUrl: formData.fileUrl2 || '',
                              fileUrl2: formData.fileUrl,
                              thumbnailUrl: formData.fileUrl2 || ''
                            })
                          }}
                          className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          첫 번째로 이동
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      💡 이미지 파일 URL을 입력하세요. 첫 번째 이미지가 자동으로 썸네일로 설정됩니다.
                    </p>
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
                      <div className="flex gap-2 flex-shrink-0">
                        {(() => {
                          // 첫 번째 이미지
                          const isImageFile1 = bulletin.fileUrl && (
                            bulletin.fileUrl.startsWith('data:image/') ||
                            bulletin.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
                          )
                          const thumbnailUrl = bulletin.thumbnailUrl || (isImageFile1 ? bulletin.fileUrl : null)
                          
                          return (
                            <>
                              {thumbnailUrl ? (
                                <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200">
                                  <img 
                                    src={thumbnailUrl} 
                                    alt={`${bulletin.title} - 이미지 1`} 
                                    className="w-full h-full object-cover"
                                    loading={bulletins.indexOf(bulletin) < 10 ? "eager" : "lazy"}
                                    decoding="async"
                                    fetchPriority={bulletins.indexOf(bulletin) < 10 ? "high" : "auto"}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      console.error('[BulletinsManage] 썸네일 로드 실패:', thumbnailUrl)
                                      const target = e.currentTarget as HTMLImageElement
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
                                <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-catholic-logo/20 to-catholic-logo/5 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-catholic-logo opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                              {/* 두 번째 이미지 */}
                              {bulletin.fileUrl2 && (() => {
                                const isImageFile2 = bulletin.fileUrl2.startsWith('data:image/') ||
                                  bulletin.fileUrl2.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
                                return isImageFile2 ? (
                                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-200">
                                    <img 
                                      src={bulletin.fileUrl2} 
                                      alt={`${bulletin.title} - 이미지 2`} 
                                      className="w-full h-full object-cover"
                                      loading="lazy"
                                      decoding="async"
                                      referrerPolicy="no-referrer"
                                      onError={(e) => {
                                        const target = e.currentTarget as HTMLImageElement
                                        target.style.display = 'none'
                                      }}
                                      onLoad={(e) => {
                                        (e.target as HTMLImageElement).style.backgroundColor = 'transparent'
                                      }}
                                    />
                                  </div>
                                ) : null
                              })()}
                            </>
                          )
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{bulletin.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{bulletin.date}</p>
                        {bulletin.description && (
                          <p className="text-xs text-gray-500 mb-2">{bulletin.description}</p>
                        )}
                        <div className="space-y-1">
                          <a
                            href={bulletin.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline block"
                          >
                            이미지 1: {bulletin.fileUrl.substring(0, 50)}...
                          </a>
                          {bulletin.fileUrl2 && (
                            <a
                              href={bulletin.fileUrl2}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline block"
                            >
                              이미지 2: {bulletin.fileUrl2.substring(0, 50)}...
                            </a>
                          )}
                        </div>
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

