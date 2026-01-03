import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo2 from '../../사진파일/상미성당 로고2.png'
import SearchBar from './SearchBar'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { isDark, toggleDarkMode } = useDarkMode()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape 키로 메뉴 닫기
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu()
        menuButtonRef.current?.focus()
      }
      
      // Alt+M으로 메뉴 토글
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        toggleMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  // 메뉴가 열릴 때 첫 번째 링크에 포커스
  useEffect(() => {
    if (isMenuOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector('a') as HTMLAnchorElement
      firstLink?.focus()
    }
  }, [isMenuOpen])

  const menuItems = [
    { path: '/', label: '홈' },
    { path: '/about', label: '본당소개' },
    { path: '/news', label: '공지/소식' },
    { path: '/mass', label: '미사와 성사' },
    { path: '/albums', label: '본당앨범' },
    { path: '/organizations', label: '본당단체' },
    { path: '/office', label: '자주 묻는 질문' },
    { path: '/directions', label: '오시는 길' },
  ]

  return (
    <>
      <header className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 md:py-5">
            <Link to="/" className="flex items-center group" onClick={closeMenu}>
              <img
                src={logo2}
                alt="아시시의 성 프란치스코 상미성당"
                className="h-14 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8 ml-4" role="navigation" aria-label="메인 네비게이션">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-lg font-medium transition-colors whitespace-nowrap py-2 group focus:outline-none focus:ring-2 focus:ring-catholic-logo focus:ring-offset-2 rounded ${
                      isActive ? 'text-catholic-logo dark:text-catholic-logo' : 'text-gray-700 dark:text-gray-300'
                    }`}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#7B1F4B' }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '' }}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="relative z-10">{item.label}</span>
                    <span className={`absolute bottom-0 left-0 h-0.5 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} style={{ backgroundColor: '#7B1F4B' }}></span>
                  </Link>
                )
              })}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-catholic-logo focus:ring-offset-2"
                aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <SearchBar />
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-catholic-logo focus:ring-offset-2"
                aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
                title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                ref={menuButtonRef}
                className="text-gray-700 dark:text-gray-300 ml-2 relative z-50 touch-manipulation p-2 -mr-2 focus:outline-none focus:ring-2 focus:ring-catholic-logo focus:ring-offset-2 rounded"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
              {isMenuOpen ? (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - 슬라이드 인 방식 */}
      {isMenuOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="md:hidden fixed inset-0 z-[45] mobile-menu-overlay"
            onClick={closeMenu}
            style={{
              opacity: isMenuOpen ? 1 : 0,
            }}
          />
          {/* 메뉴 패널 */}
          <div
            className={`md:hidden fixed inset-y-0 left-0 z-[46] mobile-menu-panel ${isMenuOpen ? 'open' : ''}`}
            style={{
              top: '73px',
            }}
          >
            <div className="h-full flex flex-col">
              {/* 검색바 (모바일) */}
              <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <SearchBar />
              </div>

              {/* 메뉴 항목 */}
              <nav className="flex-1 overflow-y-auto p-6 pt-8 bg-white dark:bg-gray-900">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className={`block text-base font-medium py-3 px-4 rounded-lg transition-all duration-300 mb-2 ${
                        isActive ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#7B1F4B' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'rgba(123, 31, 75, 0.1)'
                          e.currentTarget.style.color = '#7B1F4B'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.color = '#1f2937'
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  )
}
