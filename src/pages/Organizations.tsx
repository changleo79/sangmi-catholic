import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  getOrganizationTypes, 
  getOrganizationInfo, 
  getOrganizationPosts, 
  getParentOrganization,
  getSubOrganizations,
  type OrganizationType,
  type ParentOrganizationType
} from '../utils/storage'

export default function Organizations() {
  const [refreshKey, setRefreshKey] = useState(0)
  const allOrganizations = getOrganizationTypes()
  
  // 상위 위원회만 필터링
  const parentOrganizations: ParentOrganizationType[] = [
    '총회장',
    '총무',
    '소공동체위원회',
    '전례위원회',
    '제분과위원회',
    '청소년위원회',
    '재정위원회',
    '평신도협의회'
  ]

  useEffect(() => {
    // 데이터 업데이트 이벤트 리스너
    const handleUpdate = () => {
      // 강제 리렌더링을 위해 refreshKey 업데이트
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
  const getPostsCount = (org: ParentOrganizationType | OrganizationType) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            성당 단체 소개
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            상미성당의 각 단체와 위원회를 소개합니다. 각 단체의 게시판에서 활동 소식을 확인하실 수 있습니다.
          </p>
          <div className="mt-6">
            <Link
              to="/organizations/tree"
              className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#7B1F4B' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
            >
              조직도 보기
            </Link>
          </div>
        </div>

        {/* Organizations by Parent */}
        <div className="space-y-12">
          {parentOrganizations.map((parentOrg) => {
            const parentInfo = getOrganizationInfo(parentOrg)
            const subOrgs = getSubOrganizations(parentOrg)
            const parentPostsCount = getPostsCount(parentOrg)
            const hasSubOrgs = subOrgs.length > 0

            return (
              <div key={`${parentOrg}-${refreshKey}`} className="bg-white rounded-2xl shadow-lg p-8">
                {/* Parent Organization Header */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{parentInfo.name}</h2>
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">{parentInfo.description}</p>
                    </div>
                    <Link
                      to={`/organizations/${encodeURIComponent(parentOrg)}`}
                      className="md:ml-4 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 whitespace-nowrap text-center md:text-left flex-shrink-0"
                      style={{ backgroundColor: '#7B1F4B' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                    >
                      게시판 보기 ({parentPostsCount})
                    </Link>
                  </div>
                </div>

                {/* Sub Organizations */}
                {hasSubOrgs && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">단체</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {subOrgs.map((subOrg) => {
                        const subInfo = getOrganizationInfo(subOrg)
                        const subPosts = getOrganizationPosts(subOrg)
                        const subPostsCount = getPostsCount(subOrg)
                        const recentPost = subPosts.length > 0 ? subPosts[0] : null

                        return (
                          <Link
                            key={`${subOrg}-${refreshKey}`}
                            to={`/organizations/${encodeURIComponent(subOrg)}`}
                            className="group bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-200 hover:border-catholic-logo/30 hover:-translate-y-1"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-catholic-logo transition-colors">
                                  {subInfo.name}
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                  {subInfo.description}
                                </p>
                              </div>
                            </div>
                            
                            {recentPost && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500 mb-1">최근 게시글</p>
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {recentPost.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{recentPost.date}</p>
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs text-catholic-logo font-medium">
                                게시판 보기 →
                              </span>
                              <span className="text-xs text-gray-500">
                                {subPostsCount}개
                              </span>
                            </div>
                          </Link>
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
  )
}

