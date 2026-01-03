import { Link } from 'react-router-dom'
import logo2 from '../../사진파일/상미성당 로고2.png'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            본당소개
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
            <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">본당 명칭</h3>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">(1) 신앙적 의미 : 相(서로 상) + 美(아름다울 미)로 해석</h4>
                  <div className="space-y-3 ml-4">
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">한자 뜻 풀이</p>
                      <ul className="space-y-2 ml-4">
                        <li>
                          <span className="font-semibold">相(상):</span> 서로, 마주 보다, 어울리다, 함께하다
                        </li>
                        <li>
                          <span className="font-semibold">美(미):</span> 아름다움, 선함, 조화로움
                        </li>
                      </ul>
                    </div>
                    <p className="text-gray-800">
                      → 상미(相美)는 하느님 안에서 서로를 바라보고 비추며 완성되는 공동체의 아름다움을 의미합니다.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">(2) 지역적 의미 : 상미(桑美)</h4>
                  <p>
                    상미는 1914년 행정구역 개편으로 상촌과 미동이 합쳐지며 만들어진 이름으로, 뽕나무가 많던 상촌과 풍요로움을 상징하던 미동의 의미를 함께 담고 있습니다.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">상미 공동체의 영성</h3>
                <p>
                  성 프란치스코의 영성을 따르는 상미 공동체는 닫힌 공동체가 아닌 세상으로 향하는 신앙을 선택합니다. 고립된 삶이 아닌 함께 살아가는 공동체의 길을 선택합니다.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">핵심 사명</h3>
                <p>
                  상미 공동체는 하느님 안에서 서로를 형제자매로 받아들이고, 사랑 속에 거하며, 그 사랑을 세상에 전파하는 공동체가 되고자 합니다.
                </p>
              </div>
              
              {/* 성경구절 섹션 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-br from-catholic-logo/5 via-catholic-logo/3 to-transparent rounded-2xl p-8 border border-catholic-logo/10">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-catholic-logo/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <p className="text-xl md:text-2xl italic text-gray-800 leading-relaxed font-medium mb-3 whitespace-pre-line">
                      "하느님은 사랑이십니다. 사랑 안에 머무는 이는 하느님 안에 머무르고,{'\n'}하느님도 그 안에 머무르십니다."
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      1요한 4,16
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 주요 일정 섹션 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">주요 일정</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-catholic-logo/30 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 mb-1">설립일</p>
                        <p className="text-base font-bold text-gray-900">2019년 6월 18일</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-catholic-logo/30 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 mb-1">기공식 미사</p>
                        <p className="text-base font-bold text-gray-900">2023년 11월 18일</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-catholic-logo/30 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 mb-1">입당 미사</p>
                        <p className="text-base font-bold text-gray-900">2025년 3월 22일</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 주보성인 Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-8 md:p-10 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">본당 주보성인</h2>
            </div>
            
            {/* 이미지와 기본 정보 */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* 이미지 */}
                <div className="w-full md:w-auto md:flex-shrink-0">
                  <div className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm p-3">
                    <img
                      src={`/images/saint-francis.jpg?t=${Date.now()}`}
                      alt="아시시의 성 프란치스코와 새들"
                      className="w-full h-auto max-w-[280px] md:max-w-[320px] mx-auto object-contain"
                      style={{ 
                        display: 'block',
                        maxHeight: '500px'
                      }}
                      loading="eager"
                      onError={(e) => {
                        console.error('[About] 이미지 로드 실패:', e.currentTarget.src)
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 min-h-[300px]">
                              <div class="text-center p-6">
                                <svg class="w-24 h-24 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="text-sm text-gray-500 font-medium">성 프란치스코</p>
                                <p class="text-xs text-gray-400 mt-1">이미지를 불러올 수 없습니다</p>
                              </div>
                            </div>
                          `
                        }
                      }}
                      onLoad={(e) => {
                        console.log('[About] 성 프란치스코 이미지 로드 성공')
                        const target = e.currentTarget as HTMLImageElement
                        target.style.backgroundColor = 'transparent'
                      }}
                    />
                  </div>
                </div>
                
                {/* 기본 정보 */}
                <div className="flex-1 w-full md:w-auto">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-gray-900 min-w-[100px]">주보성인</span>
                        <span className="text-gray-700">아시시의 성 프란치스코</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="font-semibold text-gray-900 min-w-[100px]">주보성인 축일</span>
                        <span className="text-gray-700">10월 4일</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 선정 사유 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">주보성인 선정 사유</h3>
              <div className="space-y-3 text-gray-700 leading-relaxed">
                <p>
                  아시시의 성 프란치스코는 자연 안에서 하느님을 찬미하며 겸손과 평화, 가난의 삶을 실천한 성인입니다. 모든 피조물을 형제자매로 여기며 자연과 이웃, 삶의 모든 영역에서 하느님을 찬미했습니다.
                </p>
                <p>
                  그 영성에 공감한 본당 신자들의 투표로 상미성당의 주보성인으로 선정되었습니다.
                </p>
              </div>
            </div>
          </div>

          {/* 로고 소개 Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-10 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">상미성당 로고</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="flex justify-center md:justify-start">
                <div className="relative w-full max-w-[300px] aspect-square group">
                  <div className="absolute inset-0 bg-gradient-to-br from-catholic-logo/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative w-full h-full bg-white rounded-2xl p-8 flex items-center justify-center border-2 border-gray-200 shadow-lg group-hover:shadow-xl group-hover:border-catholic-logo/30 transition-all duration-300">
                    <img
                      src="/images/상미성당 소개용 로고.jpg"
                      alt="상미성당 로고"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                <p>
                  상미성당 로고는 교회의 상징인 십자가와 종탑을 단순화하여 재해석한 것입니다. 종탑이 십자가를 품고 있는 형태는 하느님을 향한 공동체의 지향을 드러냅니다. 전통적인 신앙의 상징을 현대적 감각으로 표현하여 과거와 현재가 연결되는 신앙의 공간을 보여줍니다.
                </p>
                <p>
                  로고 하단의 열린 구조는 열린 교회를 상징합니다. 누구나 초대받아 주님의 빛 안에 거할 수 있음을 의미하며, 닫힌 건물이 아닌 세상으로 열린 교회, 이웃을 환대와 포용으로 맞이하는 공동체를 나타냅니다.
                </p>
                <p className="text-gray-800 font-medium">
                  이 로고의 의미는 상미(相美)라는 본당 명칭에 담긴 신앙적 해석과도 연결됩니다. 하느님 안에서 서로를 바라보고 비추며 완성되는 공동체의 아름다움을 시각적으로 표현한 것입니다.
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
              {/* 2대 본당신부 */}
              <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-catholic-logo/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-square w-full max-w-[220px] mx-auto mb-4 rounded-xl overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                  <img
                    src="/images/past-priest-jeong.jpg"
                    alt="2대 주임신부 정진성 아우구스티노 신부님"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ objectPosition: 'center 10%' }}
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
              
              {/* 1대 본당신부 */}
              <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-catholic-logo/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-square w-full max-w-[220px] mx-auto mb-4 rounded-xl overflow-hidden bg-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                  <img
                    src="/images/past-priest-choi.jpg"
                    alt="초대 주임신부 최범근 요한사도 신부님"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ objectPosition: 'center top' }}
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
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-10 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">연락처</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">전화</p>
                  <a href="tel:031-282-9989" className="text-gray-700 hover:text-catholic-logo transition-colors font-medium">031-282-9989</a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">이메일</p>
                  <a href="mailto:sangmi@casuwon.or.kr" className="text-gray-700 hover:text-catholic-logo transition-colors font-medium break-all">sangmi@casuwon.or.kr</a>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">팩스</p>
                  <p className="text-gray-700 font-medium">031-282-9985</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">주소</p>
                  <a 
                    href="https://map.naver.com/v5/search/경기도 용인시 기흥구 상미로 29" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-catholic-logo transition-colors font-medium inline-block"
                  >
                    경기도 용인시 기흥구 상미로 29
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Tree Link */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 p-10 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">본당단체 안내</h2>
            </div>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              상미성당의 위원회와 단체 조직도를 확인하실 수 있습니다. 6개 위원회와 24개 단체의 정보를 한눈에 보실 수 있습니다.
            </p>
            <Link
              to="/organizations/tree"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
              style={{ backgroundColor: '#7B1F4B', color: '#ffffff' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
            >
              조직도 보기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Jurisdiction Link */}
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 p-10 border border-gray-100 hover:border-catholic-logo/20 hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <h2 className="text-3xl font-bold text-gray-900">관할구역 안내</h2>
            </div>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              상미성당의 관할구역을 확인하실 수 있습니다. 지역별 구역 정보를 한눈에 보실 수 있습니다.
            </p>
            <Link
              to="/jurisdiction"
              className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg hover:scale-105 transition-all duration-300 active:scale-95 shadow-md"
              style={{ backgroundColor: '#7B1F4B', color: '#ffffff' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
            >
              관할구역 보기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Directions Link */}
          <div className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-10 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7B1F4B 0%, #5a1538 100%)' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">오시는 길</h2>
              <p className="text-white/90 mb-6 text-lg leading-relaxed">
                상세한 교통 안내와 지도를 확인하실 수 있습니다.
              </p>
              <Link
                to="/directions"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
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
    </div>
  )
}


