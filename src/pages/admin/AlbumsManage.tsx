import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { AlbumWithCategory, getAlbums, saveAlbums, getAlbumCategories, ensureDefaultAlbumExists } from '../../utils/storage'
import type { AlbumPhoto } from '../../data/albums'

const generateDraftId = () => `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

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
  const [isUploading, setIsUploading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const uploadSessionRef = useRef<string>(generateDraftId())
  const categories = getAlbumCategories().filter(c => c !== '전체')

  const getActiveAlbumId = () => {
    if (editingId) return editingId
    if (formData.id) return formData.id
    return uploadSessionRef.current
  }

  useEffect(() => {
    const init = async () => {
      // 어드민 페이지에서는 기본 앨범을 자동 생성하지 않음
      // 사용자가 삭제한 경우 재생성하지 않도록 함
      await loadAlbums()
    }
    init()
  }, [])

  const loadAlbums = async () => {
    console.log('[AlbumsManage] 앨범 로드 시작')
    // 먼저 캐시된 데이터를 빠르게 표시
    const cachedAlbums = await getAlbums(false) // 캐시 우선 사용
    if (cachedAlbums.length > 0) {
      setAlbums(cachedAlbums)
      console.log('[AlbumsManage] 캐시된 앨범 표시:', cachedAlbums.length, '개')
    }
    
    // 백그라운드에서 서버에서 최신 데이터 로드
    const stored = await getAlbums(true) // 서버에서 강제 로드
    console.log('[AlbumsManage] 서버에서 앨범 로드 완료:', stored.length, '개')
    setAlbums(stored)
  }

  const initializeDefaultAlbum = () => {
    ensureDefaultAlbumExists()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('[AlbumsManage] handleSubmit 시작:', {
      formDataPhotos: formData.photos.length,
      formDataCover: formData.cover,
      formDataTitle: formData.title
    })
    
    // photos 배열이 없거나 비어있으면 경고
    if (!formData.photos || formData.photos.length === 0) {
      alert('사진을 추가해 주세요.')
      return
    }
    
    // 커버 이미지가 없으면 첫 번째 사진을 자동으로 사용
    let finalCover = formData.cover
    if (!finalCover && formData.photos.length > 0) {
      finalCover = formData.photos[0].src
      console.log('[AlbumsManage] 커버 이미지 자동 설정 (저장 시):', finalCover)
    }
    
    let resolvedAlbumId = getActiveAlbumId()
    
    // draft- ID인 경우 실제 ID로 변경 (저장 시)
    if (resolvedAlbumId.startsWith('draft-')) {
      resolvedAlbumId = Date.now().toString()
    }

    const albumData: AlbumWithCategory = {
      ...formData,
      id: resolvedAlbumId,
      cover: finalCover || formData.photos[0]?.src || '', // 여전히 없으면 첫 번째 사진
      photos: Array.isArray(formData.photos) ? formData.photos : [] // 배열 보장
    }
    
    console.log('[AlbumsManage] 저장할 앨범 데이터:', {
      id: albumData.id,
      title: albumData.title,
      photosCount: albumData.photos.length,
      cover: albumData.cover
    })
    
    // 먼저 서버에서 최신 데이터 로드하여 동기화 (네이버 클라우드 직접 수정 반영)
    const latestAlbums = await getAlbums(true) // 네이버 클라우드에서 최신 데이터 가져오기
    
    if (editingId) {
      // 앨범 수정
      const index = latestAlbums.findIndex(a => a.id === editingId)
      if (index !== -1) {
        latestAlbums[index] = albumData
      } else {
        // 수정 중인 앨범이 서버에 없으면 추가
        latestAlbums.unshift(albumData)
      }
      setAlbums(latestAlbums)
      await saveAlbums(latestAlbums) // 네이버 클라우드에 저장
      console.log('[AlbumsManage] 앨범 수정 저장 완료 (네이버 클라우드 동기화):', {
        총앨범수: latestAlbums.length,
        수정된앨범: {
          id: albumData.id,
          title: albumData.title,
          photosCount: albumData.photos.length,
          cover: albumData.cover
        }
      })
    } else {
      // 새 앨범 추가
      latestAlbums.unshift(albumData)
      setAlbums(latestAlbums)
      await saveAlbums(latestAlbums) // 네이버 클라우드에 저장
      console.log('[AlbumsManage] 새 앨범 저장 완료 (네이버 클라우드 동기화):', {
        총앨범수: latestAlbums.length,
        저장된앨범: {
          id: albumData.id,
          title: albumData.title,
          photosCount: albumData.photos.length,
          cover: albumData.cover
        }
      })
    }
    
    // 서버 저장 완료 후 약간의 지연을 두고 이벤트 발생 (모바일 동기화 보장)
    await new Promise(resolve => setTimeout(resolve, 300))
    window.dispatchEvent(new CustomEvent('albumsUpdated'))
    resetForm()
  }

  const handleEdit = (album: AlbumWithCategory) => {
    setFormData(album)
    setEditingId(album.id)
    setIsEditing(true)
    uploadSessionRef.current = album.id
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        // 먼저 서버에서 최신 데이터 로드하여 동기화
        const latestAlbums = await getAlbums(true) // 네이버 클라우드에서 최신 데이터 가져오기
        const newAlbums = latestAlbums.filter(a => a.id !== id)
        
        console.log('[AlbumsManage] 삭제 전 앨범 수:', latestAlbums.length, '삭제 후 앨범 수:', newAlbums.length)
        
        // 네이버 클라우드에 저장
        await saveAlbums(newAlbums)
        console.log('[AlbumsManage] 앨범 삭제 저장 완료:', id, '남은 앨범 수:', newAlbums.length)
        
        // 저장 완료 후 약간의 지연을 두고 서버에서 다시 로드하여 저장 확인
        await new Promise(resolve => setTimeout(resolve, 500))
        const verifyAlbums = await getAlbums(true) // 서버에서 다시 로드하여 저장 확인
        console.log('[AlbumsManage] 삭제 후 서버 확인 - 앨범 수:', verifyAlbums.length, verifyAlbums.map(a => ({ id: a.id, title: a.title })))
        
        // UI 업데이트
        setAlbums(verifyAlbums)
        
        // 서버 저장 완료 후 약간의 지연을 두고 이벤트 발생 (모바일 동기화 보장)
        await new Promise(resolve => setTimeout(resolve, 300))
        window.dispatchEvent(new CustomEvent('albumsUpdated'))
      } catch (error) {
        console.error('[AlbumsManage] 앨범 삭제 실패:', error)
        alert('앨범 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.')
        // 실패 시 원래 상태로 복구
        await loadAlbums()
      }
    }
  }

  const parseTags = (value: string) => value.split(',').map(tag => tag.trim()).filter(Boolean)

  // 네이버 클라우드 연결 테스트
  const testNaverCloudConnection = async () => {
    setTestResult({ success: false, message: '테스트 중...' })
    try {
      // 작은 테스트 이미지 생성 (1x1 픽셀 PNG)
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 1, 1)
      }
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setTestResult({ success: false, message: '테스트 이미지 생성 실패' })
          return
        }

        const testFile = new File([blob], 'test.png', { type: 'image/png' })
        const formData = new FormData()
        formData.append('albumId', 'test-connection')
        formData.append('files', testFile)

        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            const result = await response.json().catch(() => ({}))
            setTestResult({ 
              success: false, 
              message: `연결 실패 (${response.status}): ${result.message || '알 수 없는 오류'}` 
            })
            return
          }

          const result = await response.json() as { uploads: { url: string }[] }
          if (result.uploads && result.uploads.length > 0) {
            const testUrl = result.uploads[0].url
            
            // 업로드된 이미지가 실제로 접근 가능한지 확인
            const imgTest = new Image()
            imgTest.onload = () => {
              setTestResult({ 
                success: true, 
                message: `✅ 연결 성공!\n업로드된 이미지 URL: ${testUrl}\n이미지가 정상적으로 표시됩니다.` 
              })
            }
            imgTest.onerror = () => {
              setTestResult({ 
                success: false, 
                message: `⚠️ 업로드는 성공했지만 이미지 접근 실패\nURL: ${testUrl}\nCDN 설정을 확인해 주세요.` 
              })
            }
            imgTest.src = testUrl
          } else {
            setTestResult({ success: false, message: '업로드 응답에 파일이 없습니다.' })
          }
        } catch (error) {
          setTestResult({ 
            success: false, 
            message: `연결 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
          })
        }
      }, 'image/png')
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
      })
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return
    
    // 파일 크기 제한 없음 (무제한)

    setIsUploading(true)
    const targetAlbumId = getActiveAlbumId()
    const uploadedPhotos: AlbumPhoto[] = []
    const failedFiles: string[] = []

    try {
      console.log(`[업로드 시작] ${files.length}개 파일, Album ID: ${targetAlbumId}`)
      
      // 파일을 하나씩 순차적으로 업로드 (Vercel 요청 본문 크기 제한 회피)
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const body = new FormData()
        body.append('albumId', targetAlbumId)
        body.append('files', file)

        try {
          console.log(`[업로드 중] ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body
          })

          console.log(`[업로드 응답] ${i + 1}/${files.length} - Status: ${response.status}, OK: ${response.ok}`)

          if (!response.ok) {
            let errorMessage = `서버 오류 (${response.status})`
            try {
              const result = await response.json()
              errorMessage = result.message || errorMessage
              if (result.missingEnv) {
                errorMessage += `\n\n누락된 환경 변수: ${result.missingEnv.join(', ')}\nVercel 환경 변수 설정을 확인해 주세요.`
              }
            } catch {
              const text = await response.text().catch(() => '')
              errorMessage = text || errorMessage
            }
            throw new Error(errorMessage)
          }

          const result = await response.json() as { uploads: { url: string; thumbnailUrl?: string; originalName: string }[] }
          
          if (!result.uploads || result.uploads.length === 0) {
            throw new Error('업로드된 파일이 없습니다.')
          }

          const uploaded = result.uploads[0]
          uploadedPhotos.push({
            src: uploaded.url,
            thumbnailUrl: uploaded.thumbnailUrl, // 썸네일 URL 저장
            alt: file.name || uploaded.originalName || undefined
          })
          
          console.log(`[업로드 성공] ${i + 1}/${files.length}: ${uploaded.url}`)
          
          // 중간 업데이트 제거 - 마지막에 한 번만 업데이트하여 중복 방지
        } catch (error) {
          console.error(`[업로드 실패] ${i + 1}/${files.length}: ${file.name}`, error)
          failedFiles.push(file.name)
          // 개별 파일 실패해도 계속 진행
        }
      }

      // 모든 업로드 완료 후 최종 업데이트 (중복 방지)
      if (uploadedPhotos.length > 0) {
        setFormData(prev => {
          // 기존 photos와 새로 업로드된 photos를 합치되, 중복 제거
          const existingUrls = new Set(prev.photos.map(p => p.src))
          const newPhotos = uploadedPhotos.filter(p => !existingUrls.has(p.src))
          
          const updatedPhotos = [...prev.photos, ...newPhotos]
          
          // 커버 이미지가 없으면 첫 번째 사진을 자동으로 사용
          let updatedCover = prev.cover
          if (!updatedCover && updatedPhotos.length > 0) {
            updatedCover = updatedPhotos[0].src
            console.log('[AlbumsManage] 커버 이미지 자동 설정:', updatedCover)
          }
          
          console.log('[AlbumsManage] 업로드 후 photos 업데이트:', {
            기존: prev.photos.length,
            새로추가: newPhotos.length,
            총합: updatedPhotos.length,
            커버: updatedCover,
            photos: updatedPhotos.map(p => p.src)
          })
          
          const updated = {
            ...prev,
            id: prev.id || targetAlbumId,
            photos: updatedPhotos,
            cover: updatedCover
          }
          
          // 상태 업데이트 후 즉시 확인
          setTimeout(() => {
            console.log('[AlbumsManage] 상태 업데이트 후 확인:', {
              formDataPhotos: updated.photos.length,
              formDataCover: updated.cover
            })
          }, 0)
          
          return updated
        })
      } else {
        console.warn('[AlbumsManage] 업로드된 사진이 없습니다.')
      }

      console.log(`[업로드 완료] 성공: ${uploadedPhotos.length}개, 실패: ${failedFiles.length}개`)

      if (failedFiles.length > 0) {
        alert(`${uploadedPhotos.length}개 이미지가 업로드되었습니다.\n\n다음 파일 업로드에 실패했습니다:\n${failedFiles.join('\n')}\n\n브라우저 개발자 도구(F12)의 Console을 확인해 주세요.`)
      } else {
        alert(`${uploadedPhotos.length}개 이미지가 성공적으로 업로드되었습니다.`)
      }
    } catch (error) {
      console.error('[업로드 실패]', error)
      const errorMessage = error instanceof Error ? error.message : '이미지를 업로드하는 중 오류가 발생했습니다.'
      alert(`이미지 업로드 실패:\n\n${errorMessage}\n\n브라우저 개발자 도구(F12)의 Console과 Network 탭을 확인해 주세요.`)
    } finally {
      setIsUploading(false)
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
    loadAlbums()
    uploadSessionRef.current = generateDraftId()
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      파일 업로드 (JPG, PNG)
                    </label>
                    <button
                      type="button"
                      onClick={testNaverCloudConnection}
                      className="px-3 py-1 text-xs rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      🔗 연결 테스트
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const selectedFiles = Array.from(e.target.files || [])
                      void handleFileUpload(selectedFiles)
                      e.target.value = ''
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    💡 선택한 파일은 Naver Cloud Object Storage에 업로드되고, CDN URL이 자동으로 연결됩니다.
                  </p>
                  {isUploading && (
                    <p className="mt-2 text-xs text-catholic-logo">이미지를 업로드하는 중입니다...</p>
                  )}
                  {testResult && (
                    <div className={`mt-2 p-3 rounded-lg text-xs whitespace-pre-line ${
                      testResult.success 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {testResult.message}
                    </div>
                  )}
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
                          <img 
                            src={album.cover} 
                            alt={album.title} 
                            className="w-full h-full object-cover" 
                            loading="lazy"
                            decoding="async"
                            style={{ backgroundColor: '#f3f4f6' }}
                          />
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

