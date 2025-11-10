import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  getOrganizationInfo, 
  getOrganizationPosts, 
  getSubOrganizations,
  type ParentOrganizationType
} from '../utils/storage'

export default function OrganizationTree() {
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // 데이터 업데이트 이벤트 리스너
    const handleUpdate = () => {
      setRefreshKey(prev => prev + 1)
    }
    
    // 페이지 포커스 시 데이터 다시 로드
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1)
    }
    
    window.addEventListener('organizationPostsUpdated', handleUpdate)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('organizationPostsUpdated', handleUpdate)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // refreshKey가 변경될 때마다 데이터를 다시 가져옴
  const getPostsCount = (org: string) => {
    // localStorage에서 직접 가져와서 정확한 카운트 계산
    const stored = localStorage.getItem('admin_organization_posts')
    if (!stored) return 0
    
    try {
      const allPosts: any[] = JSON.parse(stored)
      const directPosts = allPosts.filter((post: any) => post.organization === org)
      
      // 상위 위원회인 경우 하위 단체 게시글도 포함
      const subOrgs = getSubOrganizations(org as ParentOrganizationType)
      if (subOrgs.length > 0) {
        const subOrgPosts = subOrgs.flatMap(subOrg => 
          allPosts.filter((post: any) => post.organization === subOrg)
        )
        return directPosts.length + subOrgPosts.length
      }
      
      return directPosts.length
    } catch (e) {
      return 0
    }
  }

  const parentOrganizations: ParentOrganizationType[] = [
    '소공동체위원회',
    '전례위원회',
    '제분과위원회',
    '청소년위원회',
    '재정위원회',
    '평신도협의회'
  ]

  const mobileAccentStyles: Record<ParentOrganizationType, { primary: string; secondary: string; light: string }> = {
    '총회장': { primary: '#7B1F4B', secondary: '#5a1538', light: 'rgba(123, 31, 75, 0.16)' },
    '총무': { primary: '#7B1F4B', secondary: '#5a1538', light: 'rgba(123, 31, 75, 0.12)' },
    '소공동체위원회': { primary: '#4C9C84', secondary: '#327964', light: 'rgba(76, 156, 132, 0.16)' },
    '전례위원회': { primary: '#6A5ACD', secondary: '#4a3a9a', light: 'rgba(106, 90, 205, 0.16)' },
    '제분과위원회': { primary: '#A75F76', secondary: '#87415a', light: 'rgba(167, 95, 118, 0.16)' },
    '청소년위원회': { primary: '#5C6AC4', secondary: '#3f4aa8', light: 'rgba(92, 106, 196, 0.16)' },
    '재정위원회': { primary: '#D0864C', secondary: '#b5682f', light: 'rgba(208, 134, 76, 0.18)' },
    '평신도협의회': { primary: '#F28482', secondary: '#d36a66', light: 'rgba(242, 132, 130, 0.18)' }
  }

  const horizontalPadding = parentOrganizations.length > 0
    ? `${100 / (parentOrganizations.length * 2)}%`
    : '10%'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            단체 조직도
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            상미성당의 단체 구조를 조직도 형태로 확인하실 수 있습니다.
          </p>
        </div>

        {/* Mobile View - Optimized Tree */}
        <div className="md:hidden space-y-10">
          {/* 주임신부님 */}
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-white shadow-xl"
            style={{ background: 'linear-gradient(135deg, #7B1F4B 0%, #5a1538 100%)' }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.7), transparent 55%)' }}></div>
            <div className="relative flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/25 backdrop-blur">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">주임신부님</h2>
                <p className="text-sm text-white/80 leading-relaxed">
                  상미성당 공동체를 이끄는 영적 지도자입니다.
                </p>
              </div>
            </div>
          </div>

          {/* 총무 */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner" style={{ backgroundColor: 'rgba(123, 31, 75, 0.12)' }}>
                <svg className="w-6 h-6 text-catholic-logo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h9" />
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">게시글 {getPostsCount('총무')}개</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">총무</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  각 위원회 운영을 지원하고 전반적인 행정 업무를 담당합니다.
                </p>
                <Link
                  to={`/organizations/${encodeURIComponent('총무')}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-catholic-logo"
                >
                  총무 게시판 보기
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* 위원회 및 하위 단체 */}
          {parentOrganizations.map((org) => {
            const info = getOrganizationInfo(org)
            const postsCount = getPostsCount(org)
            const subOrgs = getSubOrganizations(org)
            const hasSubOrgs = subOrgs.length > 0
            const accent = mobileAccentStyles[org]

            return (
              <div
                key={`${org}-${refreshKey}`}
                className="group relative rounded-3xl border border-gray-100 bg-white shadow-xl overflow-hidden"
                style={{ background: `linear-gradient(180deg, ${accent.light}, rgba(255, 255, 255, 0.98))` }}
              >
              <div
                className="absolute inset-x-0 top-0 h-1.5"
                style={{ background: `linear-gradient(90deg, ${accent.primary}, ${accent.secondary})` }}
              ></div>
                <div className="p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-semibold text-lg shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${accent.primary}, ${accent.secondary})` }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{ backgroundColor: accent.light, color: accent.primary }}
                        >
                          위원회
                        </span>
                        <span className="text-xs text-gray-500">게시글 {postsCount}개</span>
                        {hasSubOrgs && (
                          <span className="text-xs font-semibold text-catholic-logo/80">단체 {subOrgs.length}개</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{info.name}</h3>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{info.description}</p>
                    </div>
                  </div>
                  <Link
                    to={`/organizations/${encodeURIComponent(org)}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-catholic-logo"
                  >
                    위원회 게시판 보기
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  {hasSubOrgs && (
                    <div className="mt-6 space-y-4">
                      {subOrgs.map((subOrg, idx) => {
                        const subInfo = getOrganizationInfo(subOrg)
                        const subPostsCount = getPostsCount(subOrg)
                        const isLast = idx === subOrgs.length - 1

                        return (
                          <div key={`${subOrg}-${refreshKey}`} className="relative pl-6">
                            {!isLast && (
                              <div
                                className="absolute left-[11px] top-5 border-l border-dashed"
                                style={{
                                  borderColor: accent.primary,
                                  height: 'calc(100% + 16px)'
                                }}
                              ></div>
                            )}
                            <div
                              className="absolute left-[7px] top-4 w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: accent.primary }}
                            ></div>
                            <Link
                              to={`/organizations/${encodeURIComponent(subOrg)}`}
                              className="block rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-catholic-logo/40 hover:shadow-lg"
                              style={{ borderColor: `${accent.primary}20` }}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900">{subInfo.name}</p>
                                  <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                                    {subInfo.description}
                                  </p>
                                </div>
                                <span className="text-xs font-semibold" style={{ color: accent.primary }}>
                                  {subPostsCount}개
                                </span>
                              </div>
                            </Link>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* PC View - Organization Chart */}
        <div className="hidden md:block max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Level 1: 주임신부님 */}
              <div className="flex justify-center mb-8">
                <div className="relative inline-block">
                  <div 
                    className="px-10 py-6 rounded-2xl shadow-xl text-center transform hover:scale-105 transition-transform duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, #7B1F4B 0%, #5a1538 100%)',
                      color: 'white',
                      boxShadow: '0 10px 30px rgba(123, 31, 75, 0.3)',
                      minWidth: '280px'
                    }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h2 className="text-2xl md:text-3xl font-bold">주임신부님</h2>
                    </div>
                    <p className="text-sm opacity-90 mt-2">상미성당</p>
                  </div>
                 </div>
               </div>
 
               {/* Level 2: 총회장 */}
              <div className="flex justify-center mb-6">
                <div className="relative inline-block">
                  <Link
                    to={`/organizations/${encodeURIComponent('총회장')}`}
                    className="block px-8 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center transform hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, #9B5A7B 0%, #8B4A6B 100%)',
                      color: 'white',
                      boxShadow: '0 8px 20px rgba(155, 90, 123, 0.3)',
                      minWidth: '220px'
                    }}
                  >
                    <h3 className="text-xl font-bold mb-1">총회장</h3>
                    <p className="text-sm opacity-90">
                      게시글 {getPostsCount('총회장')}개
                    </p>
                  </Link>
                 </div>
               </div>
 
               {/* Level 3: 총무 */}
              <div className="flex justify-center mb-6">
                <div className="relative inline-block">
                  <Link
                    to={`/organizations/${encodeURIComponent('총무')}`}
                    className="block px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center transform hover:scale-105 bg-white border-2 border-gray-200"
                    style={{ 
                      color: '#333',
                      boxShadow: '0 6px 15px rgba(0, 0, 0, 0.08)',
                      minWidth: '180px'
                    }}
                  >
                    <h4 className="text-lg font-bold mb-1 text-gray-900">총무</h4>
                    <p className="text-xs text-gray-600">
                      게시글 {getPostsCount('총무')}개
                    </p>
                  </Link>
                 </div>
               </div>
 
               {/* Level 4: 위원회들 */}
               <div className="relative mb-6 md:px-[90px]" style={{ paddingTop: '40px' }}>
                {/* 상단 연결선 제거 (요청에 따라 숨김) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" style={{ marginTop: '35px' }}>
                  {parentOrganizations.map((org) => {
                    const info = getOrganizationInfo(org)
                    const postsCount = getPostsCount(org)
                    const subOrgs = getSubOrganizations(org)
                    const hasSubOrgs = subOrgs.length > 0

                    return (
                      <div key={`${org}-${refreshKey}`} className="relative flex flex-col items-center w-full">
                        {/* 위쪽 연결선 제거 */}
                        
                        {/* Committee Box */}
                        <div className="relative w-full flex justify-center z-10">
                          <div className="relative" style={{ width: '180px' }}>
                            <Link
                              to={`/organizations/${encodeURIComponent(org)}`}
                              className="block px-4 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center bg-white border-2 border-gray-200 hover:border-catholic-logo transform hover:scale-105 w-full"
                              style={{ 
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                              }}
                            >
                              <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">{info.name}</h4>
                              <p className="text-xs text-gray-500 mb-1">게시글 {postsCount}개</p>
                              {hasSubOrgs && (
                                <p className="text-xs text-catholic-logo font-medium">단체 {subOrgs.length}개</p>
                              )}
                            </Link>
                            
                            {/* 위원회 박스에서 하위 단체로 내려가는 선 - 재정위원회는 단체가 없으므로 선 없음, PC만 표시 */}
                            {/* 요청에 따라 하위 연결선도 제거 */}
                          </div>
                        </div>

                        {/* Sub Organizations */}
                        {hasSubOrgs && (
                          <div className="mt-6 w-full relative">
                            <div className="space-y-2">
                              {subOrgs.map((subOrg) => {
                                const subInfo = getOrganizationInfo(subOrg)
                                const subPostsCount = getPostsCount(subOrg)

                                return (
                                  <div key={`${subOrg}-${refreshKey}`} className="relative flex justify-center">
                                    <div className="relative" style={{ width: '160px' }}>
                                      {/* 연결선 제거 */}
                                      
                                      <Link
                                        to={`/organizations/${encodeURIComponent(subOrg)}`}
                                        className="block px-3 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center bg-gray-50 border border-gray-200 hover:border-catholic-logo/50 transform hover:scale-105 w-full z-10 relative"
                                        style={{ 
                                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                                        }}
                                      >
                                        <span className="text-sm font-semibold text-gray-800 block">{subInfo.name}</span>
                                        <span className="text-xs text-gray-500">({subPostsCount})</span>
                                      </Link>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
