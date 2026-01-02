import { Link, useLocation } from 'react-router-dom'
import logo2 from '../../사진파일/상미성당 로고2.png'

export default function AdminHeader() {
  const location = useLocation()

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
    <header className="bg-white/98 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
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
                  className={`relative text-base font-medium transition-colors whitespace-nowrap py-2 px-3 rounded-lg ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#7B1F4B' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#7B1F4B'
                      e.currentTarget.style.backgroundColor = 'rgba(123, 31, 75, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#1f2937'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm md:text-base px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

