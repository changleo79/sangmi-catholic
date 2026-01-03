import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { notices as defaultNotices } from '../data/notices'
import { getNotices } from '../utils/storage'
import type { NoticeItem } from '../data/notices'
import InfiniteScroll from '../components/InfiniteScroll'
import Pagination from '../components/Pagination'
import FilterBar, { FilterOptions } from '../components/FilterBar'

const ITEMS_PER_PAGE = 20

export default function Notices() {
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [displayMode, setDisplayMode] = useState<'infinite' | 'pagination'>('infinite')
  const [currentPage, setCurrentPage] = useState(1)
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [filters, setFilters] = useState<FilterOptions>({})

  // 필터링된 공지사항
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      // 중요공지 필터
      if (filters.importantOnly && !notice.isImportant) {
        return false
      }

      // 날짜 범위 필터
      if (filters.startDate) {
        const noticeDate = new Date(notice.date)
        const startDate = new Date(filters.startDate)
        if (noticeDate < startDate) {
          return false
        }
      }

      if (filters.endDate) {
        const noticeDate = new Date(notice.date)
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999) // 종료일 포함
        if (noticeDate > endDate) {
          return false
        }
      }

      // 연도 필터
      if (filters.year) {
        const noticeYear = new Date(notice.date).getFullYear().toString()
        if (noticeYear !== filters.year) {
          return false
        }
      }

      return true
    })
  }, [notices, filters])

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

  // 표시할 항목들 계산
  const displayedNotices = useMemo(() => {
    if (displayMode === 'infinite') {
      return filteredNotices.slice(0, displayedCount)
    } else {
      const start = (currentPage - 1) * ITEMS_PER_PAGE
      const end = start + ITEMS_PER_PAGE
      return filteredNotices.slice(start, end)
    }
  }, [filteredNotices, displayMode, displayedCount, currentPage])

  const totalPages = Math.ceil(filteredNotices.length / ITEMS_PER_PAGE)
  const hasMore = displayedCount < filteredNotices.length

  // 필터 변경 시 페이지/카운트 리셋
  useEffect(() => {
    setCurrentPage(1)
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [filters])

  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, notices.length))
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
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            공지사항
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-4" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          <p className="text-gray-600 text-lg mb-6">
            총 {filteredNotices.length}개의 공지사항 {filters.importantOnly || filters.startDate || filters.endDate || filters.year ? `(필터 적용: ${notices.length}개 중)` : `(전체 ${notices.length}개)`}
          </p>
          
          {/* 필터 바 */}
          <FilterBar
            onFilterChange={setFilters}
            showImportantFilter={true}
            showDateRange={true}
            showYearFilter={true}
          />
          
          {/* 표시 모드 선택 */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => {
                setDisplayMode('infinite')
                setDisplayedCount(ITEMS_PER_PAGE)
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                displayMode === 'infinite'
                  ? 'bg-catholic-logo text-white border-catholic-logo'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              자동 로드
            </button>
            <button
              onClick={() => {
                setDisplayMode('pagination')
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                displayMode === 'pagination'
                  ? 'bg-catholic-logo text-white border-catholic-logo'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              페이지 번호
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
            {displayedNotices.length > 0 ? (
              <InfiniteScroll
                hasMore={displayMode === 'infinite' && hasMore}
                loadMore={loadMore}
                loading={false}
              >
                {displayedNotices
                  .filter((n): n is NoticeItem => n !== null && n !== undefined && n.title !== undefined)
                  .map((n, i) => {
                    const noticeId = `${n.date}-${encodeURIComponent(n.title)}`
                    return (
                      <Link
                        key={`${n.date}-${n.title}-${i}`}
                        to={`/news/${noticeId}`}
                        className="block p-6 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-300 group cursor-pointer hover:pl-8 active:bg-purple-50/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {n.isImportant && (
                                <span className="px-2 py-1 text-xs font-semibold text-white rounded" style={{ backgroundColor: '#7B1F4B' }}>
                                  중요
                                </span>
                              )}
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
                  })}
              </InfiniteScroll>
            ) : (
              <div className="p-12 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">등록된 공지사항이 없습니다.</p>
              </div>
            )}
          </div>
          
          {/* 페이지네이션 */}
          {displayMode === 'pagination' && filteredNotices.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredNotices.length}
            />
          )}
        </div>
      </div>
    </div>
  )
}

