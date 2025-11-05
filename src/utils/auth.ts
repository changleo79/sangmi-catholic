// 간단한 인증 유틸리티
// 실제 운영 시에는 서버 측 인증을 사용해야 합니다

const ADMIN_PASSWORD = 'sangmi2025' // 기본 비밀번호 (실제로는 환경 변수로 관리)

export const isAuthenticated = (): boolean => {
  const authToken = localStorage.getItem('admin_auth_token')
  const authTime = localStorage.getItem('admin_auth_time')
  
  if (!authToken || !authTime) {
    return false
  }
  
  // 24시간 후 자동 로그아웃
  const now = Date.now()
  const loginTime = parseInt(authTime, 10)
  const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60)
  
  if (hoursSinceLogin > 24) {
    logout()
    return false
  }
  
  return authToken === 'authenticated'
}

export const login = (password: string): boolean => {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem('admin_auth_token', 'authenticated')
    localStorage.setItem('admin_auth_time', Date.now().toString())
    return true
  }
  return false
}

export const logout = (): void => {
  localStorage.removeItem('admin_auth_token')
  localStorage.removeItem('admin_auth_time')
}

