// 네이버 클라우드 Object Storage 기반 데이터 관리 유틸리티
// 모든 데이터는 네이버 클라우드에 저장되며, localStorage는 사용하지 않음

import { NoticeItem } from '../data/notices'
import type { Album } from '../data/albums'
import defaultAlbumImg1 from '../../사진파일/KakaoTalk_20251104_172439243_01.jpg'
import defaultAlbumImg2 from '../../사진파일/KakaoTalk_20251104_172439243_02.jpg'
import defaultAlbumImg3 from '../../사진파일/KakaoTalk_20251104_172439243_03.jpg'
import defaultAlbumImg4 from '../../사진파일/KakaoTalk_20251104_172439243_04.jpg'

export type RecruitmentItem = {
  id: string
  title: string
  summary: string
  content?: string // 상세 내용
}

export type FAQItem = {
  id: string
  question: string
  answer: string
}

export type AlbumWithCategory = Album & {
  id: string
  category: string
}

export type MassScheduleItem = {
  id: string
  day: string // 요일 (예: 월요일)
  time: string // 시간 (예: 오전 6시 30분)
  description?: string // 설명 (예: 새벽미사)
  note?: string // 추가 설명 (예: 매월 첫토요일)
}

export type SacramentItem = {
  id: string
  name: string // 성사 이름 (예: 세례성사)
  description: string // 설명 (예: 예비신자 교리 후 진행)
}

export type CatechismInfo = {
  title: string
  description: string
  contact: string
}

export type BulletinItem = {
  id: string
  title: string // 예: "2025년 11월 주보"
  date: string // YYYY-MM-DD
  fileUrl: string // PDF 파일 URL
  thumbnailUrl?: string // 썸네일 이미지 URL (선택)
  description?: string // 설명 (선택)
}

// 단체 타입
export type OrganizationType = 
  // 상위 위원회
  | '총회장'
  | '총무'
  | '소공동체위원회'
  | '전례위원회'
  | '제분과위원회'
  | '청소년위원회'
  | '재정위원회'
  | '평신도협의회'
  // 소공동체위원회 하위
  | '1지역'
  | '2지역'
  | '3지역'
  | '4지역'
  | '5지역'
  | '6지역'
  // 청소년위원회 하위
  | '청년분과'
  | '초등부주일학교'
  | '중고등부주일학교'
  | '청년회'
  | '자모회'
  | '자부회'
  | '복사단자모회'
  // 전례위원회 하위
  | '해설/독서단'
  | '성인복사단'
  | '어린이복사단'
  | '성가대'
  | '제대회'
  | '헌화회'
  // 제분과위원회 하위
  | '교육분과'
  | '선교분과'
  | '홍보분과'
  | '성소분과'
  | '사회복지분과'
  | '가정분과'
  | '시설분과'
  | '성물방'
  | '크리스토폴 운전봉사단'
  // 평신도협의회 하위
  | '울뜨레야'
  | '꾸리아'
  | 'ME'
  | '연령회'
  | '기쁨의샘 Cu.'

// 첨부파일 타입
export type AttachmentFile = {
  id: string
  name: string // 파일명
  url: string // 파일 URL (Base64 또는 외부 URL)
  type: 'image' | 'pdf' | 'document' | 'other' // 파일 타입
  size?: number // 파일 크기 (bytes)
}

// 단체 게시글 타입
export type OrganizationPost = {
  id: string
  organization: OrganizationType // 단체
  title: string // 제목
  content: string // 내용
  date: string // YYYY-MM-DD
  author?: string // 작성자
  attachments?: AttachmentFile[] // 첨부파일
  imageUrl?: string // 대표 이미지
  isImportant?: boolean // 중요 게시글
}

// 공지사항 관리
const NOTICES_KEY = 'admin_notices'
const RECRUITMENTS_KEY = 'admin_recruitments'
const FAQS_KEY = 'admin_faqs'
const ALBUMS_KEY = 'admin_albums'
const MASS_SCHEDULE_KEY = 'admin_mass_schedule'
const SACRAMENTS_KEY = 'admin_sacraments'
const CATECHISM_KEY = 'admin_catechism'
const BULLETINS_KEY = 'admin_bulletins'
const ORGANIZATIONS_KEY = 'admin_organizations'
const ORGANIZATION_POSTS_KEY = 'admin_organization_posts'

const DEFAULT_ALBUM_ID = '1762757851120'

const createDefaultAlbum = (): AlbumWithCategory => {
  const today = new Date().toISOString().split('T')[0]
  return {
    id: DEFAULT_ALBUM_ID,
    title: '상미성당 앨범',
    date: today,
    cover: defaultAlbumImg1,
    category: '행사',
    photos: [
      { src: defaultAlbumImg1, alt: '성당 사진 1', tags: ['본당', '외관'] },
      { src: defaultAlbumImg2, alt: '성당 사진 2', tags: ['내부', '전례'] },
      { src: defaultAlbumImg3, alt: '성당 사진 3', tags: ['행사', '전례'] },
      { src: defaultAlbumImg4, alt: '성당 사진 4', tags: ['공동체', '행사'] }
    ]
  }
}

