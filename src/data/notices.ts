export type NoticeItem = {
  title: string
  date: string // YYYY-MM-DD
  summary?: string
  content?: string // 상세 내용
  imageUrl?: string // 이미지 URL (선택)
  linkUrl?: string // optional detail or PDF link
  isImportant?: boolean // 중요공지 여부
}

export const notices: NoticeItem[] = [
  { title: '연중 제32주일 미사 안내', date: '2025-11-02', summary: '주일 미사 시간은 변동 없이 진행됩니다.' },
  { title: '예비신자 교리반 개강 안내', date: '2025-11-09', summary: '다음 주부터 예비신자 교리반이 개강합니다. 문의 : 사무실' },
  { title: '성당 대청소 자원봉사', date: '2025-11-16', summary: '공동체 대청소에 함께해 주세요.' }
]

