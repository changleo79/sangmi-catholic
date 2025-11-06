// JSON 파일 및 로컬스토리지 데이터 관리 유틸리티
// 우선순위: JSON 파일 > localStorage > 기본값

import { NoticeItem } from '../data/notices'
import type { Album, AlbumPhoto } from '../data/albums'

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
  // 평신도협의회 하위
  | '울뜨레야'
  | '꾸리아'
  | 'ME'
  | '꾸르실료'

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
export const initializeData = async (): Promise<void> => {
  try {
    const [notices, recruitments, faqs, albums, massSchedule, sacraments, catechism, bulletins, organizationPosts] = await Promise.all([
      loadJSON<NoticeItem[]>('/data/notices.json', []),
      loadJSON<RecruitmentItem[]>('/data/recruitments.json', []),
      loadJSON<FAQItem[]>('/data/faqs.json', []),
      loadJSON<AlbumWithCategory[]>('/data/albums.json', []),
      loadJSON<MassScheduleItem[]>('/data/mass-schedule.json', []),
      loadJSON<SacramentItem[]>('/data/sacraments.json', []),
      loadJSON<CatechismInfo | null>('/data/catechism.json', null),
      loadJSON<BulletinItem[]>('/data/bulletins.json', []),
      loadJSON<OrganizationPost[]>('/data/organization-posts.json', [])
    ])
    
    cachedData = {
      notices,
      recruitments,
      faqs,
      albums,
      massSchedule,
      sacraments,
      catechism,
      bulletins,
      organizationPosts
    }
    
    // localStorage에 캐시 (오프라인 지원)
    if (notices.length > 0) localStorage.setItem(NOTICES_KEY, JSON.stringify(notices))
    if (recruitments.length > 0) localStorage.setItem(RECRUITMENTS_KEY, JSON.stringify(recruitments))
    if (faqs.length > 0) localStorage.setItem(FAQS_KEY, JSON.stringify(faqs))
    if (albums.length > 0) localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums))
    if (massSchedule.length > 0) localStorage.setItem(MASS_SCHEDULE_KEY, JSON.stringify(massSchedule))
    if (sacraments.length > 0) localStorage.setItem(SACRAMENTS_KEY, JSON.stringify(sacraments))
    if (catechism) localStorage.setItem(CATECHISM_KEY, JSON.stringify(catechism))
    if (bulletins.length > 0) localStorage.setItem(BULLETINS_KEY, JSON.stringify(bulletins))
    if (organizationPosts.length > 0) localStorage.setItem(ORGANIZATION_POSTS_KEY, JSON.stringify(organizationPosts))
  } catch (e) {
    console.error('데이터 초기화 실패:', e)
  }
}

export const getNotices = (): NoticeItem[] => {
  // 캐시된 데이터 우선
  if (cachedData.notices) return cachedData.notices
  
  // localStorage 확인
  const stored = localStorage.getItem(NOTICES_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }
  
  return []
}

export const saveNotices = (notices: NoticeItem[]): void => {
  // localStorage에 저장 (임시)
  localStorage.setItem(NOTICES_KEY, JSON.stringify(notices))
  // 캐시 업데이트
  cachedData.notices = notices
}

// JSON 파일 내보내기 (다운로드)
export const exportNotices = (): void => {
  const data = getNotices()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'notices.json'
  a.click()
  URL.revokeObjectURL(url)
}

export const getRecruitments = (): RecruitmentItem[] => {
  if (cachedData.recruitments) return cachedData.recruitments
  
  const stored = localStorage.getItem(RECRUITMENTS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }
  return []
}

export const saveRecruitments = (recruitments: RecruitmentItem[]): void => {
  localStorage.setItem(RECRUITMENTS_KEY, JSON.stringify(recruitments))
  cachedData.recruitments = recruitments
}

export const exportRecruitments = (): void => {
  const data = getRecruitments()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'recruitments.json'
  a.click()
  URL.revokeObjectURL(url)
}

export const getFAQs = (): FAQItem[] => {
  if (cachedData.faqs) return cachedData.faqs
  
  const stored = localStorage.getItem(FAQS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }
  return []
}

export const saveFAQs = (faqs: FAQItem[]): void => {
  localStorage.setItem(FAQS_KEY, JSON.stringify(faqs))
  cachedData.faqs = faqs
}

export const exportFAQs = (): void => {
  const data = getFAQs()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'faqs.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 앨범 관리
export const getAlbums = (): AlbumWithCategory[] => {
  if (cachedData.albums) return cachedData.albums
  
  const stored = localStorage.getItem(ALBUMS_KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      if (parsed.length > 0) {
        return parsed
      }
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }
  
  return []
}

export const saveAlbums = (albums: AlbumWithCategory[]): void => {
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums))
  cachedData.albums = albums
}

