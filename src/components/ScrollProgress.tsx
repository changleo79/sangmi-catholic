import { useState, useEffect } from 'react'

export default function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollableHeight = documentHeight - windowHeight
      const progress = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', updateScrollProgress)
    updateScrollProgress()

    return () => {
      window.removeEventListener('scroll', updateScrollProgress)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50 transition-all duration-150"
      style={{
        background: `linear-gradient(to right, #7B1F4B ${scrollProgress}%, transparent ${scrollProgress}%)`,
        opacity: scrollProgress > 0 ? 1 : 0
      }}
    />
  )
}

