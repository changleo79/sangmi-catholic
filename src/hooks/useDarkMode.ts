import { useState, useEffect } from 'react'

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // localStorage에서 저장된 설정 확인
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) {
      return saved === 'true'
    }
    // 시스템 설정 확인
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    // 다크 모드 적용/제거
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(isDark))
  }, [isDark])

  const toggleDarkMode = () => {
    setIsDark(prev => !prev)
  }

  return { isDark, toggleDarkMode }
}