export const exportAlbums = (): void => {
  const data = getAlbums()
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

// 미사 시간 관리
export const getMassSchedule = (): MassScheduleItem[] => {
  if (cachedData.massSchedule) return cachedData.massSchedule
  
  const stored = localStorage.getItem(MASS_SCHEDULE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }
  return []
}

export const saveMassSchedule = (schedule: MassScheduleItem[]): void => {
  localStorage.setItem(MASS_SCHEDULE_KEY, JSON.stringify(schedule))
  cachedData.massSchedule = schedule
}

export const exportMassSchedule = (): void => {
  const data = getMassSchedule()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mass-schedule.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 성사 안내 관리
export const getSacraments = (): SacramentItem[] => {
  if (cachedData.sacraments) return cachedData.sacraments
  
  const stored = localStorage.getItem(SACRAMENTS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }
  return []
}

export const saveSacraments = (sacraments: SacramentItem[]): void => {
  localStorage.setItem(SACRAMENTS_KEY, JSON.stringify(sacraments))
  cachedData.sacraments = sacraments
}

export const exportSacraments = (): void => {
  const data = getSacraments()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'sacraments.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 예비신자 교리학교 정보 관리
export const getCatechismInfo = (): CatechismInfo | null => {
  if (cachedData.catechism !== undefined) return cachedData.catechism
  
  const stored = localStorage.getItem(CATECHISM_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }
  return null
}

export const saveCatechismInfo = (info: CatechismInfo): void => {
  localStorage.setItem(CATECHISM_KEY, JSON.stringify(info))
  cachedData.catechism = info
}

export const exportCatechismInfo = (): void => {
  const data = getCatechismInfo()
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
export const getBulletins = (): BulletinItem[] => {
  if (cachedData.bulletins) return cachedData.bulletins
  
  const stored = localStorage.getItem(BULLETINS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      // JSON 파싱 실패 시 무시
    }
  }
  return []
}

export const saveBulletins = (bulletins: BulletinItem[]): void => {
  localStorage.setItem(BULLETINS_KEY, JSON.stringify(bulletins))
  cachedData.bulletins = bulletins
}

export const exportBulletins = (): void => {
  const data = getBulletins()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'bulletins.json'
  a.click()
  URL.revokeObjectURL(url)
}

// 단체 게시글 관리
export const getOrganizationPosts = (organization?: OrganizationType): OrganizationPost[] => {
  // 전체 게시글 가져오기
  let allPosts: OrganizationPost[] = []
  
  if (cachedData.organizationPosts) {
    allPosts = cachedData.organizationPosts
  } else {
    const stored = localStorage.getItem(ORGANIZATION_POSTS_KEY)
    if (stored) {
      try {
        allPosts = JSON.parse(stored)
        // 캐시 업데이트
        cachedData.organizationPosts = allPosts
      } catch (e) {
        // JSON 파싱 실패 시 무시
      }
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

export const saveOrganizationPosts = (posts: OrganizationPost[]): void => {
  localStorage.setItem(ORGANIZATION_POSTS_KEY, JSON.stringify(posts))
  // 캐시 즉시 업데이트
  cachedData.organizationPosts = posts
  // 이벤트 발생하여 모든 컴포넌트에 알림
  window.dispatchEvent(new CustomEvent('organizationPostsUpdated'))
}

export const exportOrganizationPosts = (): void => {
  const data = getOrganizationPosts()
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
    // 평신도협의회 하위
    '울뜨레야',
    '꾸리아',
    'ME',
    '꾸르실료'
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
    '복사단자모회': '청소년위원회',
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
    // 평신도협의회 하위
    '울뜨레야': '평신도협의회',
    '꾸리아': '평신도협의회',
    'ME': '평신도협의회',
    '꾸르실료': '평신도협의회'
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
      name: '재정위원회',
      description: '본당의 재정 관리와 예산 편성 및 집행을 담당합니다. 헌금과 기부금 관리, 예산 수립 및 감사, 재정 보고 등을 통해 투명하고 책임감 있는 재정 운영을 합니다.'
    },
    '평신도협의회': {
      name: '평신도협의회',
      description: '평신도들의 의견을 수렴하고 본당 운영에 반영합니다. 평신도 사도직의 실현을 위해 신자들의 목소리를 대변하고, 본당의 주요 사안에 대해 협의하며 신자들의 적극적인 참여를 유도합니다.'
    },
    // 소공동체위원회 하위
    '1지역': { name: '1지역', description: '소공동체위원회 1지역입니다. 지역 내 신자들이 함께 모여 기도하고 나눔을 실천합니다.' },
    '2지역': { name: '2지역', description: '소공동체위원회 2지역입니다. 지역 내 신자들이 함께 모여 기도하고 나눔을 실천합니다.' },
    '3지역': { name: '3지역', description: '소공동체위원회 3지역입니다. 지역 내 신자들이 함께 모여 기도하고 나눔을 실천합니다.' },
    '4지역': { name: '4지역', description: '소공동체위원회 4지역입니다. 지역 내 신자들이 함께 모여 기도하고 나눔을 실천합니다.' },
    '5지역': { name: '5지역', description: '소공동체위원회 5지역입니다. 지역 내 신자들이 함께 모여 기도하고 나눔을 실천합니다.' },
    '6지역': { name: '6지역', description: '소공동체위원회 6지역입니다. 지역 내 신자들이 함께 모여 기도하고 나눔을 실천합니다.' },
    // 청소년위원회 하위
    '청년분과': { name: '청년분과', description: '청년 신자들의 신앙 성장과 공동체 활동을 지원하는 청소년위원회 소속 분과입니다.' },
    '초등부주일학교': { name: '초등부주일학교', description: '초등학생 신자들을 위한 주일학교입니다. 어린이들의 신앙 교육과 성경 공부를 담당합니다.' },
    '중고등부주일학교': { name: '중고등부주일학교', description: '중고등학생 신자들을 위한 주일학교입니다. 청소년들의 신앙 교육과 성경 공부를 담당합니다.' },
    '청년회': { name: '청년회', description: '청년 신자들의 모임으로, 신앙 공유와 친교 활동을 통해 청년들의 신앙 성장을 돕습니다.' },
    '자모회': { name: '자모회', description: '자녀를 둔 어머니들의 모임으로, 자녀 교육과 신앙 나눔을 통해 함께 성장합니다.' },
    '자부회': { name: '자부회', description: '자녀를 둔 아버지들의 모임으로, 자녀 교육과 신앙 나눔을 통해 함께 성장합니다.' },
    '복사단자모회': { name: '복사단자모회', description: '복사단 자녀를 둔 어머니들의 모임으로, 복사단 활동을 지원하고 함께 나눕니다.' },
    // 전례위원회 하위
    '해설/독서단': { name: '해설/독서단', description: '미사 중 성경 말씀을 읽고 해설하는 봉사자들로 구성된 전례위원회 소속 단체입니다.' },
    '성인복사단': { name: '성인복사단', description: '성인 신자들로 구성된 복사단으로, 미사 전례 봉사를 담당합니다.' },
    '어린이복사단': { name: '어린이복사단', description: '어린이 신자들로 구성된 복사단으로, 미사 전례 봉사를 담당합니다.' },
    '성가대': { name: '성가대', description: '미사와 전례 행사에서 찬미와 성가를 담당하는 전례위원회 소속 단체입니다.' },
    '제대회': { name: '제대회', description: '제대 봉사를 담당하는 전례위원회 소속 단체입니다.' },
    '헌화회': { name: '헌화회', description: '미사와 전례 행사에서 꽃 장식을 담당하는 전례위원회 소속 단체입니다.' },
    // 제분과위원회 하위
    '교육분과': { name: '교육분과', description: '신자들의 신앙 교육과 성경 공부를 담당하는 제분과위원회 소속 분과입니다.' },
    '선교분과': { name: '선교분과', description: '복음 전파와 선교 활동을 기획하고 실행하는 제분과위원회 소속 분과입니다.' },
    '홍보분과': { name: '홍보분과', description: '본당의 각종 행사와 소식을 홍보하는 제분과위원회 소속 분과입니다.' },
    '성소분과': { name: '성소분과', description: '사제와 수도자 성소를 지원하고 홍보하는 제분과위원회 소속 분과입니다.' },
    '사회복지분과': { name: '사회복지분과', description: '지역 사회 봉사와 복지 활동을 담당하는 제분과위원회 소속 분과입니다.' },
    '가정분과': { name: '가정분과', description: '가정의 신앙 생활과 가정 사목을 지원하는 제분과위원회 소속 분과입니다.' },
    // 평신도협의회 하위
    '울뜨레야': { name: '울뜨레야', description: '꾸리아를 마친 신자들이 정기적으로 모여 신앙을 나누고 격려하며 함께 성장하는 모임입니다. 꾸리아 정신을 지속적으로 실천하고 공동체 의식을 강화합니다.' },
    '꾸리아': { name: '꾸리아', description: '3일간의 집중적인 신앙 체험을 통해 그리스도 중심의 삶을 배우고 실천하는 평신도 사도직 단체입니다. 복음화와 사회 정의 실현을 위한 활동을 합니다.' },
    'ME': { name: 'ME', description: 'Marriage Encounter(부부 만남)의 약자로, 부부가 함께 모여 부부 관계와 가정의 신앙을 깊이 나누고 성장하는 모임입니다. 부부 사도직을 실천합니다.' },
    '꾸르실료': { name: '꾸르실료', description: 'Cursillo de Cristiandad(그리스도교 단기 강좌)로, 평신도들이 신앙을 깊이 배우고 실천하며 복음화 사도직을 수행하는 단체입니다.' }
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

