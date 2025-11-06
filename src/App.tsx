import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ScrollProgress'
import ProtectedRoute from './components/admin/ProtectedRoute'
import { initializeData } from './utils/storage'
import Home from './pages/Home'
import About from './pages/About'
import Notice from './pages/Notice'
import Mass from './pages/Mass'
import News from './pages/News'
import Office from './pages/Office'
import Directions from './pages/Directions'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import NoticesManage from './pages/admin/NoticesManage'
import RecruitmentsManage from './pages/admin/RecruitmentsManage'
import FAQsManage from './pages/admin/FAQsManage'
import AlbumsManage from './pages/admin/AlbumsManage'
import MassManage from './pages/admin/MassManage'
import BulletinsManage from './pages/admin/BulletinsManage'
import Albums from './pages/Albums'
import AlbumDetail from './pages/AlbumDetail'
import NoticeDetail from './pages/NoticeDetail'
import RecruitmentDetail from './pages/RecruitmentDetail'
import Organizations from './pages/Organizations'
import OrganizationBoard from './pages/OrganizationBoard'
import OrganizationPostDetail from './pages/OrganizationPostDetail'
import OrganizationTree from './pages/OrganizationTree'
import OrganizationsManage from './pages/admin/OrganizationsManage'

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
    initializeData()
  }, [])

  return (
    <Router>
      <ScrollProgress />
      <ScrollToTopOnRouteChange />
      <Routes>
        {/* Admin Login - No Header/Footer */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Public Pages - With Header/Footer */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow page-enter-active">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/notice" element={<Notice />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NoticeDetail />} />
                  <Route path="/recruitments/:id" element={<RecruitmentDetail />} />
                  <Route path="/albums" element={<Albums />} />
                  <Route path="/albums/:id" element={<AlbumDetail />} />
                  <Route path="/organizations" element={<Organizations />} />
                  <Route path="/organizations/tree" element={<OrganizationTree />} />
                  <Route path="/organizations/:orgType" element={<OrganizationBoard />} />
                  <Route path="/organizations/:orgType/posts/:postId" element={<OrganizationPostDetail />} />
                  <Route path="/office" element={<Office />} />
                  <Route path="/directions" element={<Directions />} />
                  <Route path="/mass" element={<Mass />} />
                  
                  {/* Admin Routes - With Header/Footer */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/notices"
                    element={
                      <ProtectedRoute>
                        <NoticesManage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/recruitments"
                    element={
                      <ProtectedRoute>
                        <RecruitmentsManage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/faqs"
                    element={
                      <ProtectedRoute>
                        <FAQsManage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/albums"
                    element={
                      <ProtectedRoute>
                        <AlbumsManage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/mass"
                    element={
                      <ProtectedRoute>
                        <MassManage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/bulletins"
                    element={
                      <ProtectedRoute>
                        <BulletinsManage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/organizations"
                    element={
                      <ProtectedRoute>
                        <OrganizationsManage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
              <ScrollToTop />
            </div>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

