import { useEffect, useRef, useState } from 'react'
import { fetchPdfBlob } from '../utils/pdf'

interface PdfViewerModalProps {
  isOpen: boolean
  title: string
  description?: string
  fileUrl: string
  onClose: () => void
}

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

export default function PdfViewerModal({
  isOpen,
  title,
  description,
  fileUrl,
  onClose
}: PdfViewerModalProps) {
  const scrollPositionRef = useRef<number>(0)
  const [imageError, setImageError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [imageSrc, setImageSrc] = useState<string>(fileUrl)

  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때 상태 초기화
      setImageError(false)
      setRetryCount(0)
      return
    }

    // 모달이 열릴 때 현재 스크롤 위치 저장 (스크롤 복원용)
    scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    
    // body 스크롤은 허용 (모달 바깥에서 스크롤)
    // 모달은 fixed로 배치하되, body는 자유롭게 스크롤 가능
    
    // ESC 키로 닫기
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // fileUrl이 변경되면 에러 상태 초기화 및 이미지 소스 업데이트
  useEffect(() => {
    setImageError(false)
    setRetryCount(0)
    
    // 이미지 파일인 경우 프록시 URL 사용
    const isImage = fileUrl.startsWith('data:image/') || 
                   fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ||
                   (fileUrl.startsWith('http') && fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i))
    
    if (isImage) {
      setImageSrc(getProxiedImageUrl(fileUrl))
    } else {
      setImageSrc(fileUrl)
    }
  }, [fileUrl])



  const handleDownload = async () => {
    const blob = await fetchPdfBlob(fileUrl)
    if (!blob) {
      alert('PDF 파일을 다운로드할 수 없습니다. 연결을 확인해 주세요.')
      return
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.replace(/\s+/g, '_')}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    // 공유할 URL: 현재 페이지 URL 또는 파일 URL
    const shareUrl = window.location.href || fileUrl
    const shareData = {
      title,
      text: description ? `${title}\n${description}` : title,
      url: shareUrl
    }

    // 모바일 감지
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768

    // 모바일에서만 Web Share API 사용 (HTTPS 또는 localhost에서만 작동)
    if (isMobileDevice && navigator.share && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      try {
        await navigator.share(shareData)
        console.log('[PdfViewerModal] 공유 성공 (모바일)')
        return
      } catch (error: any) {
        // 사용자가 공유를 취소한 경우는 무시
        if (error.name === 'AbortError') {
          console.log('[PdfViewerModal] 공유 취소됨')
          return
        }
        console.error('[PdfViewerModal] 공유 실패:', error)
        // 공유 실패 시 클립보드 복사로 fallback
      }
    }
    
    // PC 또는 Web Share API 실패 시 클립보드에 URL 복사
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        alert('주보 링크가 클립보드에 복사되었습니다.')
        console.log('[PdfViewerModal] 클립보드 복사 성공:', shareUrl)
      } else {
        throw new Error('Clipboard API not available')
      }
    } catch (error) {
      console.error('[PdfViewerModal] 클립보드 복사 실패, execCommand 시도:', error)
      // 클립보드 복사 실패 시 수동 복사 안내
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '0'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          alert('주보 링크가 클립보드에 복사되었습니다.')
          console.log('[PdfViewerModal] execCommand 복사 성공')
        } else {
          throw new Error('execCommand failed')
        }
      } catch (err) {
        console.error('[PdfViewerModal] execCommand 복사 실패:', err)
        // 최종 fallback: URL 표시
        const confirmed = confirm(`주보 링크를 복사하려면 다음 URL을 선택하세요:\n\n${shareUrl}\n\n확인을 누르면 URL이 새 창에서 열립니다.`)
        if (confirmed) {
          window.open(shareUrl, '_blank', 'noopener,noreferrer')
        }
      }
      document.body.removeChild(textarea)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-2 sm:p-4 animate-fade-in"
      onClick={(e) => {
        // 배경 클릭 시 닫기
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full h-full sm:w-[90%] sm:max-w-5xl sm:h-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-visible flex flex-col" style={{ marginTop: 0, marginBottom: 0 }}>
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-white flex-shrink-0 sticky top-0 z-20" style={{ backgroundColor: '#ffffff' }}>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 truncate">{title}</h2>
            {description && <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{description}</p>}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-catholic-logo hover:bg-catholic-logo/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v.01M4 12a8 8 0 018-8m-4 8a4 4 0 104 4m6 0a2 2 0 11-4 0 2 2 0 014 0zm4 0v.01" />
              </svg>
              <span className="hidden sm:inline">공유</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:text-catholic-logo hover:bg-catholic-logo/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm4 4h8m-4 8V8" />
              </svg>
              <span className="hidden sm:inline">다운로드</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClose()
              }}
              className="inline-flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              aria-label="닫기"
            >
              <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div 
          data-pdf-modal-content
          className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 flex-1 min-h-0 overflow-visible" 
          style={{ 
            scrollBehavior: 'auto'
          } as React.CSSProperties}
        >
          {(() => {
            // 이미지 파일인지 확인
            const isImage = fileUrl.startsWith('data:image/') || 
                           fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                           (fileUrl.startsWith('http') && fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i))
            
            return isImage ? (
                <div className="relative w-full rounded-2xl border border-gray-100 shadow-inner bg-gray-50 flex items-start justify-center p-2 sm:p-4" style={{ minHeight: '400px' }}>
                  {imageError ? (
                    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-gray-500">
                      <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-center mb-2">이미지를 불러올 수 없습니다.</p>
                      <p className="text-xs text-gray-400 mb-4 break-all text-center px-4">
                        URL: {fileUrl.length > 80 ? `${fileUrl.substring(0, 80)}...` : fileUrl}
                      </p>
                      {retryCount < 2 && (
                        <button
                          onClick={() => {
                            setImageError(false)
                            setRetryCount(prev => prev + 1)
                          }}
                          className="px-4 py-2 rounded-lg bg-catholic-logo text-white hover:bg-catholic-logo-dark transition-colors text-sm"
                        >
                          다시 시도
                        </button>
                      )}
                    </div>
                  ) : (
                    <img
                      key={`img-${imageSrc}-${retryCount}`}
                      src={imageSrc}
                      alt={title}
                      className="w-full h-auto object-contain"
                      style={{ 
                        maxWidth: '100%', 
                        display: 'block',
                        backgroundColor: '#f3f4f6', // 로딩 중 배경색
                        minHeight: '400px'
                      }}
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        console.error('[PdfViewerModal] 이미지 로드 실패:', imageSrc, fileUrl)
                        // 프록시를 통해 로드했는데 실패하면 프록시 URL에 타임스탬프 추가하여 재시도 (원본 URL로 재시도하지 않음)
                        if (imageSrc.includes('/api/proxy-image') && retryCount < 2 && !imageSrc.includes('_retry=')) {
                          console.log('[PdfViewerModal] 프록시 실패, 프록시 URL 재시도:', fileUrl)
                          const proxiedUrl = getProxiedImageUrl(fileUrl)
                          setImageSrc(`${proxiedUrl}&_retry=${Date.now()}`)
                          setRetryCount(prev => prev + 1)
                        } else {
                          setImageError(true)
                        }
                      }}
                      onLoad={(e) => {
                        // 로드 성공 시 배경색 제거
                        const target = e.currentTarget
                        target.style.backgroundColor = 'transparent'
                        setImageError(false)
                        console.log('[PdfViewerModal] 이미지 로드 성공:', imageSrc)
                      }}
                      onLoadStart={() => {
                        console.log('[PdfViewerModal] 이미지 로드 시작:', imageSrc)
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner" style={{ minHeight: '600px', height: '80vh' }}>
                  <iframe
                    key={`iframe-${fileUrl}`}
                    src={`${fileUrl}#toolbar=0&zoom=page-fit&view=FitH`}
                    title={title}
                    className="w-full h-full"
                    style={{ border: 'none', minHeight: '600px' }}
                    onLoad={() => {
                      console.log('[PdfViewerModal] iframe 로드 성공:', fileUrl)
                    }}
                  />
                </div>
              )
          })()}
        </div>
      </div>
    </div>
  )
}
