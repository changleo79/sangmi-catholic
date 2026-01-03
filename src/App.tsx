import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Header from './components/Header'
import AdminHeader from './components/AdminHeader'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ScrollProgress'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/admin/ProtectedRoute'
import { initializeData } from './utils/storage'
import SkeletonLoader from './components/SkeletonLoader'

// 공개 페이지 - 동적 임포트
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Jurisdiction = lazy(() => import('./pages/Jurisdiction'))
const Notice = lazy(() => import('./pages/Notice'))
const Mass = lazy(() => import('./pages/Mass'))
const News = lazy(() => import('./pages/News'))
const Office = lazy(() => import('./pages/Office'))
const Directions = lazy(() => import('./pages/Directions'))
const Albums = lazy(() => import('./pages/Albums'))
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'))
const Bulletins = lazy(() => import('./pages/Bulletins'))
const Notices = lazy(() => import('./pages/Notices'))
const Recruitments = lazy(() => import('./pages/Recruitments'))
const NoticeDetail = lazy(() => import('./pages/NoticeDetail'))
const RecruitmentDetail = lazy(() => import('./pages/RecruitmentDetail'))
const OrganizationTree = lazy(() => import('./pages/OrganizationTree'))
const Organizations = lazy(() => import('./pages/Organizations'))

// 관리자 페이지 - 동적 임포트
const AdminLogin = lazy(() => import('./pages/admin/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const NoticesManage = lazy(() => import('./pages/admin/NoticesManage'))
const RecruitmentsManage = lazy(() => import('./pages/admin/RecruitmentsManage'))
const FAQsManage = lazy(() => import('./pages/admin/FAQsManage'))
const AlbumsManage = lazy(() => import('./pages/admin/AlbumsManage'))
const MassManage = lazy(() => import('./pages/admin/MassManage'))
const BulletinsManage = lazy(() => import('./pages/admin/BulletinsManage'))
const BackupManage = lazy(() => import('./pages/admin/BackupManage'))

// 로딩 컴포넌트
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-catholic-logo border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">페이지를 불러오는 중...</p>
    </div>
  </div>
)

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation()

  useEffect(() => {
    // 페이지 전환 시 부드러운 스크롤
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [pathname])

  return null
}

function App() {
  useEffect(() => {
    // 앱 시작 시 JSON 파일에서 데이터 로드
    // 모바일에서는 initializeData가 앨범/주보를 건드리지 않도록 이미 구현되어 있음
    initializeData()
  }, [])

  return (
    <Router>
      <ScrollProgress />
      <ScrollToTopOnRouteChange />
      <Routes>
        {/* Admin Pages - With AdminHeader */}
        <Route
          path="/admin/*"
          element={
            <div className="min-h-screen flex flex-col">
              <AdminHeader />
              <main className="flex-grow page-enter-active">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/notices"
                      element={
                        <ProtectedRoute>
                          <NoticesManage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/recruitments"
                      element={
                        <ProtectedRoute>
                          <RecruitmentsManage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/faqs"
                      element={
                        <ProtectedRoute>
                          <FAQsManage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/albums"
                      element={
                        <ProtectedRoute>
                          <AlbumsManage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/mass"
                      element={
                        <ProtectedRoute>
                          <MassManage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bulletins"
                      element={
                        <ProtectedRoute>
                          <BulletinsManage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/backups"
                      element={
                        <ProtectedRoute>
                          <BackupManage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </main>
              <ScrollToTop />
              <SpeedInsights />
            </div>
          }
        />
        
        {/* Admin Login - No Header/Footer */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminLogin />
            </Suspense>
          }
        />
        
        {/* Public Pages - With Header/Footer */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow page-enter-active">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/jurisdiction" element={<Jurisdiction />} />
                    <Route path="/notice" element={<Notice />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:id" element={<NoticeDetail />} />
                    <Route path="/notices" element={<Notices />} />
                    <Route path="/recruitments" element={<Recruitments />} />
                    <Route path="/recruitments/:id" element={<RecruitmentDetail />} />
                    <Route path="/albums" element={<Albums />} />
                    <Route path="/albums/:id" element={<AlbumDetail />} />
                    <Route path="/bulletins" element={<Bulletins />} />
                    <Route path="/organizations" element={<Organizations />} />
                    <Route path="/organizations/tree" element={<OrganizationTree />} />
                    <Route path="/office" element={<Office />} />
                    <Route path="/directions" element={<Directions />} />
                    <Route path="/mass" element={<Mass />} />
                  </Routes>
                </Suspense>
              </main>
              <BottomNav />
              <Footer />
              <ScrollToTop />
              <SpeedInsights />
            </div>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

