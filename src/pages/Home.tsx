import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { notices as defaultNotices } from '../data/notices'
import { getNotices, getAlbums, saveAlbums } from '../utils/storage'
import type { NoticeItem } from '../data/notices'

import imgMain from '../../사진파일/메인이미지.jpg'
import img01 from '../../사진파일/KakaoTalk_20251104_172439243_01.jpg'
import img02 from '../../사진파일/KakaoTalk_20251104_172439243_02.jpg'
import img03 from '../../사진파일/KakaoTalk_20251104_172439243_03.jpg'
import img04 from '../../사진파일/KakaoTalk_20251104_172439243_04.jpg'

export default function Home() {
  const featureSectionRef = useRef<HTMLElement>(null)
  const noticeSectionRef = useRef<HTMLElement>(null)
  const gallerySectionRef = useRef<HTMLElement>(null)
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const galleryPhotos = [img01, img02, img03, img04]
  
  useEffect(() => {
    // 로컬스토리지에서 데이터 로드, 없으면 기본값 사용
    const storedNotices = getNotices()
    if (storedNotices.length > 0) {
      setNotices(storedNotices)
    } else {
      setNotices(defaultNotices)
    }
  }, [])
  
  const recent = notices.slice(0, 3)
  
  // 슬라이드 이미지 배열 (메인이미지가 첫 번째, 서브 이미지 2개 추가)
  const slideImages = [imgMain, img01, img02]
  const [currentSlide, setCurrentSlide] = useState(0)
  
  // Albums Preview Component
  const [displayAlbums, setDisplayAlbums] = useState<Array<{id: string, cover: string, title: string}>>([])
  
  useEffect(() => {
    // 기본 앨범이 없으면 생성
    const storedAlbums = getAlbums()
    if (storedAlbums.length === 0) {
      // 기본 앨범 생성
      const defaultAlbum: any = {
        id: Date.now().toString(),
        title: '상미성당 앨범',
        date: new Date().toISOString().split('T')[0],
        cover: galleryPhotos[0],
        category: '행사',
        photos: galleryPhotos.map((photo, i) => ({
          src: photo,
          alt: `성당 사진 ${i + 1}`
        }))
      }
      const albums = getAlbums()
      albums.push(defaultAlbum)
      saveAlbums(albums)
      // 생성된 앨범으로 표시
      setDisplayAlbums([{
        id: defaultAlbum.id,
        cover: defaultAlbum.cover,
        title: defaultAlbum.title
      }])
    } else {
      // 최근 앨범 4개 사용
      const recentAlbums = storedAlbums.slice(0, 4).map(album => ({
        id: album.id,
        cover: album.cover || galleryPhotos[0],
        title: album.title
      }))
      setDisplayAlbums(recentAlbums)
    }
  }, [])
  
  // 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length)
    }, 5000) // 5초마다 전환
    
    return () => clearInterval(interval)
  }, [slideImages.length])

  // 스크롤 애니메이션
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    const sections = [featureSectionRef.current, noticeSectionRef.current, gallerySectionRef.current]
    sections.forEach((section) => {
      if (section) {
        section.classList.add('scroll-animate')
        observer.observe(section)
      }
    })

    return () => {
      sections.forEach((section) => {
        if (section) {
          observer.unobserve(section)
        }
      })
    }
  }, [])
  
  // 슬라이드 변경 함수
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }
  
  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slideImages.length) % slideImages.length)
  }
  
  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slideImages.length)
  }

  return (
    <div>
      {/* Hero Section with Slider */}
      <section className="relative w-full h-[75vh] min-h-[500px] md:h-[80vh] md:min-h-[600px] flex items-center overflow-hidden">
        {/* 슬라이드 컨테이너 */}
        <div className="absolute inset-0 w-full h-full">
          {slideImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: index === 0 ? '48% 47%' : 'center center',
                backgroundRepeat: 'no-repeat',
                transform: index === 0 ? 'rotate(-1deg) scale(1.03)' : 'scale(1.05)',
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
        
        {/* 슬라이드 네비게이션 화살표 */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
          aria-label="이전 슬라이드"
        >
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all duration-300 flex items-center justify-center group"
          aria-label="다음 슬라이드"
        >
          <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* 슬라이드 인디케이터 (도트) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slideImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
        <div className="relative container mx-auto px-4 text-center text-white z-10">
          <div className="animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-2xl mb-6 leading-tight">
              상미성당에 오신 것을<br className="md:hidden" /> 환영합니다
            </h2>
            <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              기도와 말씀 안에서 하나 되는 작은 공동체
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/mass"
                className="group px-8 py-4 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 min-w-[180px] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="relative z-10">미사 시간 보기</span>
              </Link>
              <Link
                to="/about"
                className="group px-8 py-4 rounded-xl text-white font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 min-w-[180px] relative overflow-hidden"
                style={{ backgroundColor: '#7B1F4B' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10">성당소개</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards with images (use local gallery as backgrounds) */}
      <section ref={featureSectionRef} className="py-20 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">주요 안내</h2>
            <div className="w-20 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/mass"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-100 hover:-translate-y-2 hover:border-catholic-logo/30 magnetic-card"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-gray-200 transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${img01})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 transition-colors duration-300 group" onMouseEnter={(e) => { e.currentTarget.style.color = '#7B1F4B' }} onMouseLeave={(e) => { e.currentTarget.style.color = '' }}>미사와 성사</h3>
                <p className="text-gray-600 text-sm leading-relaxed">미사 시간표 및 성사 안내</p>
              </div>
            </Link>

            <Link
              to="/news"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-100 hover:-translate-y-2 hover:border-catholic-logo/30 magnetic-card"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-gray-200 transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${img02})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 transition-colors duration-300 group" onMouseEnter={(e) => { e.currentTarget.style.color = '#7B1F4B' }} onMouseLeave={(e) => { e.currentTarget.style.color = '' }}>공지/소식</h3>
                <p className="text-gray-600 text-sm leading-relaxed">성당 소식, 단체 모집, 주보 안내</p>
              </div>
            </Link>

            <Link
              to="/directions"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-gray-100 hover:-translate-y-2 hover:border-catholic-logo/30 magnetic-card"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-gray-200 transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${img03})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 transition-colors duration-300 group" onMouseEnter={(e) => { e.currentTarget.style.color = '#7B1F4B' }} onMouseLeave={(e) => { e.currentTarget.style.color = '' }}>오시는 길</h3>
                <p className="text-gray-600 text-sm leading-relaxed">지도 및 교통 안내</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Notice Section */}
      <section ref={noticeSectionRef} className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">최근 공지사항</h2>
                <div className="w-20 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
              </div>
            </div>
            <Link 
              to="/news" 
              className="font-medium flex items-center gap-2 transition-all duration-300 group px-4 py-2 rounded-lg hover:bg-white hover:shadow-md"
              style={{ color: '#7B1F4B' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#5a1538' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#7B1F4B' }}
            >
              전체 보기
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            {recent.map((n, i) => (
              <Link
                key={i}
                to="/news"
                className="block p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-transparent transition-all duration-300 flex items-center justify-between border-b border-gray-100 last:border-b-0 group cursor-pointer hover:pl-8 active:bg-purple-50/30"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-0 group-hover:scale-100" style={{ backgroundColor: '#7B1F4B' }}></div>
                  <span className="font-medium text-gray-900 transition-all duration-300 group-hover:font-semibold group-hover:text-catholic-logo">{n.title}</span>
                </div>
                <span className="text-gray-400 text-sm font-medium group-hover:text-gray-600 transition-colors">{n.date}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Gallery using local images */}
      <section ref={gallerySectionRef} className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 rounded-full" style={{ background: 'linear-gradient(to bottom, #7B1F4B, #5a1538)' }}></div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">성당 앨범</h2>
                <div className="w-20 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
              </div>
            </div>
            <Link
              to="/albums"
              className="font-medium flex items-center gap-2 transition-all duration-300 group px-4 py-2 rounded-lg hover:bg-gray-100 hover:shadow-md"
              style={{ color: '#7B1F4B' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#5a1538' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#7B1F4B' }}
            >
              전체 보기
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {displayAlbums.map((album, i) => (
              <Link
                key={album.id || i}
                to={album.id ? `/albums/${album.id}` : '/albums'}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-2 active:scale-95"
              >
                <div
                  className="absolute inset-0 bg-gray-200 transition-transform duration-700 group-hover:scale-110 image-placeholder"
                  style={{ backgroundImage: `url(${album.cover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
