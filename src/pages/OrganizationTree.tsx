import { Link } from 'react-router-dom'
import { 
  getOrganizationInfo, 
  getOrganizationPosts, 
  getSubOrganizations,
  type ParentOrganizationType
} from '../utils/storage'

export default function OrganizationTree() {
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
              {/* Level 1: 본당 주임신부님 */}
              <div className="flex justify-center mb-12">
                <div className="relative">
                  <div className="px-10 py-6 rounded-2xl shadow-xl text-center min-w-[280px] transform hover:scale-105 transition-transform duration-300"
                    style={{ 
                      background: 'linear-gradient(135deg, #7B1F4B 0%, #5a1538 100%)',
                      color: 'white',
                      boxShadow: '0 10px 30px rgba(123, 31, 75, 0.3)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h2 className="text-2xl md:text-3xl font-bold">본당 주임신부님</h2>
                    </div>
                    <p className="text-sm opacity-90 mt-2">상미성당</p>
                  </div>
                  {/* Vertical line down */}
                  <div className="absolute left-1/2 top-full w-1 h-12 bg-gradient-to-b from-gray-400 to-gray-300 transform -translate-x-1/2"></div>
                </div>
              </div>

              {/* Level 2: 총회장 */}
              <div className="flex justify-center mb-10">
                <div className="relative">
                  <Link
                    to={`/organizations/${encodeURIComponent('총회장')}`}
                    className="block px-8 py-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center min-w-[220px] transform hover:scale-105"
                    style={{ 
                      backgroundColor: '#7B1F4B', 
                      color: 'white',
                      boxShadow: '0 8px 20px rgba(123, 31, 75, 0.25)'
                    }}
                  >
                    <h3 className="text-xl font-bold mb-1">총회장</h3>
                    <p className="text-sm opacity-90">
                      게시글 {getOrganizationPosts('총회장').length}개
                    </p>
                  </Link>
                  {/* Vertical line down */}
                  <div className="absolute left-1/2 top-full w-1 h-10 bg-gradient-to-b from-gray-400 to-gray-300 transform -translate-x-1/2"></div>
                </div>
              </div>

              {/* Level 3: 총무 */}
              <div className="flex justify-center mb-12">
                <div className="relative">
                  <Link
                    to={`/organizations/${encodeURIComponent('총무')}`}
                    className="block px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center min-w-[180px] transform hover:scale-105"
                    style={{ 
                      backgroundColor: '#5a1538', 
                      color: 'white',
                      boxShadow: '0 6px 15px rgba(90, 21, 56, 0.25)'
                    }}
                  >
                    <h4 className="text-lg font-bold mb-1">총무</h4>
                    <p className="text-xs opacity-90">
                      게시글 {getOrganizationPosts('총무').length}개
                    </p>
                  </Link>
                  {/* Vertical line down */}
                  <div className="absolute left-1/2 top-full w-1 h-10 bg-gradient-to-b from-gray-400 to-gray-300 transform -translate-x-1/2"></div>
                </div>
              </div>

              {/* Level 4: 위원회들 - Horizontal line connecting all */}
              <div className="relative mb-8">
                {/* Main horizontal line */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mt-10">
                  {parentOrganizations.map((org, index) => {
                    const info = getOrganizationInfo(org)
                    const posts = getOrganizationPosts(org)
                    const subOrgs = getSubOrganizations(org)
                    const hasSubOrgs = subOrgs.length > 0

                    return (
                      <div key={org} className="relative flex flex-col items-center">
                        {/* Vertical line up */}
                        <div className="absolute left-1/2 -top-10 w-1 h-10 bg-gradient-to-b from-gray-300 to-gray-400 transform -translate-x-1/2"></div>
                        
                        {/* Committee Box */}
                        <div className="relative w-full">
                          <Link
                            to={`/organizations/${encodeURIComponent(org)}`}
                            className="block px-4 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center bg-white border-2 border-gray-200 hover:border-catholic-logo transform hover:scale-105"
                            style={{ 
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                            }}
                          >
                            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">{info.name}</h4>
                            <p className="text-xs text-gray-500 mb-1">게시글 {posts.length}개</p>
                            {hasSubOrgs && (
                              <p className="text-xs text-catholic-logo font-medium">단체 {subOrgs.length}개</p>
                            )}
                          </Link>

                          {/* Vertical line down if has sub-orgs */}
                          {hasSubOrgs && (
                            <div className="absolute left-1/2 top-full w-1 h-6 bg-gradient-to-b from-gray-300 to-gray-200 transform -translate-x-1/2"></div>
                          )}
                        </div>

                        {/* Sub Organizations */}
                        {hasSubOrgs && (
                          <div className="mt-6 w-full">
                            {/* Horizontal line connecting sub-orgs */}
                            <div className="absolute left-0 right-0 top-full mt-3 h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                            
                            <div className="space-y-2 pt-6">
                              {subOrgs.map((subOrg, subIndex) => {
                                const subInfo = getOrganizationInfo(subOrg)
                                const subPosts = getOrganizationPosts(subOrg)

                                return (
                                  <div key={subOrg} className="relative">
                                    {/* Vertical line up */}
                                    <div className="absolute left-1/2 -top-6 w-0.5 h-6 bg-gray-200 transform -translate-x-1/2"></div>
                                    
                                    <Link
                                      to={`/organizations/${encodeURIComponent(subOrg)}`}
                                      className="block px-3 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center bg-gray-50 border border-gray-200 hover:border-catholic-logo/50 transform hover:scale-105"
                                      style={{ 
                                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                                      }}
                                    >
                                      <span className="text-sm font-semibold text-gray-800 block">{subInfo.name}</span>
                                      <span className="text-xs text-gray-500">({subPosts.length})</span>
                                    </Link>
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
              <span className="text-sm font-medium text-gray-700">본당 주임신부님</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: '#7B1F4B' }}></div>
              <span className="text-sm font-medium text-gray-700">총회장</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg" style={{ backgroundColor: '#5a1538' }}></div>
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
