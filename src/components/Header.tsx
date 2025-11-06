import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo2 from '../../사진파일/상미성당 로고2.png'
import SearchBar from './SearchBar'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const menuItems = [
    { path: '/', label: '홈' },
    { path: '/about', label: '성당소개' },
    { path: '/news', label: '공지/소식' },
    { path: '/mass', label: '미사와 성사' },
    { path: '/albums', label: '성당앨범' },
    { path: '/organizations', label: '성당단체' },
    { path: '/office', label: '성당업무' },
    { path: '/directions', label: '오시는 길' },
  ]

  return (
    <>
      <header className="bg-white/98 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4 md:py-5">
            <Link to="/" className="flex items-center group" onClick={closeMenu}>
              <img
                src={logo2}
                alt="아시시의 성 프란치스코 상미성당"
                className="h-14 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8 ml-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative text-lg font-medium text-gray-700 transition-colors whitespace-nowrap py-2 group"
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#7B1F4B' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '' }}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#7B1F4B' }}></span>
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <SearchBar />
            </div>

            <button
              className="md:hidden text-gray-700 ml-4 relative z-50 touch-manipulation p-2 -mr-2"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
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
              <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-200">
                <SearchBar />
              </div>

              {/* 메뉴 항목 */}
              <nav className="flex-1 overflow-y-auto p-6 pt-8">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={closeMenu}
                      className={`block text-base font-medium py-3 px-4 rounded-lg transition-all duration-300 mb-2 ${
                        isActive ? 'text-white' : 'text-gray-800'
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
