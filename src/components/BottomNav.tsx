import { Link, useLocation } from 'react-router-dom'

const navItems = [
  {
    to: '/mass',
    label: '미사 안내',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    to: '/news',
    label: '공지/소식',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h6a2 2 0 012 2v15z" />
      </svg>
    )
  },
  {
    to: '/organizations',
    label: '본당단체',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M12 14a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    )
  },
  {
    to: '/albums',
    label: '본당 앨범',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h9" />
      </svg>
    )
  }
]

export default function BottomNav() {
  const location = useLocation()
  const hiddenOnRoutes = ['/admin', '/admin/login']

  if (hiddenOnRoutes.some((path) => location.pathname.startsWith(path))) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[200] md:hidden">
      <div className="mx-auto max-w-md px-2.5 pb-1.5">
        <div className="grid grid-cols-4 gap-1.5 rounded-[22px] bg-white/90 backdrop-blur-xl border border-white shadow-2xl p-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 py-1 rounded-xl text-[10px] font-semibold transition-all duration-200 ${
                  isActive ? 'bg-catholic-logo text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center justify-center w-6 h-6">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
