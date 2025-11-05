import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import About from './pages/About'
import Notice from './pages/Notice'
import Mass from './pages/Mass'
import News from './pages/News'
import Office from './pages/Office'
import Directions from './pages/Directions'

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
  return (
    <Router>
      <ScrollToTopOnRouteChange />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow page-enter-active">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/news" element={<News />} />
            <Route path="/office" element={<Office />} />
            <Route path="/directions" element={<Directions />} />
            <Route path="/mass" element={<Mass />} />
          </Routes>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </Router>
  )
}

export default App

