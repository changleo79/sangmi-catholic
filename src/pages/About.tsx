import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            성당소개
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-10 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">상미성당</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                아시시의 성 프란치스코 상미성당은 2018년 6월 18일 경기도 용인시 기흥구 상미 지역에 설립된 가톨릭 본당입니다.
              </p>
              <p>
                우리 성당은 성 프란치스코의 정신을 이어받아 하느님의 사랑을 실천하고, 모든 이웃과 함께 평화와 화합을 만들어가는 작은 공동체입니다.
              </p>
              <p>
                매일 드리는 미사를 통해 하느님께 영광을 드리고, 말씀과 성사를 통해 신앙을 성장시켜 나가며, 서로를 돌보고 나누는 사랑의 실천을 통해 하느님 나라를 건설해 나가고 있습니다.
              </p>
              <p>
                상미성당은 모든 신자들이 한 가족으로 모여 기도하고, 함께 성장하며, 주변 이웃들에게 복음을 전하는 따뜻한 공동체가 되고자 합니다.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <p className="text-base">
                  <span className="font-semibold text-gray-900">설립일 : </span>
                  <span className="text-gray-700">2018년 6월 18일</span>
                </p>
                <p className="text-base">
                  <span className="font-semibold text-gray-900">기공식 미사 : </span>
                  <span className="text-gray-700">2023년 11월 18일</span>
                </p>
                <p className="text-base">
                  <span className="font-semibold text-gray-900">입당 미사 : </span>
                  <span className="text-gray-700">2025년 3월 22일</span>
                </p>
              </div>
            </div>
          </div>

          {/* 역대 본당신부님 소개 Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-10 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">역대 본당신부님 소개</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1대 본당신부 */}
              <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-catholic-logo/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-square w-full max-w-[200px] mx-auto mb-4 rounded-xl overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <img
                    src="/images/past-priest-choi.jpg"
                    alt="초대 주임신부 최범근 요한사도 신부님"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-center">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)', color: '#7B1F4B' }}>
                    초대 주임신부
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-catholic-logo transition-colors duration-300">최범근 요한사도</h3>
                  <p className="text-sm text-gray-600 mb-2">재임기간 : 2019년 6월 18일 ~ 2025년 6월 16일</p>
                </div>
              </div>
              
              {/* 2대 본당신부 */}
              <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-catholic-logo/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-square w-full max-w-[200px] mx-auto mb-4 rounded-xl overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <img
                    src="/images/past-priest-jeong.jpg"
                    alt="2대 주임신부 정진성 아우구스티노 신부님"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="text-center">
                  <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)', color: '#7B1F4B' }}>
                    2대 본당신부
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-catholic-logo transition-colors duration-300">정진성 아우구스티노</h3>
                  <p className="text-sm text-gray-600 mb-2">재임기간 : 2025년 6월 17일 ~ 현재</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-10 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">연락처</h2>
            </div>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">전화</p>
                  <p className="text-gray-600">031-282-9989</p>
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
                <p className="text-gray-600">sangmi@casuwon.or.kr</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">팩스</p>
                  <p className="text-gray-600">031-282-9985</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">주소</p>
                  <p className="text-gray-600">경기도 용인시 기흥구 상미로 29</p>
                </div>
              </div>
            </div>
          </div>

          {/* Directions Link */}
          <div className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-10 text-white" style={{ background: 'linear-gradient(to right, #7B1F4B, #5a1538)' }}>
            <h2 className="text-3xl font-bold mb-4">오시는 길</h2>
            <p className="text-blue-100 mb-6 text-lg leading-relaxed">
              상세한 교통 안내와 지도를 확인하실 수 있습니다.
            </p>
            <Link
              to="/directions"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              style={{ color: '#7B1F4B' }}
            >
              지도 보기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


