import { useState, useRef, useCallback } from 'react'

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<string>
  onUrlChange?: (url: string) => void
  currentUrl?: string
  accept?: string
  maxSizeMB?: number
  showProgress?: boolean
}

export default function ImageUploader({
  onUpload,
  onUrlChange,
  currentUrl,
  accept = 'image/*',
  maxSizeMB = 10,
  showProgress = true
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return '이미지 파일만 업로드 가능합니다.'
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`
    }
    return null
  }

  const handleFile = useCallback(async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 진행률 시뮬레이션 (실제로는 onUpload에서 처리)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const url = await onUpload(file)
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (onUrlChange) {
        onUrlChange(url)
      }
      
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [onUpload, onUrlChange, maxSizeMB])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-catholic-logo bg-purple-50 scale-105' 
            : 'border-gray-300 hover:border-catholic-logo/50 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-catholic-logo border-t-transparent rounded-full animate-spin"></div>
            {showProgress && (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-catholic-logo h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{uploadProgress}% 업로드 중...</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <svg
              className="w-12 h-12 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold text-catholic-logo">클릭하거나 드래그</span>하여 이미지 업로드
            </p>
            <p className="text-sm text-gray-500">
              {accept === 'image/*' ? '이미지 파일' : accept} (최대 {maxSizeMB}MB)
            </p>
          </>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 현재 이미지 미리보기 */}
      {currentUrl && !isUploading && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={currentUrl}
            alt="미리보기"
            className="w-full h-auto max-h-64 object-contain"
          />
          {onUrlChange && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onUrlChange('')
              }}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

