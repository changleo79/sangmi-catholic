import { Link } from 'react-router-dom'
import logo2 from '../../사진파일/상미성당 로고2.png'

export default function Footer() {
  const quickLinks = [
    { label: '본당 소개', path: '/about' },
    { label: '공지/소식', path: '/news' },
    { label: '미사와 성사', path: '/mass' },
    { label: '본당 앨범', path: '/albums' },
    { label: '본당 단체', path: '/organizations' },
    { label: '오시는 길', path: '/directions' },
  ]

  return (
    <footer className="text-white py-8 md:py-12 lg:py-16 mt-auto relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #4a1230, #3a0f25)' }}>
      {/* 장식용 배경 요소 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          {/* 로고 섹션 */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1 flex items-center md:items-start">
            <img 
              src={logo2} 
              alt="상미성당 로고" 
              className="h-16 w-auto md:h-20 lg:h-24 object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </div>

          {/* 빠른 링크 섹션 */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-5 text-white flex items-center gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              빠른 링크
            </h3>
            <nav className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-2.5 md:space-y-0">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block text-xs md:text-sm hover:text-white transition-colors duration-200 group"
                  style={{ color: 'rgba(255, 255, 255, 0.8)' }}
                >
                  <span className="flex items-center gap-1.5 md:gap-2">
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white/40 group-hover:bg-white/80 transition-all duration-200 flex-shrink-0"></span>
                    <span className="truncate">{link.label}</span>
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* 연락처 섹션 */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-5 text-white flex items-center gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              연락처
            </h3>
            <div className="space-y-2 md:space-y-3.5">
              <a 
                href="tel:031-282-9989" 
                className="flex items-center gap-2 md:gap-3 group hover:translate-x-1 transition-transform duration-200"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm hover:underline">031-282-9989</span>
              </a>
              <a 
                href="mailto:sangmi@casuwon.or.kr" 
                className="flex items-center gap-2 md:gap-3 group hover:translate-x-1 transition-transform duration-200"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm hover:underline break-all">sangmi@casuwon.or.kr</span>
              </a>
              <a 
                href="tel:031-282-9985" 
                className="flex items-center gap-2 md:gap-3 group hover:translate-x-1 transition-transform duration-200"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs md:text-sm hover:underline">031-282-9985 (팩스)</span>
              </a>
            </div>
          </div>
          
          {/* 주소 섹션 */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-5 text-white flex items-center gap-2">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              주소
            </h3>
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm leading-relaxed mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    경기도 용인시 기흥구 상미로 29
                  </p>
                  <a 
                    href="https://map.naver.com/v5/search/상미성당" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 md:gap-1.5 text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                  >
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    지도에서 보기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 구분선 및 저작권 */}
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 text-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <p className="text-xs md:text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            © 2025 상미성당. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
