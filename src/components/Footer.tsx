import logo2 from '../../사진파일/상미성당 로고2.png'

export default function Footer() {
  return (
    <footer className="text-white py-12 md:py-16 mt-auto" style={{ background: 'linear-gradient(to bottom, #4a1230, #3a0f25)' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
          <div className="flex items-start gap-4">
            <img 
              src={logo2} 
              alt="상미성당 로고" 
              className="h-20 w-auto md:h-24 object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-5 text-white">연락처</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>031-282-9989</p>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>sangmi@casuwon.or.kr</p>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>031-282-9958</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-5 text-white">주소</h3>
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>경기도 용인시 기흥구 상미로 29</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 text-center" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>© 2025 상미성당. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
