import { useEffect, useMemo, useState, useRef } from 'react'
import { extractPdfText, fetchPdfBlob } from '../utils/pdf'

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
  const [activeTab, setActiveTab] = useState<'pdf' | 'text'>('pdf')
  const [isLoading, setIsLoading] = useState(false)
  const [textContent, setTextContent] = useState<string>('')
  const [error, setError] = useState<string>('')
  const scrollPositionRef = useRef<number>(0)

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('pdf')
      setTextContent('')
      setError('')
      // 모달이 닫힐 때 스크롤 위치 복원
      const savedPosition = scrollPositionRef.current
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      // 약간의 지연 후 스크롤 복원 (레이아웃 재계산 대기)
      setTimeout(() => {
        window.scrollTo(0, savedPosition)
      }, 10)
      return
    }

    // 모달이 열릴 때 현재 스크롤 위치 저장
    scrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollPositionRef.current}px`
    document.body.style.width = '100%'
    
    // ESC 키로 닫기
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen || activeTab !== 'text' || textContent || isLoading) return

    const loadText = async () => {
      setIsLoading(true)
      setError('')
      const text = await extractPdfText(fileUrl)
      if (text) {
        setTextContent(text)
      } else {
        setError('PDF 본문을 불러올 수 없습니다. 파일을 다운로드하여 확인해 주세요.')
      }
      setIsLoading(false)
    }

    loadText()
  }, [isOpen, activeTab, fileUrl, textContent, isLoading])

  const shareData = useMemo(() => ({
    title,
    text: description ? `${title}\n${description}` : title,
    url: fileUrl
  }), [title, description, fileUrl])

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
    if (!navigator.share) {
      alert('이 브라우저에서는 공유하기를 지원하지 않습니다. 다운로드 후 직접 공유해 주세요.')
      return
    }
    try {
      await navigator.share(shareData)
    } catch (error) {
      console.error('공유 실패:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-2 sm:p-4 animate-fade-in"
      onClick={(e) => {
        // 배경 클릭 시 닫기
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full h-full sm:h-auto sm:max-w-6xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden sm:my-4 sm:my-8 max-h-[100vh] sm:max-h-[95vh] flex flex-col">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0 sticky top-0 z-10">
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

        <div className="px-4 sm:px-6 pt-3 sm:pt-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-600">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all ${activeTab === 'pdf' ? 'bg-catholic-logo text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              PDF 보기
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all ${activeTab === 'text' ? 'bg-catholic-logo text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              HTML 보기
            </button>
          </div>
        </div>

        <div className="px-2 sm:px-4 md:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 flex-1 min-h-0 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {activeTab === 'pdf' ? (
            (() => {
              // 이미지 파일인지 확인
              const isImage = fileUrl.startsWith('data:image/') || 
                             fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                             (fileUrl.startsWith('http') && fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i))
              
              return isImage ? (
                <div className="relative w-full rounded-2xl overflow-y-auto border border-gray-100 shadow-inner bg-gray-50 flex items-start justify-center p-2 sm:p-4" style={{ minHeight: 'calc(100vh - 250px)', maxHeight: 'calc(100vh - 250px)' }}>
                  <img
                    src={fileUrl}
                    alt={title}
                    className="w-full h-auto object-contain"
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="flex flex-col items-center justify-center h-full p-8 text-gray-500">
                            <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>이미지를 불러올 수 없습니다.</p>
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner" style={{ minHeight: 'calc(100vh - 250px)', maxHeight: 'calc(100vh - 250px)' }}>
                  <iframe
                    src={`${fileUrl}#toolbar=0`}
                    title={title}
                    className="w-full h-full"
                    style={{ border: 'none' }}
                  />
                </div>
              )
            })()
          ) : (
            <div className="w-full overflow-y-auto border border-gray-100 rounded-2xl p-4 sm:p-6 bg-gray-50 text-xs sm:text-sm leading-relaxed text-gray-700" style={{ minHeight: 'calc(100vh - 250px)', maxHeight: 'calc(100vh - 250px)' }}>
              {isLoading && <p className="text-gray-500">본문을 불러오는 중입니다...</p>}
              {error && !isLoading && <p className="text-red-500">{error}</p>}
              {!isLoading && !error && textContent && (
                <div className="space-y-4 whitespace-pre-wrap">
                  {textContent.split('\n').map((paragraph, idx) => (
                    <p key={`${idx}-${paragraph.slice(0, 10)}`}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
