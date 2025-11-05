interface ShareButtonProps {
  url: string
  title: string
  description?: string
}

export default function ShareButton({ url, title, description }: ShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title,
      text: description || title,
      url: window.location.origin + url
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // 사용자가 공유를 취소한 경우
        console.log('공유 취소됨')
      }
    } else {
      // Web Share API를 지원하지 않는 경우 클립보드에 복사
      const fullUrl = window.location.origin + url
      navigator.clipboard.writeText(fullUrl).then(() => {
        alert('링크가 클립보드에 복사되었습니다.')
      })
    }
  }

  return (
    <button
      onClick={handleShare}
      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-catholic-logo"
      aria-label="공유하기"
      style={{ color: '#7B1F4B' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = '#5a1538' }}
      onMouseLeave={(e) => { e.currentTarget.style.color = '#7B1F4B' }}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    </button>
  )
}

