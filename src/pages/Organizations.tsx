import { Link } from 'react-router-dom'
import { getOrganizationTypes, getOrganizationInfo, getOrganizationPosts, type OrganizationType } from '../utils/storage'

export default function Organizations() {
  const organizations = getOrganizationTypes()

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
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {organizations.map((orgType) => {
            const info = getOrganizationInfo(orgType)
            const posts = getOrganizationPosts(orgType)
            const recentPost = posts.length > 0 ? posts[0] : null

            return (
              <Link
                key={orgType}
                to={`/organizations/${encodeURIComponent(orgType)}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-2"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-catholic-logo transition-colors">
                      {info.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {info.description}
                    </p>
                  </div>
                </div>
                
                {recentPost && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">최근 게시글</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {recentPost.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{recentPost.date}</p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-catholic-logo font-medium">
                    게시판 보기 →
                  </span>
                  <span className="text-xs text-gray-500">
                    게시글 {posts.length}개
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

