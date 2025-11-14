import { shuttleRoutes } from '../data/schedules'

export default function Directions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            오시는 길
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 주소 Section */}
            <section className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">주소</h2>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 text-lg mb-2">경기도 용인시 기흥구 상미로 29</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://naver.me/58NxUcby"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  네이버 지도
                </a>
                <a
                  href="kakaomap://route?ep=37.247936,127.105992&by=CAR"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#4C9C84' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#397863' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4C9C84' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a4 4 0 106 0 4 4 0 00-6 0zm0 0H5a2 2 0 01-2-2v-6a2 2 0 012-2h.586a1 1 0 00.707-.293l1.414-1.414A1 1 0 018.414 5H15a2 2 0 012 2v3" />
                  </svg>
                  카카오맵 길찾기
                </a>
              </div>
            </section>

            {/* 안내 Section */}
            <section className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">교통 안내</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
                    <h3 className="font-semibold text-gray-900">대중교통 및 주차</h3>
                  </div>
                  <p className="text-gray-600 ml-4">
                    기흥역 지웰 정문 및 인근 정류장에서 도보 이동이 가능합니다. 성당 내·외부 주차장 이용 시 주일에는 혼잡할 수 있으니 안내에 따라 주차해 주세요.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7B1F4B' }}></div>
                    <h3 className="font-semibold text-gray-900">주일 교중미사 셔틀 운행</h3>
                  </div>
                  <p className="text-gray-600 ml-4 mb-4">
                    10:00 교중미사에 맞춰 1지역과 3·4·5·6지역을 연결하는 차량이 운행됩니다. 아래 시간표를 확인하고 여유 있게 탑승해 주세요.
                  </p>
                  <div className="space-y-4">
                    {shuttleRoutes.map((route) => (
                      <div key={route.title} className="border border-gray-200 rounded-2xl p-4 bg-gray-50/70">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: route.accent }}>{route.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{route.description}</p>
                          </div>
                        </div>
                        <div className="space-y-3 text-sm text-gray-700">
                          {route.courses.map((course, courseIdx) => (
                            <div key={`${route.title}-${courseIdx}`}>
                              {course.label && (
                                <p className="font-semibold text-gray-800 mb-1">{course.label}</p>
                              )}
                              <ul className="space-y-1 ml-2">
                                {course.stops.map((stop, stopIdx) => (
                                  <li key={`${route.title}-${courseIdx}-${stopIdx}`} className="flex items-start gap-2">
                                    <span className="text-catholic-logo font-semibold">{stop.time}</span>
                                    <span className="flex-1">{stop.location}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

