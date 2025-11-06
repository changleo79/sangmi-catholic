import { useState, useEffect } from 'react'
import { getMassSchedule, getSacraments, getCatechismInfo } from '../utils/storage'
import type { MassScheduleItem, SacramentItem, CatechismInfo } from '../utils/storage'
import ShareButton from '../components/ShareButton'

export default function Mass() {
  const [massSchedule, setMassSchedule] = useState<MassScheduleItem[]>([])
  const [sacraments, setSacraments] = useState<SacramentItem[]>([])
  const [catechismInfo, setCatechismInfo] = useState<CatechismInfo | null>(null)

  useEffect(() => {
    // JSON 파일에서 데이터 로드 (initializeData가 이미 호출됨)
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const schedule = getMassSchedule()
      if (schedule.length > 0) {
        setMassSchedule(schedule)
      } else {
        // 기본 데이터
        const defaultSchedule: MassScheduleItem[] = [
          { id: '1', day: '월요일', time: '오전 6시 30분', description: '새벽미사' },
          { id: '2', day: '화요일', time: '오후 7시 30분', description: '저녁미사' },
          { id: '3', day: '수요일', time: '오전 10시', description: '아침미사' },
          { id: '4', day: '목요일', time: '오후 7시 30분', description: '저녁미사' },
          { id: '5', day: '금요일', time: '오전 10시', description: '아침미사' },
          { id: '6', day: '토요일', time: '오후 5시', description: '청년미사', note: '매월 첫토요일 오전 10시 (성모신심미사)' },
          { id: '7', day: '일요일', time: '오전 10시', description: '교중미사' },
          { id: '8', day: '일요일', time: '오후 3시', description: '어린이미사' }
        ]
        setMassSchedule(defaultSchedule)
      }

      const sacramentList = getSacraments()
      if (sacramentList.length > 0) {
        setSacraments(sacramentList)
      } else {
        // 기본 데이터
        const defaultSacraments: SacramentItem[] = [
          { id: '1', name: '세례성사', description: '예비신자 교리 후 진행' },
          { id: '2', name: '고해성사', description: '미사 전후 또는 사제와 약속' },
          { id: '3', name: '견진성사', description: '연간 일정에 따라 진행' },
          { id: '4', name: '혼인성사', description: '사제와 사전 상담 필수' },
          { id: '5', name: '병자성사', description: '사무실로 연락 바랍니다' }
        ]
        setSacraments(defaultSacraments)
      }

      const catechism = getCatechismInfo()
      if (catechism) {
        setCatechismInfo(catechism)
      } else {
        setCatechismInfo({
          title: '예비신자 교리학교',
          description: '천주교 신자가 되시려면 세례를 받아야 합니다. 예비신자 교리학교를 통해 신앙을 배우실 수 있습니다.',
          contact: '문의 : 성당 사무실 (031-282-9989)'
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
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
              미사와 성사
            </h1>
            <ShareButton url="/mass" title="미사와 성사" description="상미성당 미사 시간 및 성사 안내" />
          </div>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* 미사 시간 & 성사 안내 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 미사 시간 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1 print:shadow-none">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 print:hidden" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">미사 시간</h2>
                </div>
                <button
                  onClick={() => window.print()}
                  className="hidden print:block md:block p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-catholic-logo"
                  aria-label="인쇄하기"
                  style={{ color: '#7B1F4B' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="space-y-4">
                    {massSchedule.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.day}</p>
                          <p className="text-gray-600">{item.time} {item.description && `(${item.description})`}</p>
                          {item.note && <p className="text-gray-500 text-sm mt-1">{item.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    업데이트 기준: {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* 성사 안내 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">성사 안내</h2>
              </div>
              <div className="space-y-4">
                {sacraments.map((sacrament) => (
                  <div key={sacrament.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-catholic-logo rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{sacrament.name}</p>
                      <p className="text-gray-600 text-sm">{sacrament.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 예비신자 교리학교 */}
          {catechismInfo && (
            <div className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-10 text-white" style={{ background: 'linear-gradient(to right, #7B1F4B, #5a1538)' }}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold">{catechismInfo.title}</h2>
              </div>
              <p className="text-blue-100 mb-6 text-lg leading-relaxed">
                {catechismInfo.description}
              </p>
              <div className="flex items-center gap-2 text-blue-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="font-semibold">{catechismInfo.contact}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