// JSON 파일 로드 헬퍼 함수
const loadJSON = async <T>(path: string, fallback: T): Promise<T> => {
  try {
    const response = await fetch(path)
    if (response.ok) {
      return await response.json()
    }
  } catch (e) {
    // JSON 파일이 없거나 로드 실패 시 무시
  }
  return fallback
}

// 동기식 JSON 파일 로드 (초기 로드용)
let cachedData: {
  notices?: NoticeItem[]
  recruitments?: RecruitmentItem[]
  faqs?: FAQItem[]
  albums?: AlbumWithCategory[]
  massSchedule?: MassScheduleItem[]
  sacraments?: SacramentItem[]
  catechism?: CatechismInfo | null
  bulletins?: BulletinItem[]
  organizationPosts?: OrganizationPost[]
} = {}

// 데이터 초기화 (페이지 로드 시 한 번만 실행)
// 모든 데이터는 네이버 클라우드에서 로드 (localStorage 사용 안 함)
export const initializeData = async (): Promise<void> => {
  try {
    console.log('[initializeData] 실행 시작 - 네이버 클라우드에서 모든 데이터 로드')
    
    // 모든 데이터를 서버에서 로드
    const [notices, recruitments, faqs, albums, massSchedule, sacraments, catechism, bulletins, organizationPosts] = await Promise.all([
      loadDataFromServer<NoticeItem[]>('notices'),
      loadDataFromServer<RecruitmentItem[]>('recruitments'),
      loadDataFromServer<FAQItem[]>('faqs'),
      loadDataFromServer<AlbumWithCategory[]>('albums'),
      loadDataFromServer<MassScheduleItem[]>('massSchedule'),
      loadDataFromServer<SacramentItem[]>('sacraments'),
      loadDataFromServer<CatechismInfo | null>('catechism'),
      loadDataFromServer<BulletinItem[]>('bulletins'),
      loadDataFromServer<OrganizationPost[]>('organizationPosts')
    ])
    
    // 서버에서 로드한 데이터를 캐시에 저장 (메모리 캐시만 사용)
    cachedData = {
      notices: notices || [],
      recruitments: recruitments || [],
      faqs: faqs || [],
      albums: albums || [],
      massSchedule: massSchedule || [],
      sacraments: sacraments || [],
      catechism: catechism || null,
      bulletins: bulletins || [],
      organizationPosts: organizationPosts || []
    }
    
    console.log('[initializeData] 서버에서 데이터 로드 완료:', {
      notices: cachedData.notices?.length || 0,
      recruitments: cachedData.recruitments?.length || 0,
      faqs: cachedData.faqs?.length || 0,
      albums: cachedData.albums?.length || 0,
      massSchedule: cachedData.massSchedule?.length || 0,
      sacraments: cachedData.sacraments?.length || 0,
      catechism: cachedData.catechism ? 1 : 0,
      bulletins: cachedData.bulletins?.length || 0,
      organizationPosts: cachedData.organizationPosts?.length || 0
    })
  } catch (e) {
    console.error('데이터 초기화 실패:', e)
  }
}

// 서버에서 데이터 로드 (공통 함수)
const loadDataFromServer = async <T>(type: string): Promise<T | null> => {
  try {
    // 캐시 방지를 위해 타임스탬프와 랜덤 값 추가 (모바일 브라우저 캐시 완전 회피)
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const url = `/api/load-metadata?type=${type}&_t=${timestamp}&_r=${random}`
    console.log(`[loadDataFromServer] ${type} 서버에서 로드 시도:`, url)
    
    // 모바일 브라우저 캐시 완전 회피를 위한 강력한 헤더
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store', // fetch API의 캐시 옵션
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'If-Modified-Since': '0', // 조건부 요청 방지
        'If-None-Match': '*', // ETag 캐시 방지
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.data !== undefined) {
        console.log(`[loadDataFromServer] ${type} 서버에서 로드 성공:`, Array.isArray(result.data) ? `${result.data.length}개` : '데이터 있음')
        return result.data as T
      } else {
        console.warn(`[loadDataFromServer] ${type} 서버 응답에 data 없음`)
      }
    } else {
      console.warn(`[loadDataFromServer] ${type} 서버 응답 오류:`, response.status, response.statusText)
      // 에러 응답도 로그에 기록
      try {
        const errorText = await response.text()
        console.warn(`[loadDataFromServer] ${type} 에러 응답 내용:`, errorText)
      } catch (e) {
        // 무시
      }
    }
  } catch (error) {
    console.error(`[loadDataFromServer] ${type} 서버 로드 실패:`, error)
    // 네트워크 오류 상세 정보
    if (error instanceof Error) {
      console.error(`[loadDataFromServer] ${type} 오류 상세:`, error.message, error.stack)
    }
  }
  return null
}

// 서버에 데이터 저장 (공통 함수)
const saveDataToServer = async (type: string, data: any): Promise<boolean> => {
  try {
    const response = await fetch('/api/save-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data })
    })
    if (response.ok) {
      console.log(`[saveDataToServer] ${type} 서버 저장 성공`)
      return true
    } else {
      const text = await response.text()
      console.warn(`[saveDataToServer] ${type} 서버 저장 실패:`, text)
    }
  } catch (error) {
    console.warn(`[saveDataToServer] ${type} 서버 저장 오류:`, error)
  }
  return false
}

