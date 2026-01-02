import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { notices as defaultNotices } from '../data/notices'
import { getNotices } from '../utils/storage'
import { getRecruitments, getBulletins, type RecruitmentItem, type BulletinItem } from '../utils/storage'
import PdfViewerModal from '../components/PdfViewerModal'
import type { NoticeItem } from '../data/notices'

// 이미지 URL을 프록시를 통해 로드하는 함수
const getProxiedImageUrl = (url: string): string => {
  // data: URL이나 같은 도메인 이미지는 그대로 사용
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url
  }
  
  // 외부 이미지는 프록시를 통해 로드
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/proxy-image?url=${encodeURIComponent(url)}`
  }
  
  return url
}

export default function News() {
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [recruit, setRecruit] = useState<RecruitmentItem[]>([])
  const [bulletins, setBulletins] = useState<BulletinItem[]>([])
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinItem | null>(null)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  
  // 초기 표시 개수
  const initialNoticesCount = 4
  const initialRecruitCount = 4
  const initialBulletinsCount = 3

  // 모바일 감지 함수
  const isMobile = () => {
    return window.innerWidth < 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.matchMedia && window.matchMedia('(max-width: 767px)').matches)
  }

  const loadData = async (forceRefresh = false) => {
    // 먼저 캐시된 데이터를 빠르게 표시 (앨범처럼)
    if (!forceRefresh) {
      const [cachedNotices, cachedRecruitments, cachedBulletins] = await Promise.all([
        getNotices(false),
        getRecruitments(false),
        getBulletins(false)
      ])
      
      // null 항목 필터링 및 최신순 정렬
      const validCachedNotices = (cachedNotices.length > 0 ? cachedNotices : defaultNotices)
        .filter((notice): notice is NoticeItem => notice !== null && notice !== undefined && notice.title !== undefined)
        .sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA // 최신순
        })
      setNotices(validCachedNotices)

      if (cachedRecruitments.length > 0) {
        const validCachedRecruitments = cachedRecruitments
          .filter((recruitment): recruitment is RecruitmentItem => recruitment !== null && recruitment !== undefined && recruitment.title !== undefined)
        setRecruit(validCachedRecruitments)
      } else {
        setRecruit([
          { id: '1', title: '전례 성가단 단원 모집', summary: '주일 11시 미사 전례 성가단 단원 모집' },
          { id: '2', title: '주일학교 교사 모집', summary: '신앙으로 아이들을 함께 돌보실 교사 모집' }
        ])
      }
      
      // 최신순 정렬 (null 필터링 후)
      const validCachedBulletins = cachedBulletins
        .filter((bulletin): bulletin is BulletinItem => bulletin !== null && bulletin !== undefined && bulletin.title !== undefined)
      const sortedCachedBulletins = validCachedBulletins.sort((a: BulletinItem, b: BulletinItem) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
      
      setBulletins(sortedCachedBulletins)
    }
    
    // 백그라운드에서 서버에서 최신 데이터 로드
    const [storedNotices, storedRecruitments, loadedBulletins] = await Promise.all([
      getNotices(forceRefresh),
      getRecruitments(forceRefresh),
      getBulletins(forceRefresh)
    ])
    
    // null 항목 필터링 및 최신순 정렬
    const validStoredNotices = (storedNotices.length > 0 ? storedNotices : defaultNotices)
      .filter((notice): notice is NoticeItem => notice !== null && notice !== undefined && notice.title !== undefined)
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        return dateB - dateA // 최신순
      })
    setNotices(validStoredNotices)

    if (storedRecruitments.length > 0) {
      const validStoredRecruitments = storedRecruitments
        .filter((recruitment): recruitment is RecruitmentItem => recruitment !== null && recruitment !== undefined && recruitment.title !== undefined)
      setRecruit(validStoredRecruitments)
    } else {
      setRecruit([
        { id: '1', title: '전례 성가단 단원 모집', summary: '주일 11시 미사 전례 성가단 단원 모집' },
        { id: '2', title: '주일학교 교사 모집', summary: '신앙으로 아이들을 함께 돌보실 교사 모집' }
      ])
    }
    
    // 최신순 정렬 (null 필터링 후)
    const validLoadedBulletins = loadedBulletins
      .filter((bulletin): bulletin is BulletinItem => bulletin !== null && bulletin !== undefined && bulletin.title !== undefined)
    const sortedBulletins = validLoadedBulletins.sort((a: BulletinItem, b: BulletinItem) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    
    setBulletins(sortedBulletins)
  }

  useEffect(() => {
    // App.tsx에서 이미 initializeData()로 데이터를 로드했으므로 캐시 활용
    loadData(false)
    
    // 주보 업데이트 이벤트 리스너만 유지 (어드민에서 저장 시에만 새로고침)
    const handleBulletinsUpdate = async () => {
      // 서버 저장 완료 대기 후 로드
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadData(true) // 업데이트 이벤트 시에만 강제 새로고침
    }
    
    window.addEventListener('bulletinsUpdated', handleBulletinsUpdate)
    
    return () => {
      window.removeEventListener('bulletinsUpdated', handleBulletinsUpdate)
    }
  }, [])

  // 첫 3개 주보 이미지 프리로드 (성능 최적화)
  useEffect(() => {
    if (bulletins.length > 0) {
      const preloadImages = bulletins.slice(0, 3).map(bulletin => {
        const isImageFile = bulletin.fileUrl && (
          bulletin.fileUrl.startsWith('data:image/') || 
          bulletin.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)
        )
        const thumbnailUrl = (bulletin.thumbnailUrl && bulletin.thumbnailUrl.trim() !== '') 
          ? bulletin.thumbnailUrl 
          : (isImageFile ? bulletin.fileUrl : null)
        return thumbnailUrl
      }).filter(Boolean) as string[]
      
      preloadImages.forEach((thumbnailUrl, index) => {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = getProxiedImageUrl(thumbnailUrl)
        link.fetchPriority = index === 0 ? 'high' : 'auto'
        document.head.appendChild(link)
      })
      
      return () => {
        preloadImages.forEach(() => {
          const links = document.head.querySelectorAll('link[rel="preload"][as="image"]')
          links.forEach(link => {
            if (link.getAttribute('href')?.includes('proxy-image')) {
              document.head.removeChild(link)
            }
          })
        })
      }
    }
  }, [bulletins])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            공지/소식
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* 공지사항 Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
                <h2 className="text-3xl font-bold text-gray-900">공지사항</h2>
              </div>
              {notices.length > 0 && (
                <Link
                  to="/notices"
                  className="text-sm md:text-base px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 inline-block"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  전체보기
                </Link>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
              {notices
                .filter((n): n is NoticeItem => n !== null && n !== undefined && n.title !== undefined)
                .slice(0, initialNoticesCount)
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
                })}
            </div>
          </section>

          {/* 단체 소식 Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
                <h2 className="text-3xl font-bold text-gray-900">단체 소식</h2>
              </div>
              {recruit.length > 0 && (
                <Link
                  to="/recruitments"
                  className="text-sm md:text-base px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 inline-block"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  전체보기
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recruit
                .filter((r): r is RecruitmentItem => r !== null && r !== undefined && r.title !== undefined)
                .slice(0, initialRecruitCount)
                .map((r) => (
                  <Link
                    key={r.id}
                    to={`/recruitments/${r.id}`}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-catholic-logo/20 group cursor-pointer hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 transition-colors duration-300 group" onMouseEnter={(e) => { e.currentTarget.style.color = '#7B1F4B' }} onMouseLeave={(e) => { e.currentTarget.style.color = '' }}>
                          {r.title || '(제목 없음)'}
                        </h3>
                      <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line line-clamp-3">{r.summary}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* 주보 안내 Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
                <h2 className="text-3xl font-bold text-gray-900">주보 안내</h2>
              </div>
              {bulletins.length > 0 && (
                <Link
                  to="/bulletins"
                  className="text-sm md:text-base px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 inline-block"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  전체보기
                </Link>
              )}
            </div>
            {bulletins.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bulletins
                    .filter((bulletin): bulletin is BulletinItem => bulletin !== null && bulletin !== undefined && bulletin.title !== undefined)
                    .slice(0, initialBulletinsCount)
                    .map((bulletin) => (
                  <div
                    key={bulletin.id}
                    onClick={(e) => {
                      // PC에서만 클릭 처리 (모바일은 onTouchEnd에서 처리)
                      if (window.innerWidth >= 768) {
                        e.preventDefault()
                        e.stopPropagation()
                        if (bulletin && bulletin.fileUrl) {
                          setSelectedBulletin(bulletin)
                          setIsPdfModalOpen(true)
                        } else {
                          console.error('[News] 주보 데이터 없음:', bulletin)
                          alert('주보 파일을 불러올 수 없습니다.')
                        }
                      }
                    }}
                    onTouchStart={(e) => {
                      // 모바일 터치 시작 시 이벤트 전파 방지 및 터치 위치 저장
                      if (window.innerWidth < 768) {
                        e.stopPropagation()
                        // 터치 시작 위치 저장 (스크롤과 클릭 구분용)
                        const touch = e.touches[0]
                        if (touch) {
                          (e.currentTarget as any).__touchStartX = touch.clientX
                          ;(e.currentTarget as any).__touchStartY = touch.clientY
                        }
                      }
                    }}
                    onTouchMove={(e) => {
                      // 모바일에서 스크롤 중임을 표시
                      if (window.innerWidth < 768) {
                        const touch = e.touches[0]
                        if (touch && (e.currentTarget as any).__touchStartX !== undefined) {
                          const deltaX = Math.abs(touch.clientX - (e.currentTarget as any).__touchStartX)
                          const deltaY = Math.abs(touch.clientY - (e.currentTarget as any).__touchStartY)
                          // 10px 이상 움직이면 스크롤로 간주
                          if (deltaX > 10 || deltaY > 10) {
                            ;(e.currentTarget as any).__isScrolling = true
                          }
                        }
                      }
                    }}
                    onTouchEnd={(e) => {
                      // 모바일 터치 종료 시 클릭 처리 (스크롤이 아닐 때만)
                      if (window.innerWidth < 768) {
                        const isScrolling = (e.currentTarget as any).__isScrolling
                        // 스크롤 중이 아니면 클릭으로 처리
                        if (!isScrolling) {
                          e.preventDefault()
                          e.stopPropagation()
                          if (bulletin && bulletin.fileUrl) {
                            setSelectedBulletin(bulletin)
                            setIsPdfModalOpen(true)
                          } else {
                            console.error('[News] 주보 데이터 없음 (모바일):', bulletin)
                            alert('주보 파일을 불러올 수 없습니다.')
                          }
                        }
                        // 터치 상태 초기화
                        delete (e.currentTarget as any).__touchStartX
                        delete (e.currentTarget as any).__touchStartY
                        delete (e.currentTarget as any).__isScrolling
                      }
                    }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl active:shadow-xl transition-all duration-500 p-6 border border-gray-100 hover:border-catholic-logo/20 active:border-catholic-logo/40 group cursor-pointer hover:-translate-y-1 active:scale-95 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                  >
                    <div className="flex flex-col h-full">
                      {(() => {
                        // 썸네일 URL 우선, 없거나 빈 문자열이면 fileUrl이 이미지인 경우 사용
                        // PDF 파일인 경우도 fileUrl을 썸네일로 사용 (iframe으로 표시)
                        const isImageFile = bulletin.fileUrl && (
                          bulletin.fileUrl.startsWith('data:image/') || 
                          bulletin.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ||
                          (bulletin.fileUrl.startsWith('http') && bulletin.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i))
                        )
                        // thumbnailUrl이 없거나 빈 문자열이면 이미지 파일인 경우 fileUrl 사용
                        const thumbnailUrl = (bulletin.thumbnailUrl && bulletin.thumbnailUrl.trim() !== '') 
                          ? bulletin.thumbnailUrl 
                          : (isImageFile ? bulletin.fileUrl : null)
                        
                        return thumbnailUrl ? (
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gray-100" style={{ minHeight: '200px', maxHeight: '400px' }}>
                            <img
                              src={getProxiedImageUrl(thumbnailUrl)}
                              alt={bulletin.title || '(제목 없음)'}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              style={{ 
                                display: 'block', 
                                width: '100%', 
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: 'center',
                                backgroundColor: '#f3f4f6', // 로딩 중 배경색
                                pointerEvents: 'none' // 이미지 클릭 방지 (부모 div에서 처리)
                              }}
                              loading={bulletins.indexOf(bulletin) < 3 ? "eager" : "lazy"}
                              decoding="async"
                              fetchPriority={bulletins.indexOf(bulletin) === 0 ? "high" : bulletins.indexOf(bulletin) < 3 ? "auto" : "low"}
                              width="300"
                              height="400"
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              draggable={false}
                              onDragStart={(e) => e.preventDefault()}
                              onError={(e) => {
                                console.error('[News] 썸네일 이미지 로드 실패:', thumbnailUrl, '프록시 URL:', e.currentTarget.src)
                                const target = e.currentTarget as HTMLImageElement
                                // 프록시 실패 시 프록시 URL에 타임스탬프 추가하여 재시도 (원본 URL로 재시도하지 않음)
                                if (target.src.includes('/api/proxy-image') && !target.src.includes('_retry=')) {
                                  console.log('[News] 프록시 실패, 프록시 URL 재시도:', thumbnailUrl)
                                  const proxiedUrl = getProxiedImageUrl(thumbnailUrl)
                                  target.src = `${proxiedUrl}&_retry=${Date.now()}`
                                  return
                                }
                                // 이미지 로드 실패 시 PDF 아이콘 표시
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  parent.innerHTML = `
                                    <div class="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-catholic-logo/20 to-catholic-logo/5 flex items-center justify-center" style="min-height: 200px; max-height: 400px;">
                                      <div class="text-center p-4">
                                        <svg class="w-16 h-16 mx-auto mb-3 text-catholic-logo opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p class="text-sm text-gray-500 font-medium">PDF</p>
                                      </div>
                                    </div>
                                  `
                                }
                              }}
                              onLoad={(e) => {
                                // 로드 성공 시 배경색 제거
                                const target = e.currentTarget
                                target.style.backgroundColor = 'transparent'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-catholic-logo/20 to-catholic-logo/5 flex items-center justify-center" style={{ minHeight: '200px' }}>
                            <div className="text-center p-4">
                              <svg className="w-16 h-16 mx-auto mb-3 text-catholic-logo opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm text-gray-500 font-medium">PDF</p>
                            </div>
                          </div>
                        )
                      })()}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-catholic-logo line-clamp-2">
                          {bulletin.title || '(제목 없음)'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">{bulletin.date}</p>
                        {bulletin.description && (
                          <p className="text-sm text-gray-600 mb-4 whitespace-pre-line line-clamp-2">{bulletin.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-catholic-logo font-medium text-sm group-hover:gap-3 transition-all">
                          <span>주보 보기</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">등록된 주보가 없습니다.</p>
              </div>
            )}
          </section>
        </div>
      </div>
      {selectedBulletin && selectedBulletin.fileUrl && (
        <PdfViewerModal
          isOpen={isPdfModalOpen}
          title={selectedBulletin.title}
          description={selectedBulletin.description}
          fileUrl={selectedBulletin.fileUrl}
          onClose={() => {
            setIsPdfModalOpen(false)
            setTimeout(() => setSelectedBulletin(null), 300)
          }}
        />
      )}
    </div>
  )
}
