import { Link } from 'react-router-dom'
import { 
  getOrganizationInfo, 
  getOrganizationPosts, 
  getParentOrganization,
  getSubOrganizations,
  type OrganizationType,
  type ParentOrganizationType
} from '../utils/storage'

export default function OrganizationTree() {
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 overflow-x-auto">
            {/* Top Level - 총회장 */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Link
                  to={`/organizations/${encodeURIComponent('총회장')}`}
                  className="block px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center min-w-[200px]"
                  style={{ backgroundColor: '#7B1F4B', color: 'white' }}
                >
                  <h2 className="text-xl font-bold">총회장</h2>
                  <p className="text-sm mt-1 opacity-90">
                    {getOrganizationPosts('총회장').length}개
                  </p>
                </Link>
                {/* Vertical line down */}
                <div className="absolute left-1/2 top-full w-0.5 h-8 bg-gray-300"></div>
              </div>
            </div>

            {/* Second Level - 총무 */}
            <div className="flex justify-center mb-12">
              <div className="relative">
                <Link
                  to={`/organizations/${encodeURIComponent('총무')}`}
                  className="block px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center min-w-[150px]"
                  style={{ backgroundColor: '#5a1538', color: 'white' }}
                >
                  <h3 className="text-lg font-bold">총무</h3>
                  <p className="text-xs mt-1 opacity-90">
                    {getOrganizationPosts('총무').length}개
                  </p>
                </Link>
                {/* Vertical line down */}
                <div className="absolute left-1/2 top-full w-0.5 h-8 bg-gray-300"></div>
              </div>
            </div>

            {/* Third Level - 위원회들 */}
            <div className="relative">
              {/* Horizontal line connecting all committees */}
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-gray-300"></div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8">
                {parentOrganizations.filter(org => org !== '총회장' && org !== '총무').map((org, index) => {
                  const info = getOrganizationInfo(org)
                  const posts = getOrganizationPosts(org)
                  const subOrgs = getSubOrganizations(org)
                  const hasSubOrgs = subOrgs.length > 0

                  return (
                    <div key={org} className="relative">
                      {/* Vertical line up */}
                      <div className="absolute left-1/2 -top-8 w-0.5 h-8 bg-gray-300"></div>
                      
                      {/* Committee Box */}
                      <div className="relative">
                        <Link
                          to={`/organizations/${encodeURIComponent(org)}`}
                          className="block px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-center bg-white border-2 border-gray-200 hover:border-catholic-logo"
                        >
                          <h4 className="text-base md:text-lg font-bold text-gray-900">{info.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{posts.length}개</p>
                        </Link>

                        {/* Vertical line down if has sub-orgs */}
                        {hasSubOrgs && (
                          <div className="absolute left-1/2 top-full w-0.5 h-6 bg-gray-300"></div>
                        )}
                      </div>

                      {/* Sub Organizations */}
                      {hasSubOrgs && (
                        <div className="mt-6 space-y-2">
                          {/* Horizontal line connecting sub-orgs */}
                          <div className="absolute left-0 right-0 top-full mt-3 h-0.5 bg-gray-300"></div>
                          
                          <div className="grid grid-cols-1 gap-2 pt-6">
                            {subOrgs.map((subOrg, subIndex) => {
                              const subInfo = getOrganizationInfo(subOrg)
                              const subPosts = getOrganizationPosts(subOrg)
                              const isLast = subIndex === subOrgs.length - 1

                              return (
                                <div key={subOrg} className="relative">
                                  {/* Vertical line up */}
                                  <div className="absolute left-1/2 -top-6 w-0.5 h-6 bg-gray-300"></div>
                                  
                                  <Link
                                    to={`/organizations/${encodeURIComponent(subOrg)}`}
                                    className="block px-3 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-300 text-center bg-gray-50 border border-gray-200 hover:border-catholic-logo/50 text-sm"
                                  >
                                    <span className="font-semibold text-gray-800">{subInfo.name}</span>
                                    <span className="text-xs text-gray-500 ml-1">({subPosts.length})</span>
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

        {/* Legend */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white rounded-lg shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7B1F4B' }}></div>
              <span className="text-sm text-gray-700">총회장</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5a1538' }}></div>
              <span className="text-sm text-gray-700">총무</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-200"></div>
              <span className="text-sm text-gray-700">위원회</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200"></div>
              <span className="text-sm text-gray-700">단체</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
