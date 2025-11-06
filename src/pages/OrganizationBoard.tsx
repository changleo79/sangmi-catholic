import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrganizationInfo, getOrganizationPosts, getOrganizationTypes, type OrganizationType, type OrganizationPost } from '../utils/storage'
import ShareButton from '../components/ShareButton'

export default function OrganizationBoard() {
  const { orgType } = useParams<{ orgType: string }>()
  const [posts, setPosts] = useState<OrganizationPost[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (orgType) {
      const decoded = decodeURIComponent(orgType)
      const orgPosts = getOrganizationPosts(decoded as OrganizationType)
      setPosts(orgPosts.sort((a, b) => {
        // 중요 게시글 우선, 그 다음 날짜순
        if (a.isImportant && !b.isImportant) return -1
        if (!a.isImportant && b.isImportant) return 1
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      }))
    }
  }, [orgType])

  if (!orgType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">단체를 찾을 수 없습니다.</p>
          <Link
            to="/organizations"
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#7B1F4B' }}
          >
            단체 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const decodedOrgType = decodeURIComponent(orgType) as OrganizationType
  const info = getOrganizationInfo(decodedOrgType)
  const displayedPosts = posts.slice(0, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/organizations"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-catholic-logo transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            단체 목록으로
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{info.name}</h1>
              <p className="text-gray-600 mb-4">{info.description}</p>
            </div>
            <ShareButton url={window.location.pathname} title={`${info.name} 게시판`} />
          </div>
          <div className="w-24 h-1.5 rounded-full mt-4" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <p className="text-gray-500 text-lg">아직 게시글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/organizations/${orgType}/posts/${post.id}`}
                className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-catholic-logo/30 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {post.isImportant && (
                        <span className="px-2 py-1 rounded text-xs font-semibold text-white" style={{ backgroundColor: '#7B1F4B' }}>
                          중요
                        </span>
                      )}
                      <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{post.date}</span>
                      {post.author && <span>작성자: {post.author}</span>}
                      {post.attachments && post.attachments.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a2 2 0 000-2.828l-6.414-6.414a2 2 0 10-2.828 2.828L15.172 7z" />
                          </svg>
                          첨부파일 {post.attachments.length}개
                        </span>
                      )}
                    </div>
                  </div>
                  {post.imageUrl && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}

            {posts.length > currentPage * itemsPerPage && (
              <div className="text-center pt-6">
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  더보기 ({posts.length - currentPage * itemsPerPage}개 더)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

