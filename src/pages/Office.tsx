import { useState, useEffect } from 'react'
import { getFAQs, getCatechismInfo, type FAQItem, type CatechismInfo } from '../utils/storage'

export default function Office() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [catechismInfo, setCatechismInfo] = useState<CatechismInfo | null>(null)

  useEffect(() => {
    // JSON 파일에서 데이터 로드 (initializeData가 이미 호출됨)
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const storedFAQs = await getFAQs()
      if (storedFAQs.length > 0) {
        setFaqs(storedFAQs)
      } else {
        // 기본값
        setFaqs([
          { id: '1', question: '세례성사는 어떻게 신청하나요?', answer: '예비신자 교리학교 등록 후 사무실을 통해 안내드립니다.' },
          { id: '2', question: '혼인성사 준비는 어떻게 하나요?', answer: '사무실로 연락하셔서 사제와 상담 일정을 잡아주세요.' },
          { id: '3', question: '주보는 어디서 볼 수 있나요?', answer: '공지/소식 페이지에 주보 PDF가 업로드될 예정입니다.' }
        ])
      }

      const catechism = await getCatechismInfo()
      if (catechism) {
        setCatechismInfo(catechism)
      } else {
        setCatechismInfo({
          title: '예비신자 교리학교',
          description: '천주교 신자가 되시려면 세례를 받아야 합니다. 예비신자 교리학교를 통해 신앙을 배우실 수 있습니다.',
          contact: '문의 : 본당 사무실 (031-282-9989)'
        })
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            자주 묻는 질문
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* 사무실 안내 */}
              <section className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">사무실 안내</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">전화</p>
                      <a href="tel:031-282-9989" className="text-gray-600 hover:text-catholic-logo transition-colors">031-282-9989</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">이메일</p>
                      <a href="mailto:sangmi@casuwon.or.kr" className="text-gray-600 hover:text-catholic-logo transition-colors">sangmi@casuwon.or.kr</a>
                    </div>
                  </div>
                </div>
              </section>

              {/* 자주 묻는 질문 */}
              <section className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">자주 묻는 질문</h2>
                </div>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-catholic-logo/20 transition-all duration-300 group cursor-pointer">
                      <h3 className="font-semibold text-gray-900 mb-2 transition-colors group" onMouseEnter={(e) => { e.currentTarget.style.color = '#7B1F4B' }} onMouseLeave={(e) => { e.currentTarget.style.color = '' }}>{faq.question}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {catechismInfo && (
                <section className="rounded-2xl shadow-lg p-6 text-white" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold">{catechismInfo.title}</h3>
                  </div>
                  <p className="text-blue-100 text-sm">{catechismInfo.contact || '등록 문의는 사무실로 연락 바랍니다.'}</p>
                </section>
              )}
              
              <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-catholic-logo/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-catholic-logo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">고해성사</h3>
                </div>
                <p className="text-gray-600 text-sm">미사 20분 전부터 가능</p>
              </section>

              <section className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-catholic-logo/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-catholic-logo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">미사봉헌 접수 안내</h3>
                </div>
                <div className="space-y-2 text-gray-600 text-sm">
                  <p>미사예물은 봉헌일 전날 오후5시까지 사무실로 접수해 주세요.</p>
                  <p className="pt-2 text-xs text-gray-500">(참고 : 당일 접수, 전화접수, 계좌이체는 안됩니다.)</p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

