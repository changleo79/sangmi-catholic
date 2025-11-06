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

        {/* Organization Chart */}
        <div className="max-w-7xl mx-auto">
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
                  {/* Vertical line down - 정확히 박스 중앙, PC만 표시 */}
                  <div 
                    className="absolute w-0.5 h-8 bg-gray-400 hidden md:block"
                    style={{ 
                      left: '50%',
                      top: '100%',
                      transform: 'translateX(-50%)',
                      marginTop: '0'
                    }}
                  ></div>
                </div>
              </div>

              {/* Level 2: 총회장 */}
              <div className="flex justify-center mb-8">
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
                  {/* Vertical line down - 정확히 박스 중앙, PC만 표시 */}
                  <div 
                    className="absolute w-0.5 h-8 bg-gray-400 hidden md:block"
                    style={{ 
                      left: '50%',
                      top: '100%',
                      transform: 'translateX(-50%)',
                      marginTop: '0'
                    }}
                  ></div>
                </div>
              </div>

              {/* Level 3: 총무 */}
              <div className="flex justify-center mb-12">
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
                  {/* Vertical line down - 가로선에 정확히 맞추기, PC만 표시 */}
                  <div 
                    className="absolute w-0.5 bg-gray-400 hidden md:block"
                    style={{ 
                      left: 'calc(50% - 0.25px)',
                      top: '100%',
                      height: '80px',
                      marginTop: '0'
                    }}
                  ></div>
                </div>
              </div>

              {/* Level 4: 위원회들 */}
              <div className="relative mb-8">
                {/* Main horizontal line connecting all committees - PC만 표시 */}
                <div 
                  className="absolute h-0.5 bg-gray-400 z-10 hidden md:block"
                  style={{ 
                    top: '0',
                    left: '10%',
                    right: '10%'
                  }}
                ></div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6" style={{ marginTop: '110px' }}>
                  {parentOrganizations.map((org) => {
                    const info = getOrganizationInfo(org)
                    const postsCount = getPostsCount(org)
                    const subOrgs = getSubOrganizations(org)
                    const hasSubOrgs = subOrgs.length > 0

                    return (
                      <div key={`${org}-${refreshKey}`} className="relative flex flex-col items-center w-full">
                        {/* Vertical line up to horizontal line - 가로선에 정확히 연결 */}
                        <div 
                          className="absolute w-0.5 bg-gray-400 z-0 hidden md:block"
                          style={{ 
                            left: 'calc(50% - 0.25px)',
                            top: '0',
                            height: '110px'
                          }}
                        ></div>
                        
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
                                      {/* Vertical line up - 정확히 박스 중앙, PC만 표시 */}
                                      <div 
                                        className="absolute w-0.5 h-6 bg-gray-300 z-0 hidden md:block"
                                        style={{ 
                                          left: 'calc(50% - 0.25px)',
                                          top: '-24px'
                                        }}
                                      ></div>
                                      
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

        {/* Legend */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-4 bg-white rounded-xl shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg" style={{ background: 'linear-gradient(135deg, #7B1F4B 0%, #5a1538 100%)' }}></div>
              <span className="text-sm font-medium text-gray-700">주임신부님</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg" style={{ background: 'linear-gradient(135deg, #8B4A6B 0%, #7B1F4B 100%)' }}></div>
              <span className="text-sm font-medium text-gray-700">총회장</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg" style={{ background: 'linear-gradient(135deg, #6B3A5B 0%, #5a1538 100%)' }}></div>
              <span className="text-sm font-medium text-gray-700">총무</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg border-2 border-gray-200 bg-white"></div>
              <span className="text-sm font-medium text-gray-700">위원회</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-gray-50 border border-gray-200"></div>
              <span className="text-sm font-medium text-gray-700">단체</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
