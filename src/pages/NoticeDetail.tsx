import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNotices } from '../utils/storage'
import { notices as defaultNotices } from '../data/notices'
import type { NoticeItem } from '../data/notices'
import SocialShareButton from '../components/SocialShareButton'

export default function NoticeDetail() {
  const { id } = useParams<{ id: string }>()
  const [notice, setNotice] = useState<NoticeItem | null>(null)

  useEffect(() => {
    const loadNotice = async () => {
      if (id) {
        const storedNotices = await getNotices()
        
        // ID는 "date-encodedTitle" 형태
        // 날짜 부분(YYYY-MM-DD)을 먼저 분리하고, 나머지 부분만 디코딩
        
        // 날짜 패턴 찾기 (YYYY-MM-DD)
        const dateMatch = id.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/)
        
        if (dateMatch) {
          const date = dateMatch[1] // "2026-01-03"
          const encodedTitle = dateMatch[2] // 인코딩된 제목 부분
          
          // 제목 부분 디코딩 시도
          let title = encodedTitle
          try {
            // URL 인코딩된 경우 디코딩
            title = decodeURIComponent(encodedTitle)
          } catch (e) {
            // 디코딩 실패 시 원본 사용 (이미 디코딩된 상태일 수 있음)
            title = encodedTitle
          }
          
          console.log('[NoticeDetail] 파싱 결과:', { date, title, originalId: id })
          
          // 저장된 공지사항에서 찾기
          let found = storedNotices.find(n => {
            // 날짜와 제목이 정확히 일치하는지 확인
            return n.date === date && n.title === title
          })
          
          // 기본값에서도 찾기
          if (!found) {
            found = defaultNotices.find(n => n.date === date && n.title === title)
          }
          
          if (found) {
            console.log('[NoticeDetail] 공지사항 찾음:', found.title)
            setNotice(found)
            return
          } else {
            console.log('[NoticeDetail] 공지사항을 찾지 못함. 저장된 공지사항:', storedNotices.map(n => ({ date: n.date, title: n.title })))
          }
        }
        
        // 위 방법으로 못 찾으면 인코딩된 형태로 직접 비교
        const found = storedNotices.find(n => {
          const noticeId = `${n.date}-${encodeURIComponent(n.title)}`
          // 원본 ID와 디코딩된 ID 모두 비교
          return noticeId === id || noticeId === decodeURIComponent(id)
        })
        
        if (found) {
          console.log('[NoticeDetail] 인코딩된 형태로 공지사항 찾음:', found.title)
          setNotice(found)
        } else {
          // 기본값에서도 인코딩된 형태로 찾기
          const foundDefault = defaultNotices.find(n => {
            const noticeId = `${n.date}-${encodeURIComponent(n.title)}`
            return noticeId === id || noticeId === decodeURIComponent(id)
          })
          if (foundDefault) {
            console.log('[NoticeDetail] 기본값에서 공지사항 찾음:', foundDefault.title)
            setNotice(foundDefault)
          } else {
            console.error('[NoticeDetail] 공지사항을 찾을 수 없음. ID:', id)
          }
        }
      }
    }
    loadNotice()
  }, [id])

  if (!notice) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">공지사항을 찾을 수 없습니다.</p>
          <Link
            to="/news"
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#7B1F4B' }}
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const noticeId = `${notice.date}-${encodeURIComponent(notice.title)}`

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-catholic-logo transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            목록으로
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{notice.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>{notice.date}</span>
                <SocialShareButton url={`/news/${noticeId}`} title={notice.title} description={notice.summary || ''} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
            {/* 이미지 표시 */}
            {notice.imageUrl && (
              <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={notice.imageUrl}
                  alt={notice.title}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23ddd" width="800" height="600"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3E이미지를 불러올 수 없습니다%3C/text%3E%3C/svg%3E'
                  }}
                />
              </div>
            )}

            {notice.content ? (
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{notice.content}</div>
              </div>
            ) : notice.summary ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4" style={{ borderColor: '#7B1F4B' }}>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{notice.summary}</p>
              </div>
            ) : (
              <div className="text-gray-500">내용이 없습니다.</div>
            )}

            {notice.linkUrl && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <a
                  href={notice.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  관련 링크 보기
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

