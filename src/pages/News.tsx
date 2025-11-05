import { useState, useEffect } from 'react'
import { notices as defaultNotices } from '../data/notices'
import { getNotices } from '../utils/storage'
import { getRecruitments, getBulletins, type RecruitmentItem, type BulletinItem } from '../utils/storage'
import type { NoticeItem } from '../data/notices'

export default function News() {
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [recruit, setRecruit] = useState<RecruitmentItem[]>([])
  const [bulletins, setBulletins] = useState<BulletinItem[]>([])

  useEffect(() => {
    // 로컬스토리지에서 데이터 로드, 없으면 기본값 사용
    const storedNotices = getNotices()
    if (storedNotices.length > 0) {
      setNotices(storedNotices)
    } else {
      setNotices(defaultNotices)
    }

    const storedRecruitments = getRecruitments()
    if (storedRecruitments.length > 0) {
      setRecruit(storedRecruitments)
    } else {
      // 기본값
      setRecruit([
        { id: '1', title: '전례 성가단 단원 모집', summary: '주일 11시 미사 전례 성가단 단원 모집' },
        { id: '2', title: '주일학교 교사 모집', summary: '신앙으로 아이들을 함께 돌보실 교사 모집' }
      ])
    }

    const storedBulletins = getBulletins()
    setBulletins(storedBulletins)
  }, [])

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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">공지사항</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">
              {notices.map((n, i) => (
                <div
                  key={i}
                  className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-300 group cursor-pointer hover:pl-8 active:bg-purple-50/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100" style={{ backgroundColor: '#7B1F4B' }}></div>
                        <h3 className="text-xl font-semibold text-gray-900 transition-all duration-300 group-hover:font-bold" onMouseEnter={(e) => { e.currentTarget.style.color = '#7B1F4B' }} onMouseLeave={(e) => { e.currentTarget.style.color = '' }}>
                          {n.title}
                        </h3>
                      </div>
                      {n.summary && (
                        <p className="text-gray-600 ml-5 text-sm leading-relaxed">{n.summary}</p>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm whitespace-nowrap font-medium group-hover:text-gray-500 transition-colors">
                      {n.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 단체 소식 Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">단체 소식</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recruit.map((r) => (
                <div
                  key={r.id}
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
                        {r.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{r.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 주보 안내 Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">주보 안내</h2>
            </div>
            {bulletins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bulletins.map((bulletin) => (
                  <a
                    key={bulletin.id}
                    href={bulletin.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-gray-100 hover:border-catholic-logo/20 group cursor-pointer hover:-translate-y-1"
                  >
                    <div className="flex flex-col h-full">
                      {bulletin.thumbnailUrl ? (
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gray-100">
                          <img
                            src={bulletin.thumbnailUrl}
                            alt={bulletin.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-catholic-logo/20 to-catholic-logo/5 flex items-center justify-center">
                          <div className="text-center p-4">
                            <svg className="w-16 h-16 mx-auto mb-3 text-catholic-logo opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm text-gray-500 font-medium">PDF</p>
                          </div>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-catholic-logo line-clamp-2">
                          {bulletin.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">{bulletin.date}</p>
                        {bulletin.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bulletin.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-catholic-logo font-medium text-sm group-hover:gap-3 transition-all">
                          <span>주보 보기</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
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
    </div>
  )
}