export const getNotices = async (forceRefresh = false): Promise<NoticeItem[]> => {
  // 캐시된 데이터 우선 (forceRefresh가 false일 때만)
  if (!forceRefresh && cachedData.notices) return cachedData.notices
  
  // 서버에서 로드
  const serverData = await loadDataFromServer<NoticeItem[]>('notices')
  if (serverData !== null) {
    cachedData.notices = serverData
    return serverData
  }
  
  // 서버 데이터가 없으면 빈 배열 반환
  cachedData.notices = []
  return []
}

export const saveNotices = async (notices: NoticeItem[]): Promise<void> => {
  // 서버에 저장
  await saveDataToServer('notices', notices)
  // 캐시 업데이트
  cachedData.notices = notices
  // 이벤트 발생
  window.dispatchEvent(new CustomEvent('noticesUpdated'))
}

// JSON 파일 내보내기 (다운로드)
export const exportNotices = async (): Promise<void> => {
  const data = await getNotices()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'notices.json'
  a.click()
  URL.revokeObjectURL(url)
}

export const getRecruitments = async (forceRefresh = false): Promise<RecruitmentItem[]> => {
  if (!forceRefresh && cachedData.recruitments) return cachedData.recruitments
  
  const serverData = await loadDataFromServer<RecruitmentItem[]>('recruitments')
  if (serverData !== null) {
    cachedData.recruitments = serverData
    return serverData
  }
  
  cachedData.recruitments = []
  return []
}

export const saveRecruitments = async (recruitments: RecruitmentItem[]): Promise<void> => {
  await saveDataToServer('recruitments', recruitments)
  cachedData.recruitments = recruitments
  window.dispatchEvent(new CustomEvent('recruitmentsUpdated'))
}

export const exportRecruitments = async (): Promise<void> => {
  const data = await getRecruitments()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'recruitments.json'
  a.click()
  URL.revokeObjectURL(url)
}

export const getFAQs = async (forceRefresh = false): Promise<FAQItem[]> => {
  if (!forceRefresh && cachedData.faqs) return cachedData.faqs
  
  const serverData = await loadDataFromServer<FAQItem[]>('faqs')
  if (serverData !== null) {
    cachedData.faqs = serverData
    return serverData
  }
  
  cachedData.faqs = []
  return []
}

export const saveFAQs = async (faqs: FAQItem[]): Promise<void> => {
  await saveDataToServer('faqs', faqs)
  cachedData.faqs = faqs
  window.dispatchEvent(new CustomEvent('faqsUpdated'))
}

