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

// 공지사항 관리
const NOTICES_KEY = 'admin_notices'
const RECRUITMENTS_KEY = 'admin_recruitments'
const FAQS_KEY = 'admin_faqs'

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
    return JSON.parse(stored)
  }
  return []
}

export const saveAlbums = (albums: AlbumWithCategory[]): void => {
  localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums))
}

export const getAlbumCategories = (): string[] => {
  return ['전체', '주일 미사', '행사', '전례', '공동체 활동', '기타']
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

