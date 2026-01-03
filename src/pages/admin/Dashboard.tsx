import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../utils/auth'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
              <div className="w-24 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#7B1F4B' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <Link
            to="/admin/notices"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">공지사항 관리</h2>
            <p className="text-gray-600">공지사항을 추가, 수정, 삭제할 수 있습니다.</p>
          </Link>

          <Link
            to="/admin/recruitments"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">단체 소식 관리</h2>
            <p className="text-gray-600">단체 소식 정보를 관리할 수 있습니다.</p>
          </Link>

          <Link
            to="/admin/faqs"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">FAQ 관리</h2>
            <p className="text-gray-600">자주 묻는 질문을 관리할 수 있습니다.</p>
          </Link>

          <Link
            to="/admin/albums"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">본당앨범 관리</h2>
            <p className="text-gray-600">본당앨범을 추가, 수정, 삭제할 수 있습니다.</p>
          </Link>

          <Link
            to="/admin/mass"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">미사시간 및 성사안내 관리</h2>
            <p className="text-gray-600">미사 시간과 성사 안내를 관리할 수 있습니다.</p>
          </Link>

          <Link
            to="/admin/bulletins"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">주보 안내 관리</h2>
            <p className="text-gray-600">주보를 추가, 수정, 삭제할 수 있습니다.</p>
          </Link>

          <Link
            to="/admin/backups"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(to bottom right, #7B1F4B, #5a1538)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v8m0-8l-3 3m3-3l3 3m3-11H6a2 2 0 00-2 2v10a2 2 0 002 2h3" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">데이터 백업</h2>
            <p className="text-gray-600">모든 데이터 세트를 백업·복원·다운로드할 수 있습니다.</p>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <a href="/" className="text-gray-600 hover:text-catholic-logo transition-colors">
            ← 공개 사이트로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}

