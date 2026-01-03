import { useState } from 'react'

interface SocialShareButtonProps {
  url: string
  title: string
  description?: string
  imageUrl?: string
}

export default function SocialShareButton({ url, title, description, imageUrl }: SocialShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
  const shareText = description || title

  const shareToKakao = () => {
    // 카카오톡 공유 (URL 기반)
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    window.open(kakaoUrl, '_blank', 'width=600,height=600')
    setIsOpen(false)
  }

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const shareToNaver = () => {
    const naverUrl = `https://share.naver.com/web/shareView?url=${encodeURIComponent(fullUrl)}&title=${encodeURIComponent(title)}`
    window.open(naverUrl, '_blank', 'width=600,height=600')
    setIsOpen(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      alert('링크가 클립보드에 복사되었습니다.')
      setIsOpen(false)
    } catch (error) {
      console.error('클립보드 복사 실패:', error)
      // Fallback: 수동 복사
      const textarea = document.createElement('textarea')
      textarea.value = fullUrl
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        alert('링크가 클립보드에 복사되었습니다.')
      } catch (err) {
        alert('링크 복사에 실패했습니다. 수동으로 복사해주세요.')
      }
      document.body.removeChild(textarea)
      setIsOpen(false)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: fullUrl
        })
        setIsOpen(false)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('공유 실패:', error)
        }
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 hover:text-catholic-logo"
        aria-label="공유하기"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 공유 메뉴 */}
          <div className="absolute bottom-full right-0 mb-2 z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-[200px]">
            <div className="flex flex-col gap-1">
              {typeof navigator !== 'undefined' && 'share' in navigator && typeof navigator.share === 'function' && (
                <button
                  onClick={handleNativeShare}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  공유하기
                </button>
              )}
              
              <button
                onClick={shareToKakao}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FEE500">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                </svg>
                카카오톡
              </button>
              
              <button
                onClick={shareToFacebook}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                페이스북
              </button>
              
              <button
                onClick={shareToTwitter}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <svg className="w-5 h-5" fill="#1DA1F2" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                트위터
              </button>
              
              <button
                onClick={shareToNaver}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <svg className="w-5 h-5" fill="#03C75A" viewBox="0 0 24 24">
                  <path d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                </svg>
                네이버
              </button>
              
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                링크 복사
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

