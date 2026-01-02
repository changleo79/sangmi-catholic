import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRecruitments, type RecruitmentItem } from '../utils/storage'

export default function Recruitments() {
  const [recruit, setRecruit] = useState<RecruitmentItem[]>([])

  const loadRecruitments = async (forceRefresh = false) => {
    // 먼저 캐시된 데이터를 빠르게 표시
    if (!forceRefresh) {
      const cachedRecruitments = await getRecruitments(false)
      if (cachedRecruitments.length > 0) {
        const validCachedRecruitments = cachedRecruitments
          .filter((recruitment): recruitment is RecruitmentItem => recruitment !== null && recruitment !== undefined && recruitment.title !== undefined)
        setRecruit(validCachedRecruitments)
      }
    }
    
    // 백그라운드에서 서버에서 최신 데이터 로드
    const storedRecruitments = await getRecruitments(forceRefresh)
    if (storedRecruitments.length > 0) {
      const validStoredRecruitments = storedRecruitments
        .filter((recruitment): recruitment is RecruitmentItem => recruitment !== null && recruitment !== undefined && recruitment.title !== undefined)
      setRecruit(validStoredRecruitments)
    }
  }

  useEffect(() => {
    loadRecruitments(false)
    
    // 단체소식 업데이트 이벤트 리스너
    const handleRecruitmentsUpdate = async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadRecruitments(true)
    }
    
    window.addEventListener('recruitmentsUpdated', handleRecruitmentsUpdate)
    
    return () => {
      window.removeEventListener('recruitmentsUpdated', handleRecruitmentsUpdate)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            단체 소식
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recruit.length > 0 ? (
              recruit
                .filter((r): r is RecruitmentItem => r !== null && r !== undefined && r.title !== undefined)
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
                ))
            ) : (
              <div className="col-span-2 bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-500 text-lg">등록된 단체 소식이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

