import { useEffect, useRef } from 'react'
import { fetchPdfBlob } from '../utils/pdf'

interface PdfViewerModalProps {
  isOpen: boolean
  title: string
  description?: string
  fileUrl: string
  onClose: () => void
}

export default function PdfViewerModal({
  isOpen,
  title,
  description,
  fileUrl,
  onClose
}: PdfViewerModalProps) {
  const scrollPositionRef = useRef<number>(0)

  useEffect(() => {
    if (!isOpen) {
      // 모달이 닫힐 때는 특별한 처리 불필요 (body 스크롤이 이미 활성화되어 있음)
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
    const shareData = {
      title,
      text: description ? `${title}\n${description}` : title,
      url: fileUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error: any) {
        // 사용자가 공유를 취소한 경우는 무시
        if (error.name !== 'AbortError') {
          console.error('공유 실패:', error)
        }
      }
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 URL 복사
      try {
        await navigator.clipboard.writeText(fileUrl)
        alert('주보 링크가 클립보드에 복사되었습니다.')
      } catch (error) {
        // 클립보드 복사 실패 시 수동 복사 안내
        const textarea = document.createElement('textarea')
        textarea.value = fileUrl
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        try {
          document.execCommand('copy')
          alert('주보 링크가 클립보드에 복사되었습니다.')
        } catch (err) {
          alert(`주보 링크를 복사하려면 다음 URL을 선택하세요:\n\n${fileUrl}`)
        }
        document.body.removeChild(textarea)
      }
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
                  <img
                    src={fileUrl}
                    alt={title}
                    className="w-full h-auto object-contain"
                    style={{ 
                      maxWidth: '100%', 
                      display: 'block',
                      backgroundColor: '#f3f4f6', // 로딩 중 배경색
                      minHeight: '400px'
                    }}
                    crossOrigin={fileUrl.startsWith('http') && !fileUrl.startsWith('data:') ? 'anonymous' : undefined}
                    onError={(e) => {
                      console.error('[PdfViewerModal] 이미지 로드 실패:', fileUrl, e)
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center min-h-[400px] p-8 text-gray-500">
                            <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>이미지를 불러올 수 없습니다.</p>
                            <p class="text-xs text-gray-400 mt-2">URL: ${fileUrl.substring(0, 50)}...</p>
                          </div>
                        `
                      }
                    }}
                    onLoad={(e) => {
                      // 로드 성공 시 배경색 제거
                      e.currentTarget.style.backgroundColor = ''
                      console.log('[PdfViewerModal] 이미지 로드 성공:', fileUrl)
                      // 로드 성공 시 배경색 제거
                      const target = e.currentTarget
                      target.style.backgroundColor = 'transparent'
                    }}
                    onLoadStart={() => {
                      console.log('[PdfViewerModal] 이미지 로드 시작:', fileUrl)
                    }}
                  />
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