export const exportFAQs = async (): Promise<void> => {
  const data = await getFAQs()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'faqs.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 앨범 관리
export const getAlbums = async (forceRefresh = false): Promise<AlbumWithCategory[]> => {
  // 캐시된 데이터 우선 (forceRefresh가 false일 때만)
  if (!forceRefresh && cachedData.albums) {
    return cachedData.albums
  }
  
  // 서버에서 로드
  const serverData = await loadDataFromServer<AlbumWithCategory[]>('albums')
  if (serverData !== null) {
    // photos 배열이 없는 앨범도 유효성 검사
    const validAlbums = serverData.map(album => ({
      ...album,
      photos: Array.isArray(album.photos) ? album.photos : []
    }))
    cachedData.albums = validAlbums
    return validAlbums
  }
  
  // 서버 데이터가 없으면 빈 배열 반환
  cachedData.albums = []
  return []
}

export const saveAlbums = async (albums: AlbumWithCategory[], skipEvent = false): Promise<void> => {
  try {
    // 서버에 저장
    const success = await saveDataToServer('albums', albums)
    if (!success) {
      throw new Error('서버 저장 실패')
    }
    
    // 캐시 업데이트
    cachedData.albums = albums
    
    if (!skipEvent) {
      window.dispatchEvent(new CustomEvent('albumsUpdated'))
    }
  } catch (error) {
    console.error('앨범 저장 실패:', error)
    alert('앨범을 저장하는 중 오류가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.')
    throw error
  }
}

export const exportAlbums = async (): Promise<void> => {
  const data = await getAlbums()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'albums.json'
  a.click()
  URL.revokeObjectURL(url)
}

export const getAlbumCategories = (): string[] => {
  return ['전체', '주일 미사', '행사', '전례', '공동체 활동', '기타']
}

export const ensureDefaultAlbumExists = async (): Promise<void> => {
  // 기본 앨범이 삭제된 경우 다시 생성하지 않음
  // localStorage는 더 이상 사용하지 않으므로 서버에서 확인
  try {
    const albums = await getAlbums(true)
    if (!albums.some(album => album.id === DEFAULT_ALBUM_ID)) {
      const nextAlbums = [...albums, createDefaultAlbum()]
      // 기본 앨범 생성 시 이벤트 발생하지 않음 (무한 루프 방지)
      await saveAlbums(nextAlbums, true)
    }
  } catch (error) {
    console.warn('[ensureDefaultAlbumExists] 기본 앨범 확인 실패:', error)
  }
}

// 미사 시간 관리
export const getMassSchedule = async (forceRefresh = false): Promise<MassScheduleItem[]> => {
  console.log(`[getMassSchedule] 호출 - forceRefresh: ${forceRefresh}, 캐시 있음: ${!!cachedData.massSchedule}`)
  
  // forceRefresh가 true이면 무조건 서버에서 가져오기
  if (forceRefresh) {
    console.log('[getMassSchedule] forceRefresh=true, 서버에서 강제 로드')
    // 캐시 무효화
    cachedData.massSchedule = undefined
    
    const serverData = await loadDataFromServer<MassScheduleItem[]>('massSchedule')
    if (serverData !== null) {
      cachedData.massSchedule = serverData
      console.log(`[getMassSchedule] 서버에서 로드 완료: ${serverData.length}개`)
      return serverData
    }
    
    console.warn('[getMassSchedule] 서버 데이터 없음, 빈 배열 반환')
    cachedData.massSchedule = []
    return []
  }
  
  // 캐시된 데이터 우선 (forceRefresh가 false일 때만)
  if (cachedData.massSchedule) {
    console.log(`[getMassSchedule] 캐시에서 반환: ${cachedData.massSchedule.length}개`)
    return cachedData.massSchedule
  }
  
  // 캐시가 없으면 서버에서 로드
  console.log('[getMassSchedule] 캐시 없음, 서버에서 로드')
  const serverData = await loadDataFromServer<MassScheduleItem[]>('massSchedule')
  if (serverData !== null) {
    cachedData.massSchedule = serverData
    console.log(`[getMassSchedule] 서버에서 로드 완료: ${serverData.length}개`)
    return serverData
  }
  
  console.warn('[getMassSchedule] 서버 데이터 없음, 빈 배열 반환')
  cachedData.massSchedule = []
  return []
}

export const saveMassSchedule = async (schedule: MassScheduleItem[]): Promise<void> => {
  await saveDataToServer('massSchedule', schedule)
  cachedData.massSchedule = schedule
  window.dispatchEvent(new CustomEvent('massScheduleUpdated'))
}

export const exportMassSchedule = async (): Promise<void> => {
  const data = await getMassSchedule()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mass-schedule.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 성사 안내 관리
export const getSacraments = async (forceRefresh = false): Promise<SacramentItem[]> => {
  if (!forceRefresh && cachedData.sacraments) return cachedData.sacraments
  
  const serverData = await loadDataFromServer<SacramentItem[]>('sacraments')
  if (serverData !== null) {
    cachedData.sacraments = serverData
    return serverData
  }
  
  cachedData.sacraments = []
  return []
}

export const saveSacraments = async (sacraments: SacramentItem[]): Promise<void> => {
  await saveDataToServer('sacraments', sacraments)
  cachedData.sacraments = sacraments
  window.dispatchEvent(new CustomEvent('sacramentsUpdated'))
}

export const exportSacraments = async (): Promise<void> => {
  const data = await getSacraments()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sacraments.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 예비신자 교리학교 정보 관리
export const getCatechismInfo = async (forceRefresh = false): Promise<CatechismInfo | null> => {
  if (!forceRefresh && cachedData.catechism !== undefined) return cachedData.catechism
  
  const serverData = await loadDataFromServer<CatechismInfo | null>('catechism')
  if (serverData !== null) {
    cachedData.catechism = serverData
    return serverData
  }
  
  cachedData.catechism = null
  return null
}

export const saveCatechismInfo = async (info: CatechismInfo): Promise<void> => {
  await saveDataToServer('catechism', info)
  cachedData.catechism = info
  window.dispatchEvent(new CustomEvent('catechismUpdated'))
}

export const exportCatechismInfo = async (): Promise<void> => {
  const data = await getCatechismInfo()
  if (data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'catechism.json'
    a.click()
    URL.revokeObjectURL(url)
  }
}

// 주보 안내 관리
// 주보 관리
export const getBulletins = async (forceRefresh = false): Promise<BulletinItem[]> => {
  console.log(`[getBulletins] 호출 - forceRefresh: ${forceRefresh}, 캐시 있음: ${!!cachedData.bulletins}`)
  
  // forceRefresh가 true이면 무조건 서버에서 가져오기
  if (forceRefresh) {
    console.log('[getBulletins] forceRefresh=true, 서버에서 강제 로드')
    // 캐시 무효화
    cachedData.bulletins = undefined
    
    const serverData = await loadDataFromServer<BulletinItem[]>('bulletins')
    if (serverData !== null) {
      cachedData.bulletins = serverData
      console.log(`[getBulletins] 서버에서 로드 완료: ${serverData.length}개 주보`)
      return serverData
    }
    
    console.warn('[getBulletins] 서버 데이터 없음, 빈 배열 반환')
    cachedData.bulletins = []
    return []
  }
  
  // 캐시된 데이터 우선 (forceRefresh가 false일 때만)
  if (cachedData.bulletins) {
    console.log(`[getBulletins] 캐시에서 반환: ${cachedData.bulletins.length}개 주보`)
    return cachedData.bulletins
  }
  
  // 캐시가 없으면 서버에서 로드
  console.log('[getBulletins] 캐시 없음, 서버에서 로드')
  const serverData = await loadDataFromServer<BulletinItem[]>('bulletins')
  if (serverData !== null) {
    cachedData.bulletins = serverData
    console.log(`[getBulletins] 서버에서 로드 완료: ${serverData.length}개 주보`)
    return serverData
  }
  
  console.warn('[getBulletins] 서버 데이터 없음, 빈 배열 반환')
  cachedData.bulletins = []
  return []
}

export const saveBulletins = async (bulletins: BulletinItem[]): Promise<void> => {
  // 서버에 저장
  const success = await saveDataToServer('bulletins', bulletins)
  if (!success) {
    throw new Error('서버 저장 실패')
  }
  
  // 캐시 업데이트
  cachedData.bulletins = bulletins
  
  // 다른 페이지에서 업데이트를 감지할 수 있도록 이벤트 발생
  window.dispatchEvent(new CustomEvent('bulletinsUpdated'))
}

export const exportBulletins = async (): Promise<void> => {
  const data = await getBulletins()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bulletins.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 단체 게시글 관리
export const getOrganizationPosts = async (organization?: OrganizationType, forceRefresh = false): Promise<OrganizationPost[]> => {
  // 전체 게시글 가져오기
  let allPosts: OrganizationPost[] = []
  
  if (!forceRefresh && cachedData.organizationPosts) {
    allPosts = cachedData.organizationPosts
  } else {
    const serverData = await loadDataFromServer<OrganizationPost[]>('organizationPosts')
    if (serverData !== null) {
      allPosts = serverData
      cachedData.organizationPosts = allPosts
    } else {
      allPosts = []
      cachedData.organizationPosts = []
    }
  }
  
  // organization이 지정되지 않으면 전체 반환
  if (!organization) {
    return allPosts
  }
  
  // 특정 단체의 게시글 필터링
  const directPosts = allPosts.filter(post => post.organization === organization)
  
  // 상위 위원회인 경우 하위 단체 게시글도 포함
  const subOrgs = getSubOrganizations(organization as ParentOrganizationType)
  if (subOrgs.length > 0) {
    const subOrgPosts = subOrgs.flatMap(subOrg => 
      allPosts.filter(post => post.organization === subOrg)
    )
    return [...directPosts, ...subOrgPosts]
  }
  
  return directPosts
}

export const saveOrganizationPosts = async (posts: OrganizationPost[]): Promise<void> => {
  // 서버에 저장
  const success = await saveDataToServer('organizationPosts', posts)
  if (!success) {
    throw new Error('서버 저장 실패')
  }
  
  // 캐시 즉시 업데이트
  cachedData.organizationPosts = posts
  // 이벤트 발생하여 모든 컴포넌트에 알림
  window.dispatchEvent(new CustomEvent('organizationPostsUpdated'))
}

export const exportOrganizationPosts = async (): Promise<void> => {
  const data = await getOrganizationPosts()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'organization-posts.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 상위 위원회 타입
export type ParentOrganizationType = 
  | '총회장'
  | '총무'
  | '소공동체위원회'
  | '전례위원회'
  | '제분과위원회'
  | '청소년위원회'
  | '재정위원회'
  | '평신도협의회'

// 단체 목록 및 정보
export const getOrganizationTypes = (): OrganizationType[] => {
  return [
    '총회장',
    '총무',
    '소공동체위원회',
    '전례위원회',
    '제분과위원회',
    '청소년위원회',
    '재정위원회',
    '평신도협의회',
    // 소공동체위원회 하위
    '1지역',
    '2지역',
    '3지역',
    '4지역',
    '5지역',
    '6지역',
    // 청소년위원회 하위
    '청년분과',
    '초등부주일학교',
    '중고등부주일학교',
    '청년회',
    '자모회',
    '자부회',
    '복사단자모회',
    // 전례위원회 하위
    '해설/독서단',
    '성인복사단',
    '어린이복사단',
    '성가대',
    '제대회',
    '헌화회',
    // 제분과위원회 하위
    '교육분과',
    '선교분과',
    '홍보분과',
    '성소분과',
    '사회복지분과',
    '가정분과',
    '시설분과',
    '성물방',
    '크리스토폴 운전봉사단',
    // 평신도협의회 하위
    '울뜨레야',
    '꾸리아',
    'ME',
    '연령회',
    '기쁨의샘 Cu.'
  ]
}

// 상위 위원회와 단체 매핑
export const getParentOrganization = (org: OrganizationType): ParentOrganizationType | null => {
  const mapping: Record<OrganizationType, ParentOrganizationType | null> = {
    '총회장': null,
    '총무': null,
    '소공동체위원회': null,
    '전례위원회': null,
    '제분과위원회': null,
    '청소년위원회': null,
    '재정위원회': null,
    '평신도협의회': null,
    // 소공동체위원회 하위
    '1지역': '소공동체위원회',
    '2지역': '소공동체위원회',
    '3지역': '소공동체위원회',
    '4지역': '소공동체위원회',
    '5지역': '소공동체위원회',
    '6지역': '소공동체위원회',
    // 청소년위원회 하위
    '청년분과': '청소년위원회',
    '초등부주일학교': '청소년위원회',
    '중고등부주일학교': '청소년위원회',
    '청년회': '청소년위원회',
    '자모회': '청소년위원회',
    '자부회': '청소년위원회',
    '복사단자모회': '전례위원회',
    // 전례위원회 하위
    '해설/독서단': '전례위원회',
    '성인복사단': '전례위원회',
    '어린이복사단': '전례위원회',
    '성가대': '전례위원회',
    '제대회': '전례위원회',
    '헌화회': '전례위원회',
    // 제분과위원회 하위
    '교육분과': '제분과위원회',
    '선교분과': '제분과위원회',
    '홍보분과': '제분과위원회',
    '성소분과': '제분과위원회',
    '사회복지분과': '제분과위원회',
    '가정분과': '제분과위원회',
    '시설분과': '재정위원회',
    '성물방': '재정위원회',
    '크리스토폴 운전봉사단': '재정위원회',
    // 평신도협의회 하위
    '울뜨레야': '평신도협의회',
    '꾸리아': '평신도협의회',
    'ME': '평신도협의회',
    '연령회': '평신도협의회',
    '기쁨의샘 Cu.': '평신도협의회'
  }
  return mapping[org] || null
}

// 단체 목록 가져오기
export const getSubOrganizations = (parent: ParentOrganizationType): OrganizationType[] => {
  const allOrgs = getOrganizationTypes()
  return allOrgs.filter(org => getParentOrganization(org) === parent)
}

export const getOrganizationInfo = (type: OrganizationType): { name: string; description: string } => {
  const info: Record<OrganizationType, { name: string; description: string }> = {
    '총회장': {
      name: '총회장',
      description: '본당의 전반적인 운영과 관리를 총괄하며, 모든 위원회와 단체를 조율하고 통합합니다. 본당 회의를 주관하고 사목 방향을 제시하며, 각 위원회 간의 협력과 소통을 이끌어갑니다.'
    },
    '총무': {
      name: '총무',
      description: '본당의 행정 업무와 서류 관리를 담당합니다. 회의록 작성, 공지사항 전달, 각종 행사와 모임의 준비 및 진행을 지원하며, 본당의 일상적인 운영이 원활하게 이루어지도록 합니다.'
    },
    '소공동체위원회': {
      name: '소공동체위원회',
      description: '신자들이 작은 공동체로 모여 함께 기도하고 말씀을 나누며 나눔을 실천하는 소공동체 활동을 조직하고 지원합니다. 소공동체의 형성과 운영을 돕고, 신자들의 신앙 공동체 의식을 강화합니다.'
    },
    '전례위원회': {
      name: '전례위원회',
      description: '미사와 전례 행사의 준비 및 진행을 담당합니다. 성가대 운영, 봉사자 배치, 전례 장식, 전례 도구 관리 등을 통해 전례의 품위를 유지하고 신자들이 경건하게 미사에 참여할 수 있도록 합니다.'
    },
    '제분과위원회': {
      name: '제분과위원회',
      description: '본당의 각 분과(교육, 사회복지, 선교 등) 활동을 조율하고 지원합니다. 각 분과의 사목 활동이 원활하게 이루어지도록 기획하고 실행하며, 본당의 다양한 사목 사업을 통합 관리합니다.'
    },
    '청소년위원회': {
      name: '청소년위원회',
      description: '청소년 신자들의 신앙 교육과 공동체 활동을 지원합니다. 청소년 미사, 모임, 캠프, 봉사 활동 등을 기획하고 실행하여 청소년들의 신앙 성장과 공동체 참여를 독려합니다.'
    },
    '재정위원회': {
      name: '재정·관리위원회',
      description: '본당의 재정과 자산, 시설을 통합 관리하며 예산 편성·집행, 감사, 시설 유지보수 계획을 총괄합니다. 투명하고 책임감 있는 운영으로 안전하고 쾌적한 본당 환경을 만듭니다.'
    },
    '평신도협의회': {
      name: '평신도협의회',
      description: '평신도들의 의견을 수렴하고 본당 운영에 반영합니다. 평신도 사도직의 실현을 위해 신자들의 목소리를 대변하고, 본당의 주요 사안에 대해 협의하며 신자들의 적극적인 참여를 유도합니다.'
    },
    // 소공동체위원회 하위
    '1지역': { 
      name: '1지역', 
      description: '신갈2, 신갈3, 원대, 구갈1, 롯데스카이, 우림·풍림 구역의 신자들이 함께 모여 기도하고 나눔을 실천하는 소공동체입니다.' 
    },
    '2지역': { 
      name: '2지역', 
      description: '신갈1, 상미, 롯데캐슬1, 롯데캐슬2, 우방 구역의 신자들이 함께 모여 기도하고 나눔을 실천하는 소공동체입니다.' 
    },
    '3지역': { 
      name: '3지역', 
      description: '두진1, 두진2, 신일1, 신일2, 태영, 대명, 힉스 구역의 신자들이 함께 모여 기도하고 나눔을 실천하는 소공동체입니다.' 
    },
    '4지역': { 
      name: '4지역', 
      description: '효성1, 효성2, 효성3, 포레피스 구역의 신자들이 함께 모여 기도하고 나눔을 실천하는 소공동체입니다.' 
    },
    '5지역': { 
      name: '5지역', 
      description: '지웰1, 지웰2, 지웰3, 롯데기흥, 힐스1, 힐스2 구역의 신자들이 함께 모여 기도하고 나눔을 실천하는 소공동체입니다.' 
    },
    '6지역': { 
      name: '6지역', 
      description: '센트럴1, 센트럴2, 파크1, 파크2, 더샵1, 더샵2, 더샵3 구역의 신자들이 함께 모여 기도하고 나눔을 실천하는 소공동체입니다.' 
    },
    // 청소년위원회 하위
    '청년분과': { name: '청년분과', description: '청년 신자들의 신앙 성장과 공동체 활동을 지원하는 청소년위원회 소속 분과입니다.' },
    '초등부주일학교': { name: '초등부 주일학교 교사회', description: '초등부 교사회가 주일학교를 운영하며, 아이들이 복음과 성사를 기쁘게 만날 수 있도록 수업과 활동을 준비합니다.' },
    '중고등부주일학교': { name: '중고등부 주일학교 교사회', description: '중고등부 교사회가 청소년들의 신앙 성장과 인성 형성을 돕기 위해 교리 교육과 나눔, 봉사 프로그램을 기획하고 진행합니다.' },
    '청년회': { name: '청년회', description: '청년 신자들의 모임으로, 신앙 공유와 친교 활동을 통해 청년들의 신앙 성장을 돕습니다.' },
    '자모회': { name: '자모회', description: '자녀를 둔 어머니들의 모임으로, 자녀 교육과 신앙 나눔을 통해 함께 성장합니다.' },
    '자부회': { name: '자부회', description: '자녀를 둔 아버지들의 모임으로, 자녀 교육과 신앙 나눔을 통해 함께 성장합니다.' },
    '복사단자모회': { name: '전례위원회', description: '복사단 부모님들이 전례 봉사를 지원하고 자녀들과 함께 미사 준비를 돕는 협력팀입니다.' },
    // 전례위원회 하위
    '해설/독서단': { name: '해설/독서단', description: '미사 중 성경 말씀을 읽고 해설하는 봉사자들로 구성된 전례위원회 소속 단체입니다.' },
    '성인복사단': { name: '성인복사단', description: '성인 신자들로 구성된 복사단으로, 미사 전례 봉사를 담당합니다.' },
    '어린이복사단': { name: '유대철 베드로 복사단', description: '어린이 복사단이 유대철 베드로 성인을 본받아 전례 봉사와 기도 생활을 충실히 실천하도록 돕습니다.' },
    '성가대': { name: '프란치스코 성가대', description: '프란치스코 성가대가 미사와 전례에서 아름다운 성가로 신자들의 기도를 돕고 전례의 품위를 높입니다.' },
    '제대회': { name: '제대회', description: '제대 봉사를 담당하는 전례위원회 소속 단체입니다.' },
    '헌화회': { name: '헌화회', description: '미사와 전례 행사에서 꽃 장식을 담당하는 전례위원회 소속 단체입니다.' },
    // 제분과위원회 하위
    '교육분과': { name: '교육분과', description: '신자들의 신앙 교육과 성경 공부를 담당하는 제분과위원회 소속 분과입니다.' },
    '선교분과': { name: '선교분과', description: '복음 전파와 선교 활동을 기획하고 실행하는 제분과위원회 소속 분과입니다.' },
    '홍보분과': { name: '홍보분과', description: '본당의 각종 행사와 소식을 홍보하는 제분과위원회 소속 분과입니다.' },
    '성소분과': { name: '성소분과', description: '사제와 수도자 성소를 지원하고 홍보하는 제분과위원회 소속 분과입니다.' },
    '사회복지분과': { name: '사회복지분과', description: '지역 사회 봉사와 복지 활동을 담당하는 제분과위원회 소속 분과입니다.' },
    '가정분과': { name: '가정분과', description: '가정의 신앙 생활과 가정 사목을 지원하는 제분과위원회 소속 분과입니다.' },
    '시설분과': { name: '시설분과', description: '본당 건물과 시설을 점검하고 유지·보수 계획을 수립하여 안전하고 쾌적한 환경을 유지합니다.' },
    '성물방': { name: '성물방', description: '전례 용품과 성물을 관리하며 신자들이 신앙 생활에 필요한 성물을 구입할 수 있도록 돕습니다.' },
    '크리스토폴 운전봉사단': { name: '크리스토폴 운전봉사단', description: '교통이 어려운 신자들의 이동을 지원하고, 본당 행사를 위한 안전한 차량 봉사를 제공하는 사도직 단체입니다.' },
    // 평신도협의회 하위
    '울뜨레야': { name: '울뜨레야', description: '꾸르실료 3박 4일 체험을 마친 신자들의 모임으로, “더 멀리 전진하라”는 뜻의 스페인어 Ultreya에서 유래했습니다. 본당 단체와 구역에서 봉사하며 신앙을 점검하고 실천하는 사도직 운동입니다.' },
    '꾸리아': { name: '꾸리아', description: '레지오 마리애의 중간 평의회로, 각 쁘레시디움 활동을 점검하고 성모님의 사도직 정신을 함께 나누며 복음화 사명을 실천합니다.' },
    'ME': { name: 'M.E', description: 'Marriage Encounter 부부 사도직으로, 주말 피정을 통해 부부가 사랑과 대화를 회복하고 가정을 복음화하도록 돕습니다.' },
    '연령회': { name: '연령회', description: '연령을 위한 기도와 장례 봉사를 맡아 상가를 방문해 연도를 봉헌하고, 유가족에게 위로와 도움을 전하는 평신도 단체입니다.' },
    '기쁨의샘 Cu.': { name: '기쁨의샘 Cu.', description: '레지오 마리애 기쁨의샘 꾸리아로, 본당 내 쁘레시디움들의 선교와 봉사를 지원하며 체계적인 활동을 이끄는 상급 평의회입니다.' }
  }
  return info[type] || { name: type, description: '' }
}

// JSON 파일 가져오기 (업로드)
export const importJSON = async <T>(file: File): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch (error) {
        reject(new Error('JSON 파일 형식이 올바르지 않습니다.'))
      }
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsText(file)
  })
}

export type StorageDatasetKey =
  | 'notices'
  | 'recruitments'
  | 'faqs'
  | 'albums'
  | 'massSchedule'
  | 'sacraments'
  | 'catechism'
  | 'bulletins'
  | 'organizationPosts'

export type BackupEntry = {
  id: string
  key: StorageDatasetKey
  label: string
  createdAt: string
  data: unknown
}

const datasetRegistry: Record<StorageDatasetKey, {
  label: string
  getter: () => Promise<unknown>
  saver: (data: any) => Promise<void>
}> = {
  notices: { label: '공지사항', getter: () => getNotices(), saver: saveNotices },
  recruitments: { label: '단체 소식', getter: () => getRecruitments(), saver: saveRecruitments },
  faqs: { label: '자주 묻는 질문', getter: () => getFAQs(), saver: saveFAQs },
  albums: { label: '성당 앨범', getter: () => getAlbums(), saver: saveAlbums },
  massSchedule: { label: '미사 시간표', getter: () => getMassSchedule(), saver: saveMassSchedule },
  sacraments: { label: '성사 안내', getter: () => getSacraments(), saver: saveSacraments },
  catechism: { label: '예비신자 교리', getter: () => getCatechismInfo(), saver: (data) => data ? saveCatechismInfo(data) : Promise.resolve() },
  bulletins: { label: '주보 안내', getter: () => getBulletins(), saver: saveBulletins },
  organizationPosts: { label: '단체 게시판', getter: () => getOrganizationPosts(), saver: saveOrganizationPosts }
}

// 백업 데이터를 서버에서 로드
const loadBackupsFromServer = async (): Promise<BackupEntry[]> => {
  try {
    const serverData = await loadDataFromServer<BackupEntry[]>('backups')
    if (serverData !== null) {
      return serverData
    }
  } catch (error) {
    console.warn('[loadBackupsFromServer] 백업 로드 실패:', error)
  }
  return []
}

// 백업 데이터를 서버에 저장 (최대 20개만 유지하여 용량 관리)
const saveBackupsToServer = async (backups: BackupEntry[]): Promise<boolean> => {
  try {
    // 최대 20개만 유지 (용량 관리)
    const limitedBackups = backups.slice(0, 20)
    const success = await saveDataToServer('backups', limitedBackups)
    if (success) {
      window.dispatchEvent(new CustomEvent('storageBackupUpdated'))
      return true
    }
  } catch (error) {
    console.warn('[saveBackupsToServer] 백업 저장 실패:', error)
  }
  return false
}

export const getBackups = (): BackupEntry[] => {
  return readBackups().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export const createBackup = (key: StorageDatasetKey): BackupEntry | null => {
  const registry = datasetRegistry[key]
  if (!registry) return null

  const data = registry.getter()
  const backup: BackupEntry = {
    id: `${key}-${Date.now()}`,
    key,
    label: registry.label,
    createdAt: new Date().toISOString(),
    data
  }

  const backups = [backup, ...readBackups()].slice(0, 20)
  writeBackups(backups)
  return backup
}

export const restoreBackup = async (backupId: string): Promise<boolean> => {
  const backups = await loadBackupsFromServer()
  const target = backups.find((entry) => entry.id === backupId)
  if (!target) return false

  const registry = datasetRegistry[target.key]
  if (!registry) return false

  await registry.saver(target.data)
  await createBackup(target.key) // 복원 전 상태를 백업으로 남기기 위해 새 백업 생성

  switch (target.key) {
    case 'notices':
      cachedData.notices = target.data as NoticeItem[]
      break
    case 'recruitments':
      cachedData.recruitments = target.data as RecruitmentItem[]
      break
    case 'faqs':
      cachedData.faqs = target.data as FAQItem[]
      break
    case 'albums':
      cachedData.albums = target.data as AlbumWithCategory[]
      break
    case 'massSchedule':
      cachedData.massSchedule = target.data as MassScheduleItem[]
      break
    case 'sacraments':
      cachedData.sacraments = target.data as SacramentItem[]
      break
    case 'catechism':
      cachedData.catechism = (target.data as CatechismInfo) ?? null
      break
    case 'bulletins':
      cachedData.bulletins = target.data as BulletinItem[]
      break
    case 'organizationPosts':
      cachedData.organizationPosts = target.data as OrganizationPost[]
      break
    default:
      break
  }

  if (target.key === 'catechism' && !target.data) {
    // localStorage는 더 이상 사용하지 않음
    cachedData.catechism = null
  }
  return true
}

export const deleteBackup = async (backupId: string): Promise<boolean> => {
  const backups = await loadBackupsFromServer()
  const filtered = backups.filter((entry) => entry.id !== backupId)
  const success = await saveBackupsToServer(filtered)
  return success && filtered.length < backups.length
}

