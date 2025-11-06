import { useState, useEffect } from 'react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center group touch-manipulation ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      style={{ backgroundColor: '#7B1F4B' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
      onTouchStart={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
      onTouchEnd={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
      aria-label="맨 위로"
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:-translate-y-1 transition-transform duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  )
}


