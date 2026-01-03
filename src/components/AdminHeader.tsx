import { Link, useLocation } from 'react-router-dom'
import logo2 from '../../사진파일/상미성당 로고2.png'
import { useDarkMode } from '../hooks/useDarkMode'

export default function AdminHeader() {
  const location = useLocation()
  const { isDark, toggleDarkMode } = useDarkMode()

  const adminMenuItems = [
    { path: '/admin', label: '대시보드' },
    { path: '/admin/notices', label: '공지사항' },
    { path: '/admin/recruitments', label: '단체 소식' },
    { path: '/admin/bulletins', label: '주보' },
    { path: '/admin/albums', label: '앨범' },
    { path: '/admin/mass', label: '미사' },
    { path: '/admin/faqs', label: 'FAQ' },
    { path: '/admin/backups', label: '백업' },
  ]

  return (
    <header className="bg-white/98 dark:bg-gray-900/98 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 md:py-5">
          <Link to="/admin" className="flex items-center group">
            <img
              src={logo2}
              alt="아시시의 성 프란치스코 상미성당"
              className="h-14 md:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="ml-3 text-lg md:text-xl font-semibold text-gray-700">관리자</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-4">
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`admin-header-link relative text-base font-medium transition-colors whitespace-nowrap py-2 px-3 rounded-lg ${
                    isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#7B1F4B' : 'transparent',
                    color: isActive ? '#ffffff' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#7B1F4B'
                      e.currentTarget.style.backgroundColor = 'rgba(123, 31, 75, 0.1)'
                    } else {
                      // 활성 상태일 때도 흰색 유지
                      e.currentTarget.style.color = '#ffffff'
                      e.currentTarget.style.backgroundColor = '#7B1F4B'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#1f2937'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    } else {
                      // 활성 상태일 때도 흰색 유지
                      e.currentTarget.style.color = '#ffffff'
                      e.currentTarget.style.backgroundColor = '#7B1F4B'
                    }
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
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
            <Link
              to="/"
              className="text-sm md:text-base px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

