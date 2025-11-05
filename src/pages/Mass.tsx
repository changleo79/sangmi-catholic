export default function Mass() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            미사와 성사
          </h1>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* 미사 시간 & 성사 안내 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 미사 시간 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">미사 시간</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                      <div>
                        <p className="font-semibold text-gray-900">월요일</p>
                        <p className="text-gray-600">오전 6시 30분 (새벽미사)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                      <div>
                        <p className="font-semibold text-gray-900">화요일</p>
                        <p className="text-gray-600">오후 7시 30분 (저녁미사)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                      <div>
                        <p className="font-semibold text-gray-900">수요일</p>
                        <p className="text-gray-600">오전 10시 (아침미사)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                      <div>
                        <p className="font-semibold text-gray-900">목요일</p>
                        <p className="text-gray-600">오후 7시 30분 (저녁미사)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                      <div>
                        <p className="font-semibold text-gray-900">금요일</p>
                        <p className="text-gray-600">오전 10시 (아침미사)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                      <div>
                        <p className="font-semibold text-gray-900">토요일</p>
                        <p className="text-gray-600">오후 5시 (청년미사)</p>
                        <p className="text-gray-500 text-sm mt-1">매월 첫토요일 오전 10시 (성모신심미사)</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                      <div>
                        <p className="font-semibold text-gray-900">일요일</p>
                        <p className="text-gray-600">오전 10시 (교중미사)</p>
                        <p className="text-gray-600">오후 3시 (어린이미사)</p>
                      </div>
                    </div>
                  </div>
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
                {[
                  { name: '세례성사', desc: '예비신자 교리 후 진행' },
                  { name: '고해성사', desc: '미사 전후 또는 사제와 약속' },
                  { name: '견진성사', desc: '연간 일정에 따라 진행' },
                  { name: '혼인성사', desc: '사제와 사전 상담 필수' },
                  { name: '병자성사', desc: '사무실로 연락 바랍니다' },
                ].map((sacrament, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-catholic-logo rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-semibold text-gray-900">{sacrament.name}</p>
                      <p className="text-gray-600 text-sm">{sacrament.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 예비신자 교리학교 */}
          <div className="rounded-2xl shadow-lg p-10 text-white" style={{ background: 'linear-gradient(to right, #7B1F4B, #5a1538)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold">예비신자 교리학교</h2>
            </div>
            <p className="text-blue-100 mb-6 text-lg leading-relaxed">
              천주교 신자가 되시려면 세례를 받아야 합니다. 예비신자 교리학교를 통해 신앙을 배우실 수 있습니다.
            </p>
            <div className="flex items-center gap-2 text-blue-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p className="font-semibold">문의 : 성당 사무실 (031-282-9989)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


