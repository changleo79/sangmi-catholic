import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { notices as defaultNotices } from '../data/notices'
import {
  getNotices,
  getAlbums,
  getRecruitments,
  getBulletins,
  getCatechismInfo,
  type RecruitmentItem,
  type BulletinItem,
  type AlbumWithCategory,
  type CatechismInfo,
  ensureDefaultAlbumExists
} from '../utils/storage'
import type { NoticeItem } from '../data/notices'
import PdfViewerModal from '../components/PdfViewerModal'

import imgMain from '../../사진파일/메인이미지.jpg'
import img01 from '../../사진파일/KakaoTalk_20251104_172439243_01.jpg'
import img02 from '../../사진파일/KakaoTalk_20251104_172439243_02.jpg'
import img03 from '../../사진파일/KakaoTalk_20251104_172439243_03.jpg'
import img04 from '../../사진파일/KakaoTalk_20251104_172439243_04.jpg'

type NoticeTabKey = 'notice' | 'recruitment' | 'bulletin'

export default function Home() {
  const quickSectionRef = useRef<HTMLElement>(null)
  const newsSectionRef = useRef<HTMLElement>(null)
  const gallerySectionRef = useRef<HTMLElement>(null)

  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([])
  const [bulletins, setBulletins] = useState<BulletinItem[]>([])
  const [displayAlbums, setDisplayAlbums] = useState<Array<{ id: string; cover: string; thumbnailUrl?: string; originalUrl?: string; title: string }>>([])
  const [catechismInfo, setCatechismInfo] = useState<CatechismInfo>({
    title: '예비신자 교리학교',
    description: '천주교 신자가 되시려면 세례를 받아야 합니다. 예비신자 교리학교를 통해 신앙을 배우실 수 있습니다.',
    contact: '문의 : 성당 사무실 (031-282-9989)'
  })
  const [activeNoticeTab, setActiveNoticeTab] = useState<NoticeTabKey>('notice')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedBulletin, setSelectedBulletin] = useState<BulletinItem | null>(null)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)

  const galleryPhotos = [img01, img02, img03, img04]
  const slideImages = [imgMain, img01, img02]

  const loadData = async () => {
    const storedNotices = await getNotices()
    setNotices(storedNotices.length > 0 ? storedNotices : defaultNotices)

    const storedRecruitments = await getRecruitments()
    if (storedRecruitments.length > 0) {
      setRecruitments(storedRecruitments.slice(0, 6))
    } else {
      setRecruitments([
        { id: 'recruit-default-1', title: '전례 성가단 단원 모집', summary: '주일 11시 미사 전례 성가단 단원 모집' },
        { id: 'recruit-default-2', title: '주일학교 교사 모집', summary: '신앙으로 아이들을 함께 돌보실 교사 모집' }
      ])
    }

    // App.tsx에서 이미 initializeData()로 데이터를 로드했으므로 캐시 활용
    const storedBulletins = await getBulletins(false)
    setBulletins(storedBulletins.slice(0, 6))

    const catechism = await getCatechismInfo()
    if (catechism) {
      setCatechismInfo(catechism)
    }
    // 기본값은 초기 상태에 이미 설정되어 있으므로 여기서는 업데이트만 함
  }

  useEffect(() => {
    loadData()
    
    // 주보 업데이트 이벤트 리스너만 유지 (어드민에서 저장 시에만 새로고침)
    const handleBulletinsUpdate = async () => {
      // 서버 저장 완료 대기 후 로드
      await new Promise(resolve => setTimeout(resolve, 300))
      const storedBulletins = await getBulletins(true) // 업데이트 이벤트 시에만 강제 새로고침
      const newBulletins = storedBulletins.slice(0, 6)
      // 데이터가 실제로 변경되었을 때만 상태 업데이트
      setBulletins(prev => {
        if (prev.length === newBulletins.length && prev.every((b, i) => b.id === newBulletins[i]?.id)) {
          return prev
        }
        return newBulletins
      })
    }
    
    window.addEventListener('bulletinsUpdated', handleBulletinsUpdate)
    
    return () => {
      window.removeEventListener('bulletinsUpdated', handleBulletinsUpdate)
    }
  }, [])

  const loadAlbums = async (forceRefresh = false) => {
    try {
      // App.tsx에서 이미 initializeData()로 데이터를 로드했으므로 캐시 활용
      const storedAlbums = await getAlbums(forceRefresh)
      
      // draft-로 시작하지만 실제로 저장된 앨범은 표시 (photos와 title이 있으면 저장된 것으로 간주)
      const savedAlbums = storedAlbums.filter(album => {
        if (album.id.startsWith('draft-')) {
          return album.photos && album.photos.length > 0 && album.title && album.title.trim() !== ''
        }
        return true
      })
      
      // 썸네일과 원본 URL 모두 저장 (Albums 페이지와 동일한 방식)
      const recentAlbums = savedAlbums.slice(0, 4).map(album => {
        const firstPhoto = album.photos && album.photos.length > 0 ? album.photos[0] : null
        const thumbnailUrl = firstPhoto?.thumbnailUrl
        const originalUrl = album.cover || firstPhoto?.src || ''
        return {
          id: album.id,
          cover: thumbnailUrl || originalUrl, // 썸네일 우선, 없으면 원본
          thumbnailUrl: thumbnailUrl || undefined,
          originalUrl: originalUrl || undefined,
          title: album.title
        }
      })
      
      // 데이터가 실제로 변경되었을 때만 상태 업데이트 (깜빡임 방지)
      setDisplayAlbums(prev => {
        // ID와 cover가 모두 같으면 업데이트하지 않음
        if (prev.length === recentAlbums.length) {
          const isSame = prev.every((prevAlbum, index) => {
            const newAlbum = recentAlbums[index]
            return prevAlbum.id === newAlbum.id && prevAlbum.cover === newAlbum.cover
          })
          if (isSame) {
            return prev // 변경사항 없으면 이전 상태 유지
          }
        }
        return recentAlbums // 변경사항 있으면 업데이트
      })
    } catch (error) {
      console.error('[Home] 앨범 로드 오류:', error)
      // 에러 발생 시에만 빈 배열로 설정 (이미 데이터가 있으면 유지)
      setDisplayAlbums(prev => prev.length > 0 ? prev : [])
    }
  }

  useEffect(() => {
    // App.tsx에서 이미 initializeData()로 데이터를 로드했으므로 캐시 활용
    loadAlbums(false)
    
    // 앨범 업데이트 이벤트 리스너만 유지 (어드민에서 저장 시에만 새로고침)
    const handleAlbumsUpdate = async () => {
      // 서버 저장 완료 대기 후 로드
      await new Promise(resolve => setTimeout(resolve, 300))
      await loadAlbums(true) // 업데이트 이벤트 시에만 강제 새로고침
    }
    
    window.addEventListener('albumsUpdated', handleAlbumsUpdate)
    
    return () => {
      window.removeEventListener('albumsUpdated', handleAlbumsUpdate)
    }
  }, [])

  useEffect(() => {
    // 첫 화면 이미지 프리로드
    slideImages.forEach((img, index) => {
      if (index === 0 || index === 1) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = img
        link.fetchPriority = index === 0 ? 'high' : 'low'
        document.head.appendChild(link)
      }
    })

    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const next = (prev + 1) % slideImages.length
        // 다음 슬라이드 이미지 프리로드
        const nextImg = slideImages[next]
        if (nextImg) {
          const link = document.createElement('link')
          link.rel = 'preload'
          link.as = 'image'
          link.href = nextImg
          document.head.appendChild(link)
        }
        return next
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [slideImages.length])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const sections = [quickSectionRef.current, newsSectionRef.current, gallerySectionRef.current]
    sections.forEach(section => {
      if (section) {
        section.classList.add('scroll-animate')
        observer.observe(section)
      }
    })

    return () => {
      sections.forEach(section => {
        if (section) observer.unobserve(section)
      })
    }
  }, [])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const goToPrevious = () => setCurrentSlide(prev => (prev - 1 + slideImages.length) % slideImages.length)
  const goToNext = () => setCurrentSlide(prev => (prev + 1) % slideImages.length)

  const formatDate = (date?: string) => {
    if (!date) return ''
    try {
      return new Intl.DateTimeFormat('ko', { month: 'numeric', day: 'numeric' }).format(new Date(date))
    } catch {
      return date
    }
  }

  const quickLinks = [
    {
      title: '성당 소개',
      description: '본당 역사와 소개',
      to: '/about',
      accent: '#7B1F4B',
      background: 'linear-gradient(135deg, rgba(123, 31, 75, 0.14) 0%, rgba(123, 31, 75, 0.04) 100%)',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.75L12 4l9 5.75M4.5 19.5h15M6 19.5V10.5m12 9v-9" />
        </svg>
      )
    },
    {
      title: '주보 보기',
      description: '주일 주보 확인',
      to: '/bulletins',
      accent: '#8B4A6B',
      background: 'linear-gradient(135deg, rgba(139, 74, 107, 0.14) 0%, rgba(139, 74, 107, 0.04) 100%)',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: '성당 앨범',
      description: '행사 사진 모음',
      to: '/albums',
      accent: '#4C9C84',
      background: 'linear-gradient(135deg, rgba(76, 156, 132, 0.14) 0%, rgba(76, 156, 132, 0.04) 100%)',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v3M4 19V5m0 14h16m-6-6l2 2 3-3m-9 1a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      )
    },
    {
      title: '성당 업무 안내',
      description: '사무실 · 행정 안내',
      to: '/office',
      accent: '#D0864C',
      background: 'linear-gradient(135deg, rgba(208, 134, 76, 0.14) 0%, rgba(208, 134, 76, 0.04) 100%)',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m1-11h3m-3 4h3M5 8h3m-3 4h3m2-9h2a2 2 0 012 2v14l-3-1-3 1V5a2 2 0 012-2z" />
        </svg>
      )
    }
  ]

  const noticeTabs: Record<NoticeTabKey, {
    label: string
    description: string
    items: Array<{ id: string; title: string; summary?: string; date?: string; to: string }>
    emptyText: string
    ctaLabel: string
    ctaLink: string
  }> = {
    notice: {
      label: '공지사항',
      description: '본당의 주요 안내와 행정 소식',
      items: notices.slice(0, 4).map((item, idx) => ({
        id: `notice-${idx}-${item.title}`,
        title: item.title,
        summary: item.summary,
        date: formatDate(item.date),
        to: '/news'
      })),
      emptyText: '등록된 공지사항이 없습니다.',
      ctaLabel: '공지사항 전체 보기',
      ctaLink: '/news'
    },
    recruitment: {
      label: '단체 소식',
      description: '함께할 봉사와 단체 모집 안내',
      items: recruitments.slice(0, 4).map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        to: '/news'
      })),
      emptyText: '현재 모집 중인 단체가 없습니다.',
      ctaLabel: '단체 소식 전체 보기',
      ctaLink: '/news'
    },
    bulletin: {
      label: '주보 안내',
      description: '주일 주보 PDF를 내려받을 수 있습니다.',
      items: bulletins.slice(0, 4).map(item => ({
        id: item.id,
        title: item.title,
        summary: item.description,
        date: formatDate(item.date),
        to: '/news',
        fileUrl: item.fileUrl,
        bulletin: item
      })),
      emptyText: '등록된 주보가 없습니다.',
      ctaLabel: '주보 안내 전체 보기',
      ctaLink: '/news'
    }
  }

  const activeNoticeContent = noticeTabs[activeNoticeTab]
  const massHighlights = [
    { title: '주일 미사', time: '오전 10시 (교중) · 오후 3시 (어린이)' },
    { title: '평일 미사', time: '월 6:30 새벽 · 화/목 7:30 저녁 · 수/금 10:00 아침' },
    { title: '토요일 미사', time: '오후 5시 청년 · 매월 첫토 오전 10시 성모신심' }
  ]

  return (
    <div className="bg-gradient-to-b from-white via-gray-50 to-white">
      <section className="relative w-full h-[75vh] min-h-[520px] md:h-[80vh] md:min-h-[620px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
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
                transform: index === 0 ? 'rotate(-1deg) scale(1.04)' : 'scale(1.06)'
              }}
            >
              {/* 이미지 프리로드를 위한 숨겨진 img 태그 */}
              <img
                src={img}
                alt=""
                className="hidden"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'low'}
                decoding="async"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/60" />
        <button
          onClick={goToPrevious}
          className="hidden md:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 active:bg-white/35 transition-all duration-300 items-center justify-center group"
          aria-label="이전 슬라이드"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="hidden md:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-md hover:bg-white/25 active:bg-white/35 transition-all duration-300 items-center justify-center group"
          aria-label="다음 슬라이드"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:bottom-14 md:bottom-18 lg:bottom-24">
          {slideImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>
        <div className="relative z-20 container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
            <div className="max-w-2xl text-left text-white space-y-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-sm font-medium tracking-wide">
                <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></span>
                수원교구 상미성당
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]">
                기도와 말씀 안에서<br className="hidden md:block" /> 하나 되는 공동체
              </h1>
              <p className="text-base md:text-lg text-white/80 leading-relaxed">
                본당 소식과 단체 활동, 신앙 삶을 풍성하게 하는 모든 안내를 한 자리에서 만나보세요.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:flex-wrap sm:gap-3 pt-2 max-w-xs sm:max-w-none">
                <Link
                  to="/mass"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/85 text-gray-900 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V4m8 3V4m-9 9h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2" />
                  </svg>
                  미사 안내
                </Link>
                <Link
                  to="/news"
                  className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/15 text-white font-semibold border border-white/40 hover:bg-white/25 hover:-translate-y-1 transition-all duration-300"
                >
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V7a2 2 0 012-2h4l2-2h6a2 2 0 012 2v15z" />
                  </svg>
                  공지 · 소식
                </Link>
              </div>
            </div>
            <div className="hidden md:block md:w-full md:max-w-md lg:max-w-sm bg-white/12 backdrop-blur-lg border border-white/20 rounded-3xl p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V4m8 3V4m-9 9h10M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2" />
                </svg>
                미사 안내
              </h3>
              <ul className="space-y-3 mb-6">
                {massHighlights.map(item => (
                  <li key={item.title} className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-white/70"></span>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-white/80 leading-relaxed">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                to="/mass"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                미사 시간표 자세히 보기
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section ref={quickSectionRef} className="mt-12 md:-mt-18 pb-20">
        <div className="container mx-auto px-4">
          <div className="bg-white/85 backdrop-blur rounded-3xl shadow-2xl border border-white/60 p-6 md:p-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
              {quickLinks.map(link => (
                <Link
                  key={link.title}
                  to={link.to}
                  className="group relative flex items-start gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 p-5 md:p-6"
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-inner"
                    style={{ background: link.background, color: link.accent }}
                  >
                    {link.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-catholic-logo transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{link.description}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-catholic-logo/80 group-hover:text-catholic-logo transition-colors">
                      자세히 보기
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/mass"
              className="group flex flex-col gap-4 bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 md:p-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-catholic-logo/10 text-catholic-logo flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-catholic-logo">2025-10-01 업데이트</p>
                    <h3 className="text-xl font-bold text-gray-900">미사 · 성물방 · 사무실 시간표</h3>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-catholic-logo transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                주일과 평일 미사 시간, 성물방 운영, 사무장·관리장 근무 시간을 한눈에 확인하세요.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {['주일 10:00 교중미사', '화·목 19:30 저녁미사', '사무실 공휴일 휴무'].map(item => (
                  <span key={item} className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200">{item}</span>
                ))}
              </div>
            </Link>
            <Link
              to="/directions"
              className="group flex flex-col gap-4 bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 md:p-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#4C9C84]/10 text-[#4C9C84] flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#4C9C84]">주일 교중미사 차량</p>
                    <h3 className="text-xl font-bold text-gray-900">셔틀 운행 시간표 보기</h3>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#4C9C84] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                1지역 카니발, 3·4지역·5·6지역 25인승 셔틀 운행 시간과 탑승 위치를 안내합니다.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {['1지역 09:00 롯데스카이', '3·4지역 09:25 신일 정류장', '5·6지역 09:00·09:25 다회 운행'].map(item => (
                  <span key={item} className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200">{item}</span>
                ))}
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section ref={newsSectionRef} className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-catholic-logo to-catholic-logo-dark flex items-center justify-center text-white shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14l7-4 7 4V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-catholic-logo">성당 소식 허브</p>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">한눈에 보는 본당 소식</h2>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl leading-relaxed">
                공지사항부터 단체 모집, 주보 안내까지 최신 소식을 빠르게 확인하세요.
              </p>
            </div>
            <Link
              to={activeNoticeContent.ctaLink}
              className="inline-flex items-center gap-2 text-sm font-semibold text-catholic-logo hover:text-catholic-logo-dark transition-colors"
            >
              전체 소식 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(noticeTabs).map(([key, tab]) => (
              <button
                key={key}
                onClick={() => setActiveNoticeTab(key as NoticeTabKey)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeNoticeTab === key
                    ? 'bg-gradient-to-r from-catholic-logo to-catholic-logo-dark text-white shadow-lg'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-catholic-logo/30 hover:text-catholic-logo'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {activeNoticeContent.items.length > 0 ? (
                activeNoticeContent.items.map(item => {
                  const isBulletin = activeNoticeTab === 'bulletin' && 'fileUrl' in item && item.fileUrl
                  let bulletinItem: BulletinItem | null = null
                  if (isBulletin && 'bulletin' in item) {
                    bulletinItem = item.bulletin as BulletinItem
                  }
                  return (
                    <div
                      key={item.id}
                      className="p-6 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-purple-50/60 hover:to-transparent transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="w-2 h-2 rounded-full bg-catholic-logo/70 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-catholic-logo transition-colors">
                              {item.title}
                            </h3>
                          </div>
                          {item.summary && (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{item.summary}</p>
                          )}
                          {isBulletin && bulletinItem ? (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (bulletinItem) {
                                  setSelectedBulletin(bulletinItem)
                                  setIsPdfModalOpen(true)
                                }
                              }}
                              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-300 hover:scale-105"
                              style={{ backgroundColor: '#7B1F4B' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                            >
                              바로보기
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {item.date && (
                            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                              {item.date}
                            </span>
                          )}
                          {!isBulletin && (
                            <Link
                              to={item.to}
                              className="text-xs text-gray-400 hover:text-catholic-logo transition-colors"
                            >
                              자세히 보기 →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-10 text-center text-gray-500">{activeNoticeContent.emptyText}</div>
              )}
              {activeNoticeTab === 'bulletin' && bulletins.length > 0 && (
                <div className="p-6 border-t border-gray-100">
                  <Link
                    to="/bulletins"
                    className="block w-full text-center px-4 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#7B1F4B' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                  >
                    주보 전체보기 ({bulletins.length}개)
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* 예비신자 교리학교 배너 */}
              <div className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 md:p-8 text-white" style={{ background: 'linear-gradient(to right, #7B1F4B, #5a1538)' }}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold">{catechismInfo.title}</h2>
                </div>
                <p className="text-blue-100 mb-4 text-base md:text-lg leading-relaxed">
                  {catechismInfo.description}
                </p>
                <div className="flex items-center gap-2 text-blue-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="font-semibold">{catechismInfo.contact}</p>
                </div>
              </div>

              {/* 빠르게 이동하기 */}
              <div className="bg-gradient-to-br from-catholic-logo to-catholic-logo-dark text-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col justify-between min-h-[200px]">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    빠르게 이동하기
                  </h3>
                  <ul className="space-y-3 text-sm text-white/90">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white/70"></span>
                      최신 공지와 단체 소식을 확인하세요.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white/70"></span>
                      주보 PDF를 내려받아 신앙 생활에 활용하세요.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white/70"></span>
                      성당단체 조직도를 확인하세요.
                    </li>
                  </ul>
                </div>
                <div className="mt-6 space-y-3">
                  <Link
                    to="/news"
                    className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 transition-all"
                  >
                    공지/소식 페이지로 이동
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white via-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 md:p-12 space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-catholic-logo/10 text-sm font-semibold text-catholic-logo">
                  성당단체 조직도
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  하나의 신앙, 다양한 사도직 활동
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  위원회·단체 소개와 조직도를 한눈에 확인하세요.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/organizations"
                    className="group inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-catholic-logo/30 hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="w-10 h-10 rounded-lg bg-catholic-logo/10 flex items-center justify-center text-catholic-logo">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M9 20H4v-2a3 3 0 015.356-1.857M12 14a4 4 0 100-8 4 4 0 000 8z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-catholic-logo">성당단체 안내</p>
                      <p className="text-xs text-gray-500">위원회와 단체 소개</p>
                    </div>
                  </Link>
                  <Link
                    to="/organizations/tree"
                    className="group inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-catholic-logo/30 hover:-translate-y-1 transition-all duration-300"
                  >
                    <span className="w-10 h-10 rounded-lg bg-catholic-logo/10 flex items-center justify-center text-catholic-logo">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-9 4h18" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-catholic-logo">조직도 보기</p>
                      <p className="text-xs text-gray-500">주임신부님부터 위원회, 단체 정보</p>
                    </div>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-catholic-logo/90 to-catholic-logo-dark"></div>
                <div className="relative h-full p-8 md:p-12 text-white flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-2xl font-semibold">성당단체 한 눈에</h4>
                    <p className="text-sm text-white/80 leading-relaxed">
                      6개 위원회와 24개 단체가 신앙으로 함께합니다. 단체 소개와 활동 사진을 확인하세요.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: '상임 위원회', value: '6개' },
                      { label: '산하 단체', value: '24개' },
                      { label: '최근 업데이트', value: formatDate(notices[0]?.date || bulletins[0]?.date) }
                    ].map(item => (
                      <div key={item.label} className="rounded-2xl bg-white/10 backdrop-blur p-3">
                        <p className="text-white/70 text-xs uppercase tracking-wide">{item.label}</p>
                        <p className="text-lg font-semibold text-white mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={gallerySectionRef} className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-catholic-logo mb-2">성당 앨범</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">사진으로 기억하는 상미성당</h2>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                본당 행사와 단체 활동의 모습을 앨범에서 모아보세요.
              </p>
            </div>
            <Link
              to="/albums"
              className="inline-flex items-center gap-2 text-sm font-semibold text-catholic-logo hover:text-catholic-logo-dark transition-colors"
            >
              앨범 전체 보기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {displayAlbums.map((album, i) => (
              <Link
                key={album.id || i}
                to={album.id ? `/albums/${album.id}` : '/albums'}
                className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundColor: '#f3f4f6' }}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={i < 2 ? 'high' : 'low'}
                    width="400"
                    height="300"
                    onLoad={(e) => {
                      const img = e.currentTarget
                      img.style.backgroundColor = 'transparent'
                      
                      // 썸네일이 로드되었고 원본이 있으면 백그라운드에서 원본 로드 후 교체 (Albums 페이지와 동일)
                      if (album.thumbnailUrl && album.originalUrl && img.src === album.thumbnailUrl) {
                        const originalImg = new Image()
                        originalImg.onload = () => {
                          img.src = album.originalUrl!
                        }
                        originalImg.src = album.originalUrl
                      }
                    }}
                    onError={(e) => {
                      // 썸네일 로드 실패 시 원본 시도
                      if (album.originalUrl && e.currentTarget.src !== album.originalUrl) {
                        e.currentTarget.src = album.originalUrl
                      } else {
                        // 둘 다 실패 시 대체 이미지
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E이미지 없음%3C/text%3E%3C/svg%3E'
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-400">
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur text-white text-xs font-medium">
                      사진 더 보기
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="px-5 py-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-catholic-logo transition-colors">
                    {album.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {selectedBulletin && (
        <PdfViewerModal
          isOpen={isPdfModalOpen}
          title={selectedBulletin.title}
          description={selectedBulletin.description}
          fileUrl={selectedBulletin.fileUrl}
          onClose={() => {
            setIsPdfModalOpen(false)
            setSelectedBulletin(null)
          }}
        />
      )}
    </div>
  )
}
