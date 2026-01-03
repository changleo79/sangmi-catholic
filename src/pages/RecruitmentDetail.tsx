import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getRecruitments, type RecruitmentItem } from '../utils/storage'
import SocialShareButton from '../components/SocialShareButton'

export default function RecruitmentDetail() {
  const { id } = useParams<{ id: string }>()
  const [recruitment, setRecruitment] = useState<RecruitmentItem | null>(null)

  useEffect(() => {
    const loadRecruitment = async () => {
      if (id) {
        const recruitments = await getRecruitments()
        const found = recruitments.find(r => r.id === id)
        if (found) {
          setRecruitment(found)
        }
      }
    }
    loadRecruitment()
  }, [id])

  if (!recruitment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">단체 소식을 찾을 수 없습니다.</p>
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{recruitment.title}</h1>
              <SocialShareButton url={`/recruitments/${recruitment.id}`} title={recruitment.title} description={recruitment.summary} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-100">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{recruitment.title}</h2>
                {recruitment.content ? (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">{recruitment.content}</div>
                ) : (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">{recruitment.summary}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

