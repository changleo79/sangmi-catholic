import { useEffect, useMemo, useState } from 'react'
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

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('pdf')
      setTextContent('')
      setError('')
      return
    }

    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

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
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-catholic-logo hover:bg-catholic-logo/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v.01M4 12a8 8 0 018-8m-4 8a4 4 0 104 4m6 0a2 2 0 11-4 0 2 2 0 014 0zm4 0v.01" />
              </svg>
              공유
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-catholic-logo hover:bg-catholic-logo/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v16h16V4H4zm4 4h8m-4 8V8" />
              </svg>
              다운로드
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="닫기"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-2 rounded-full transition-all ${activeTab === 'pdf' ? 'bg-catholic-logo text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              PDF 보기
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-4 py-2 rounded-full transition-all ${activeTab === 'text' ? 'bg-catholic-logo text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              HTML 보기
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          {activeTab === 'pdf' ? (
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
              <iframe
                src={`${fileUrl}#toolbar=0`}
                title={title}
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
          ) : (
            <div className="w-full h-[70vh] overflow-y-auto border border-gray-100 rounded-2xl p-6 bg-gray-50 text-sm leading-relaxed text-gray-700">
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
