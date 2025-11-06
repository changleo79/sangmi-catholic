import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  getOrganizationInfo, 
  getOrganizationPosts, 
  getParentOrganization,
  getSubOrganizations,
  getOrganizationTypes,
  type OrganizationType,
  type ParentOrganizationType
} from '../utils/storage'

export default function OrganizationTree() {
  const [expandedOrgs, setExpandedOrgs] = useState<Set<ParentOrganizationType>>(new Set())
  
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

  const toggleExpand = (org: ParentOrganizationType) => {
    const newExpanded = new Set(expandedOrgs)
    if (newExpanded.has(org)) {
      newExpanded.delete(org)
    } else {
      newExpanded.add(org)
    }
    setExpandedOrgs(newExpanded)
  }

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
            상미성당의 단체 구조를 트리 형태로 확인하실 수 있습니다.
          </p>
        </div>

        {/* Tree View */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <div className="space-y-2">
              {parentOrganizations.map((parentOrg) => {
                const parentInfo = getOrganizationInfo(parentOrg)
                const subOrgs = getSubOrganizations(parentOrg)
                const parentPosts = getOrganizationPosts(parentOrg)
                const isExpanded = expandedOrgs.has(parentOrg)
                const hasSubOrgs = subOrgs.length > 0

                return (
                  <div key={parentOrg} className="border-l-2 border-gray-200 pl-4 md:pl-6">
                    {/* Parent Organization */}
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {hasSubOrgs && (
                          <button
                            onClick={() => toggleExpand(parentOrg)}
                            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                            aria-label={isExpanded ? '접기' : '펼치기'}
                          >
                            <svg 
                              className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                        {!hasSubOrgs && <div className="w-6"></div>}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900">{parentInfo.name}</h3>
                            <span className="text-xs text-gray-500">({parentPosts.length}개)</span>
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{parentInfo.description}</p>
                        </div>
                      </div>
                      <Link
                        to={`/organizations/${encodeURIComponent(parentOrg)}`}
                        className="ml-3 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-300 hover:scale-105 whitespace-nowrap flex-shrink-0"
                        style={{ backgroundColor: '#7B1F4B' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                      >
                        게시판
                      </Link>
                    </div>

                    {/* Sub Organizations */}
                    {hasSubOrgs && isExpanded && (
                      <div className="ml-6 md:ml-8 mt-2 space-y-2">
                        {subOrgs.map((subOrg, index) => {
                          const subInfo = getOrganizationInfo(subOrg)
                          const subPosts = getOrganizationPosts(subOrg)
                          const isLast = index === subOrgs.length - 1

                          return (
                            <div key={subOrg} className="relative">
                              {!isLast && (
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                              )}
                              <div className="flex items-center justify-between pl-6 py-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-gray-300 bg-white"></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-base md:text-lg font-semibold text-gray-800">{subInfo.name}</h4>
                                      <span className="text-xs text-gray-500">({subPosts.length}개)</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{subInfo.description}</p>
                                  </div>
                                </div>
                                <Link
                                  to={`/organizations/${encodeURIComponent(subOrg)}`}
                                  className="ml-3 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-all duration-300 hover:scale-105 whitespace-nowrap flex-shrink-0"
                                  style={{ backgroundColor: '#7B1F4B' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                                >
                                  게시판
                                </Link>
                              </div>
                            </div>
                          )
                        })}
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
  )
}

