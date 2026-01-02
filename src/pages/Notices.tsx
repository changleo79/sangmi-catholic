import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { notices as defaultNotices } from '../data/notices'
import { getNotices } from '../utils/storage'
import type { NoticeItem } from '../data/notices'

export default function Notices() {
  const [notices, setNotices] = useState<NoticeItem[]>([])

  const loadNotices = async (forceRefresh = false) => {
    // 먼저 캐시된 데이터를 빠르게 표시
    if (!forceRefresh) {
      const cachedNotices = await getNotices(false)
      const validCachedNotices = (cachedNotices.length > 0 ? cachedNotices : defaultNotices)
        .filter((notice): notice is NoticeItem => notice !== null && notice !== undefined && notice.title !== undefined)
        .sort((a, b) => {
          // 최신순 정렬
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA
        })
      setNotices(validCachedNotices)
    }
    
    // 백그라운드에서 서버에서 최신 데이터 로드
    const storedNotices = await getNotices(forceRefresh)
    const validStoredNotices = (storedNotices.length > 0 ? storedNotices : defaultNotices)
      .filter((notice): notice is NoticeItem => notice !== null && notice !== undefined && notice.title !== undefined)
      .sort((a, b) => {
        // 최신순 정렬
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA
      })
    setNotices(validStoredNotices)
  }

  useEffect(() => {
    loadNotices(false)
    
    // 공지사항 업데이트 이벤트 리스너
    const handleNoticesUpdate = async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadNotices(true)
    }
    
    window.addEventListener('noticesUpdated', handleNoticesUpdate)
    
    return () => {
      window.removeEventListener('noticesUpdated', handleNoticesUpdate)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            공지사항
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
            {notices.length > 0 ? (
              notices
                .filter((n): n is NoticeItem => n !== null && n !== undefined && n.title !== undefined)
                .map((n, i) => {
                  const noticeId = `${n.date}-${encodeURIComponent(n.title)}`
                  return (
                    <Link
                      key={i}
                      to={`/news/${noticeId}`}
                      className="block p-6 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-300 group cursor-pointer hover:pl-8 active:bg-purple-50/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100" style={{ backgroundColor: '#7B1F4B' }}></div>
                            <h3 className="text-xl font-semibold text-gray-900 transition-all duration-300 group-hover:font-bold" onMouseEnter={(e) => { e.currentTarget.style.color = '#7B1F4B' }} onMouseLeave={(e) => { e.currentTarget.style.color = '' }}>
                              {n.title || '(제목 없음)'}
                            </h3>
                          </div>
                          {n.summary && (
                            <p className="text-gray-600 ml-5 text-sm leading-relaxed whitespace-pre-line line-clamp-2">{n.summary}</p>
                          )}
                        </div>
                        <span className="text-gray-400 text-sm whitespace-nowrap font-medium group-hover:text-gray-500 transition-colors">
                          {n.date}
                        </span>
                      </div>
                    </Link>
                  )
                })
            ) : (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">등록된 공지사항이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

