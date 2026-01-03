import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getNotices, getAlbums } from '../utils/storage'
import type { NoticeItem } from '../data/notices'

const navItems = [
  {
    to: '/mass',
    label: '미사 안내',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    badgeKey: null as string | null
  },
  {
    to: '/news',
    label: '공지/소식',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h6a2 2 0 012 2v15z" />
      </svg>
    ),
    badgeKey: 'notices' as string | null
  },
  {
    to: '/organizations',
    label: '본당단체',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M12 14a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
    badgeKey: null as string | null
  },
  {
    to: '/albums',
    label: '본당 앨범',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h9" />
      </svg>
    ),
    badgeKey: 'albums' as string | null
  }
]

export default function BottomNav() {
  const location = useLocation()
  const hiddenOnRoutes = ['/admin', '/admin/login']
  const [badgeCounts, setBadgeCounts] = useState<{ notices: number; albums: number }>({
    notices: 0,
    albums: 0
  })

  // 최근 7일 이내의 공지사항과 앨범 개수 계산
  useEffect(() => {
    const loadBadgeCounts = async () => {
      try {
        const [notices, albums] = await Promise.all([
          getNotices(false),
          getAlbums(false)
        ])

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const recentNotices = notices.filter((notice: NoticeItem) => {
          if (!notice.date) return false
          const noticeDate = new Date(notice.date)
          return noticeDate >= sevenDaysAgo
        })

        const recentAlbums = albums.filter((album: any) => {
          if (!album.date) return false
          const albumDate = new Date(album.date)
          return albumDate >= sevenDaysAgo
        })

        setBadgeCounts({
          notices: recentNotices.length,
          albums: recentAlbums.length
        })
      } catch (error) {
        console.error('[BottomNav] 배지 개수 로드 오류:', error)
      }
    }

    loadBadgeCounts()
    
    // 5분마다 업데이트
    const interval = setInterval(loadBadgeCounts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (hiddenOnRoutes.some((path) => location.pathname.startsWith(path))) {
    return null
  }

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[200] md:hidden"
      role="navigation"
      aria-label="하단 네비게이션"
    >
      <div className="mx-auto max-w-md px-2.5 pb-1.5">
        <div className="grid grid-cols-4 gap-1.5 rounded-[22px] bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white dark:border-gray-700 shadow-2xl p-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to))
            const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey as keyof typeof badgeCounts] : 0
            const showBadge = badgeCount > 0 && !isActive
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative flex flex-col items-center gap-0.5 py-1 rounded-xl text-[10px] font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-catholic-logo focus:ring-offset-2 ${
                  isActive ? 'bg-catholic-logo text-white shadow-lg' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label={`${item.label} 페이지로 이동${showBadge ? ` (새 항목 ${badgeCount}개)` : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="relative flex items-center justify-center w-6 h-6" aria-hidden="true">
                  {item.icon}
                  {showBadge && (
                    <span 
                      className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none"
                      aria-label={`새 항목 ${badgeCount}개`}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
