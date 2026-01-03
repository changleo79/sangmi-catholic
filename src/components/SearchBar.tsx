import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  getNotices, 
  getAlbums, 
  getRecruitments, 
  getFAQs, 
  getBulletins
} from '../utils/storage'
import type { NoticeItem } from '../data/notices'

interface SearchResult {
  type: 'notice' | 'album' | 'recruitment' | 'faq' | 'bulletin'
  id: string
  title: string
  subtitle?: string
  url: string
  date?: string
}

interface SearchFilters {
  categories: ('notice' | 'album' | 'recruitment' | 'faq' | 'bulletin')[]
  startDate?: string
  endDate?: string
}

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY = 10
const POPULAR_SEARCHES_KEY = 'popular_searches'

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([])
  const [filters, setFilters] = useState<SearchFilters>({
    categories: ['notice', 'album', 'recruitment', 'faq', 'bulletin']
  })
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // 검색 기록 로드
  useEffect(() => {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (history) {
      try {
        setSearchHistory(JSON.parse(history))
      } catch (e) {
        console.error('검색 기록 로드 실패:', e)
      }
    }

    const popular = localStorage.getItem(POPULAR_SEARCHES_KEY)
    if (popular) {
      try {
        const parsed = JSON.parse(popular)
        setPopularSearches(parsed.sort((a: any, b: any) => b.count - a.count).slice(0, 5))
      } catch (e) {
        console.error('인기 검색어 로드 실패:', e)
      }
    }
  }, [])

  // 검색 기록 저장
  const saveSearchHistory = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, MAX_HISTORY)
    setSearchHistory(newHistory)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))

    // 인기 검색어 업데이트
    const popular = JSON.parse(localStorage.getItem(POPULAR_SEARCHES_KEY) || '[]')
    const existing = popular.find((p: any) => p.query === searchQuery)
    if (existing) {
      existing.count++
    } else {
      popular.push({ query: searchQuery, count: 1 })
    }
    localStorage.setItem(POPULAR_SEARCHES_KEY, JSON.stringify(popular))
    setPopularSearches(popular.sort((a: any, b: any) => b.count - a.count).slice(0, 5))
  }

  // 검색어 하이라이트 함수
  const highlightText = (text: string, searchQuery: string): React.ReactNode => {
    if (!searchQuery.trim()) return text
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, index) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : (
        part
      )
    )
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length > 0) {
        setIsSearching(true)
        const searchResults: SearchResult[] = []
        const queryLower = query.toLowerCase()

        // 공지사항 검색
        if (filters.categories.includes('notice')) {
          const notices = await getNotices()
          notices.forEach((notice: NoticeItem) => {
            // 날짜 필터 확인
            if (filters.startDate || filters.endDate) {
              const noticeDate = new Date(notice.date)
              if (filters.startDate && noticeDate < new Date(filters.startDate)) return
              if (filters.endDate) {
                const endDate = new Date(filters.endDate)
                endDate.setHours(23, 59, 59, 999)
                if (noticeDate > endDate) return
              }
            }
            
            if (
              notice.title.toLowerCase().includes(queryLower) ||
              notice.summary?.toLowerCase().includes(queryLower) ||
              notice.content?.toLowerCase().includes(queryLower)
            ) {
              searchResults.push({
                type: 'notice',
                id: notice.date + notice.title,
                title: notice.title,
                subtitle: `공지사항 · ${notice.date}`,
                url: `/news/${encodeURIComponent(notice.date + '-' + notice.title)}`,
                date: notice.date
              })
            }
          })
        }

        // 앨범 검색
        if (filters.categories.includes('album')) {
          const albums = await getAlbums()
          albums.forEach((album) => {
            if (filters.startDate || filters.endDate) {
              const albumDate = new Date(album.date)
              if (filters.startDate && albumDate < new Date(filters.startDate)) return
              if (filters.endDate) {
                const endDate = new Date(filters.endDate)
                endDate.setHours(23, 59, 59, 999)
                if (albumDate > endDate) return
              }
            }
            
            if (album.title.toLowerCase().includes(queryLower)) {
              searchResults.push({
                type: 'album',
                id: album.id,
                title: album.title,
                subtitle: `앨범 · ${album.date}`,
                url: `/albums/${album.id}`,
                date: album.date
              })
            }
          })
        }

        // 단체 소식 검색
        if (filters.categories.includes('recruitment')) {
          const recruitments = await getRecruitments()
          recruitments.forEach((recruitment) => {
            if (
              recruitment.title.toLowerCase().includes(queryLower) ||
              recruitment.summary?.toLowerCase().includes(queryLower) ||
              recruitment.content?.toLowerCase().includes(queryLower)
            ) {
              searchResults.push({
                type: 'recruitment',
                id: recruitment.id,
                title: recruitment.title,
                subtitle: `단체 소식`,
                url: `/recruitments/${recruitment.id}`
              })
            }
          })
        }

        // FAQ 검색
        if (filters.categories.includes('faq')) {
          const faqs = await getFAQs()
          faqs.forEach((faq) => {
            if (
              faq.question.toLowerCase().includes(queryLower) ||
              faq.answer.toLowerCase().includes(queryLower)
            ) {
              searchResults.push({
                type: 'faq',
                id: faq.id,
                title: faq.question,
                subtitle: `자주 묻는 질문`,
                url: '/office'
              })
            }
          })
        }

        // 주보 안내 검색
        if (filters.categories.includes('bulletin')) {
          const bulletins = await getBulletins()
          bulletins.forEach((bulletin) => {
            if (filters.startDate || filters.endDate) {
              const bulletinDate = new Date(bulletin.date)
              if (filters.startDate && bulletinDate < new Date(filters.startDate)) return
              if (filters.endDate) {
                const endDate = new Date(filters.endDate)
                endDate.setHours(23, 59, 59, 999)
                if (bulletinDate > endDate) return
              }
            }
            
            if (
              bulletin.title.toLowerCase().includes(queryLower) ||
              bulletin.description?.toLowerCase().includes(queryLower)
            ) {
              searchResults.push({
                type: 'bulletin',
                id: bulletin.id,
                title: bulletin.title,
                subtitle: `주보 안내 · ${bulletin.date}`,
                url: '/news',
                date: bulletin.date
              })
            }
          })
        }

        setResults(searchResults.slice(0, 10)) // 최대 10개 결과
        setIsSearching(false)
      } else {
        setResults([])
      }
    }
    performSearch()
  }, [query, filters])

  const handleResultClick = (url: string) => {
    if (query.trim()) {
      saveSearchHistory(query.trim())
    }
    navigate(url)
    setIsOpen(false)
    setQuery('')
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    setIsOpen(true)
  }

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Button - Desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden md:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="검색"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      
      {/* Mobile Search Input - 항상 표시 */}
      <div className="md:hidden">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="전체 검색..."
            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {/* Mobile Search Results - 메뉴 안에 표시 */}
        {isOpen && query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-catholic-logo"></div>
                <p className="mt-2 text-sm">검색 중...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        result.type === 'notice' 
                          ? 'bg-blue-100 text-blue-600'
                          : result.type === 'album'
                          ? 'bg-purple-100 text-purple-600'
                          : result.type === 'recruitment'
                          ? 'bg-green-100 text-green-600'
                          : result.type === 'faq'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {result.type === 'notice' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        ) : result.type === 'album' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : result.type === 'recruitment' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ) : result.type === 'faq' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {highlightText(result.title, query)}
                        </p>
                        {result.subtitle && (
                          <p className="text-sm text-gray-500">{result.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim().length > 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="p-4">
                {/* 검색 기록 */}
                {searchHistory.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-gray-700">최근 검색</h3>
                      <button
                        onClick={() => {
                          setSearchHistory([])
                          localStorage.removeItem(SEARCH_HISTORY_KEY)
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        전체 삭제
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((history, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHistoryClick(history)}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {history}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 인기 검색어 */}
                {popularSearches.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">인기 검색어</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((popular, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHistoryClick(popular.query)}
                          className="px-3 py-1.5 text-xs bg-catholic-logo/10 text-catholic-logo rounded-full hover:bg-catholic-logo/20 transition-colors font-medium"
                        >
                          {popular.query} ({popular.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchHistory.length === 0 && popularSearches.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">검색어를 입력하세요.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Dropdown - Desktop only */}
      {isOpen && (
        <div className="hidden md:block absolute right-0 top-full mt-2 w-80 lg:w-96 max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="전체 검색..."
                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                autoFocus
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* 고급 검색 토글 */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-2 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>고급 검색</span>
              <svg
                className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* 고급 검색 옵션 */}
            {showAdvanced && (
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                {/* 카테고리 필터 */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">검색 범위</label>
                  <div className="flex flex-wrap gap-2">
                    {(['notice', 'album', 'recruitment', 'faq', 'bulletin'] as const).map((category) => (
                      <label key={category} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({
                                ...filters,
                                categories: [...filters.categories, category]
                              })
                            } else {
                              setFilters({
                                ...filters,
                                categories: filters.categories.filter(c => c !== category)
                              })
                            }
                          }}
                          className="w-3 h-3 rounded border-gray-300 text-catholic-logo focus:ring-catholic-logo"
                        />
                        <span className="text-xs text-gray-700">
                          {category === 'notice' ? '공지사항' :
                           category === 'album' ? '앨범' :
                           category === 'recruitment' ? '단체소식' :
                           category === 'faq' ? 'FAQ' : '주보'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* 날짜 범위 */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">시작일</label>
                    <input
                      type="date"
                      value={filters.startDate || ''}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-catholic-logo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">종료일</label>
                    <input
                      type="date"
                      value={filters.endDate || ''}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                      className="w-full px-2 py-1 text-xs rounded border border-gray-300 focus:ring-1 focus:ring-catholic-logo"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Results - 메뉴 안에 표시 */}
          <div className="md:hidden max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-catholic-logo"></div>
                <p className="mt-2 text-sm">검색 중...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        result.type === 'notice' 
                          ? 'bg-blue-100 text-blue-600'
                          : result.type === 'album'
                          ? 'bg-purple-100 text-purple-600'
                          : result.type === 'recruitment'
                          ? 'bg-green-100 text-green-600'
                          : result.type === 'faq'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {result.type === 'notice' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        ) : result.type === 'album' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : result.type === 'recruitment' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ) : result.type === 'faq' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {highlightText(result.title, query)}
                        </p>
                        {result.subtitle && (
                          <p className="text-sm text-gray-500">{result.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim().length > 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="p-4">
                {/* 검색 기록 */}
                {searchHistory.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-gray-700">최근 검색</h3>
                      <button
                        onClick={() => {
                          setSearchHistory([])
                          localStorage.removeItem(SEARCH_HISTORY_KEY)
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        전체 삭제
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((history, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHistoryClick(history)}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {history}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 인기 검색어 */}
                {popularSearches.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">인기 검색어</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((popular, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHistoryClick(popular.query)}
                          className="px-3 py-1.5 text-xs bg-catholic-logo/10 text-catholic-logo rounded-full hover:bg-catholic-logo/20 transition-colors font-medium"
                        >
                          {popular.query} ({popular.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchHistory.length === 0 && popularSearches.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">검색어를 입력하세요.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Desktop Results */}
          <div className="hidden md:block max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-catholic-logo"></div>
                <p className="mt-2 text-sm">검색 중...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result.url)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        result.type === 'notice' 
                          ? 'bg-blue-100 text-blue-600'
                          : result.type === 'album'
                          ? 'bg-purple-100 text-purple-600'
                          : result.type === 'recruitment'
                          ? 'bg-green-100 text-green-600'
                          : result.type === 'faq'
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {result.type === 'notice' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        ) : result.type === 'album' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : result.type === 'recruitment' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        ) : result.type === 'faq' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {highlightText(result.title, query)}
                        </p>
                        {result.subtitle && (
                          <p className="text-sm text-gray-500">{result.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim().length > 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="p-4">
                {/* 검색 기록 */}
                {searchHistory.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-semibold text-gray-700">최근 검색</h3>
                      <button
                        onClick={() => {
                          setSearchHistory([])
                          localStorage.removeItem(SEARCH_HISTORY_KEY)
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        전체 삭제
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((history, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHistoryClick(history)}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {history}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* 인기 검색어 */}
                {popularSearches.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">인기 검색어</h3>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((popular, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHistoryClick(popular.query)}
                          className="px-3 py-1.5 text-xs bg-catholic-logo/10 text-catholic-logo rounded-full hover:bg-catholic-logo/20 transition-colors font-medium"
                        >
                          {popular.query} ({popular.count})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {searchHistory.length === 0 && popularSearches.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <p className="text-sm">검색어를 입력하세요.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

