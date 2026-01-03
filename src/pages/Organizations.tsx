import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  getOrganizationTypes, 
  getOrganizationInfo, 
  getParentOrganization,
  getSubOrganizations,
  type OrganizationType,
  type ParentOrganizationType
} from '../utils/storage'

export default function Organizations() {
  const [selectedCategory, setSelectedCategory] = useState<ParentOrganizationType | '전체'>('전체')

  const allOrganizations = getOrganizationTypes()
  const parentOrganizations: ParentOrganizationType[] = [
    '소공동체위원회',
    '전례위원회',
    '제분과위원회',
    '청소년위원회',
    '재정위원회',
    '평신도협의회'
  ]

  const filteredOrganizations = selectedCategory === '전체'
    ? allOrganizations.filter(org => {
        const parent = getParentOrganization(org)
        return parent !== null // 하위 단체만 표시
      })
    : getSubOrganizations(selectedCategory)

  const categoryColors: Record<ParentOrganizationType, { bg: string; text: string; border: string }> = {
    '소공동체위원회': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    '전례위원회': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    '제분과위원회': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    '청소년위원회': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    '재정위원회': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    '평신도협의회': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    '총회장': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
    '총무': { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            본당단체 안내
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            상미성당의 위원회와 단체를 소개합니다. 각 단체의 역할과 활동을 확인하실 수 있습니다.
          </p>
        </div>

        {/* Links to Organization Tree and Jurisdiction */}
        <div className="mb-12 text-center flex flex-wrap justify-center gap-4">
          <Link
            to="/organizations/tree"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg"
            style={{ backgroundColor: '#7B1F4B' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-3-3v6m-9 4h18" />
            </svg>
            조직도 보기
          </Link>
          <Link
            to="/jurisdiction"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg"
            style={{ backgroundColor: '#7B1F4B' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            관할구역 보기
          </Link>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('전체')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                selectedCategory === '전체'
                  ? 'bg-catholic-logo text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-catholic-logo/30'
              }`}
            >
              전체
            </button>
            {parentOrganizations.map((org) => {
              const colors = categoryColors[org]
              return (
                <button
                  key={org}
                  onClick={() => setSelectedCategory(org)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedCategory === org
                      ? `${colors.bg} ${colors.text} border-2 ${colors.border} shadow-lg scale-105`
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-catholic-logo/30'
                  }`}
                >
                  {org}
                </button>
              )
            })}
          </div>
        </div>

        {/* Organizations List */}
        <div className="max-w-6xl mx-auto">
          {selectedCategory === '전체' ? (
            <div className="space-y-8">
              {parentOrganizations.map((parentOrg) => {
                const subOrgs = getSubOrganizations(parentOrg).filter(org => org !== parentOrg) // 자기 자신 제외
                const colors = categoryColors[parentOrg]
                
                return (
                  <div key={parentOrg} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className={`px-6 py-4 ${colors.bg} border-b ${colors.border}`}>
                      <h2 className={`text-2xl font-bold ${colors.text}`}>{parentOrg}</h2>
                      <p className={`text-sm ${colors.text} opacity-80 mt-1`}>
                        {getOrganizationInfo(parentOrg).description}
                      </p>
                    </div>
                    <div className="p-6">
                      {subOrgs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {subOrgs.map((org) => {
                            const info = getOrganizationInfo(org)
                            return (
                              <div
                                key={org}
                                className="p-4 rounded-xl border border-gray-200 hover:border-catholic-logo/30 hover:shadow-md transition-all duration-300"
                              >
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.name}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{info.description}</p>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">하위 단체가 없습니다.</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizations.map((org) => {
                const info = getOrganizationInfo(org)
                const colors = categoryColors[selectedCategory]
                
                return (
                  <div
                    key={org}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${colors.bg} ${colors.text}`}>
                      {selectedCategory}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{info.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{info.description}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

