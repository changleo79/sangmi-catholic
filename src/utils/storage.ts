// 로컬스토리지 데이터 관리 유틸리티

import { NoticeItem } from '../data/notices'
import type { Album, AlbumPhoto } from '../data/albums'

export type RecruitmentItem = {
  id: string
  title: string
  summary: string
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

// 공지사항 관리
const NOTICES_KEY = 'admin_notices'
const RECRUITMENTS_KEY = 'admin_recruitments'
const FAQS_KEY = 'admin_faqs'
const ALBUMS_KEY = 'admin_albums'
const MASS_SCHEDULE_KEY = 'admin_mass_schedule'
const SACRAMENTS_KEY = 'admin_sacraments'
const CATECHISM_KEY = 'admin_catechism'
const BULLETINS_KEY = 'admin_bulletins'

export const getNotices = (): NoticeItem[] => {
  const stored = localStorage.getItem(NOTICES_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  // 기본값 (기존 데이터 파일에서 가져옴)
  return []
}

export const saveNotices = (notices: NoticeItem[]): void => {
  localStorage.setItem(NOTICES_KEY, JSON.stringify(notices))
}

export const getRecruitments = (): RecruitmentItem[] => {
  const stored = localStorage.getItem(RECRUITMENTS_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export const saveRecruitments = (recruitments: RecruitmentItem[]): void => {
  localStorage.setItem(RECRUITMENTS_KEY, JSON.stringify(recruitments))
}

export const getFAQs = (): FAQItem[] => {
  const stored = localStorage.getItem(FAQS_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export const saveFAQs = (faqs: FAQItem[]): void => {
  localStorage.setItem(FAQS_KEY, JSON.stringify(faqs))
}

// 앨범 관리
export const getAlbums = (): AlbumWithCategory[] => {
  const stored = localStorage.getItem(ALBUMS_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    if (parsed.length > 0) {
      return parsed
    }
  }
  
  // 기본 앨범 데이터가 없으면 빈 배열 반환 (관리자가 추가할 수 있도록)
  return []
}

export const saveAlbums = (albums: AlbumWithCategory[]): void => {
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums))
}

export const getAlbumCategories = (): string[] => {
  return ['전체', '주일 미사', '행사', '전례', '공동체 활동', '기타']
}

// 미사 시간 관리
export const getMassSchedule = (): MassScheduleItem[] => {
  const stored = localStorage.getItem(MASS_SCHEDULE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export const saveMassSchedule = (schedule: MassScheduleItem[]): void => {
  localStorage.setItem(MASS_SCHEDULE_KEY, JSON.stringify(schedule))
}

// 성사 안내 관리
export const getSacraments = (): SacramentItem[] => {
  const stored = localStorage.getItem(SACRAMENTS_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export const saveSacraments = (sacraments: SacramentItem[]): void => {
  localStorage.setItem(SACRAMENTS_KEY, JSON.stringify(sacraments))
}

// 예비신자 교리학교 정보 관리
export const getCatechismInfo = (): CatechismInfo | null => {
  const stored = localStorage.getItem(CATECHISM_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return null
}

export const saveCatechismInfo = (info: CatechismInfo): void => {
  localStorage.setItem(CATECHISM_KEY, JSON.stringify(info))
}

// 주보 안내 관리
export const getBulletins = (): BulletinItem[] => {
  const stored = localStorage.getItem(BULLETINS_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return []
}

export const saveBulletins = (bulletins: BulletinItem[]): void => {
  localStorage.setItem(BULLETINS_KEY, JSON.stringify(bulletins))
}

// 초기 데이터 로드 (기존 데이터 파일과 동기화)
export const initializeData = (): void => {
  // 공지사항 초기화 (기존 데이터가 있으면 유지)
  const notices = getNotices()
  if (notices.length === 0) {
    // 기존 notices.ts의 데이터를 로드하려면 여기서 import
    // 현재는 빈 배열로 시작
  }
}

