import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getOrganizationPosts, getOrganizationInfo, type OrganizationPost, type OrganizationType } from '../utils/storage'
import { isAuthenticated } from '../utils/auth'
import ShareButton from '../components/ShareButton'
import ImageLightbox from '../components/ImageLightbox'

export default function OrganizationPostDetail() {
  const { orgType, postId } = useParams<{ orgType: string; postId: string }>()
  const [post, setPost] = useState<OrganizationPost | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (orgType && postId) {
      // 전체 게시글 목록에서 찾기 (organization 필터 없이)
      const allPosts = getOrganizationPosts()
      const found = allPosts.find(p => p.id === postId)
      
      if (found) {
        setPost(found)
      } else {
        // localStorage에서 직접 찾기 (캐시 문제 대비)
        const stored = localStorage.getItem('admin_organization_posts')
        if (stored) {
          try {
            const posts: OrganizationPost[] = JSON.parse(stored)
            const foundPost = posts.find(p => p.id === postId)
            if (foundPost) {
              setPost(foundPost)
            }
          } catch (e) {
            console.error('Failed to parse organization posts:', e)
          }
        }
      }
    }
  }, [orgType, postId])

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">게시글을 찾을 수 없습니다.</p>
          <Link
            to={orgType ? `/organizations/${orgType}` : '/organizations'}
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#7B1F4B' }}
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const orgInfo = getOrganizationInfo(post.organization)

  const handleAttachmentClick = (attachment: { url: string; type: string; name: string }) => {
    if (attachment.type === 'image') {
      setLightboxImage(attachment.url)
    } else if (attachment.type === 'pdf') {
      if (attachment.url.startsWith('data:')) {
        // Base64 PDF
        const newWindow = window.open()
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>${attachment.name}</title></head>
              <body style="margin:0; padding:0;">
                <embed src="${attachment.url}" type="application/pdf" width="100%" height="100%" style="position:absolute; top:0; left:0;" />
              </body>
            </html>
          `)
        }
      } else {
        window.open(attachment.url, '_blank')
      }
    } else {
      window.open(attachment.url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to={`/organizations/${orgType}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-catholic-logo transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {orgInfo.name} 게시판으로
          </Link>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)', color: '#7B1F4B' }}>
                  {orgInfo.name}
                </span>
                {post.isImportant && (
                  <span className="px-2 py-1 rounded text-xs font-semibold text-white" style={{ backgroundColor: '#7B1F4B' }}>
                    중요
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{post.title}</h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>{post.date}</span>
                {post.author && <span>작성자: {post.author}</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated() && (
                <button
                  onClick={() => navigate(`/admin/organizations?edit=${post.id}&returnTo=${encodeURIComponent(window.location.pathname)}`)}
                  className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  수정
                </button>
              )}
              <ShareButton url={window.location.pathname} title={post.title} description={post.content.substring(0, 100)} />
            </div>
          </div>
          <div className="w-24 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* 대표 이미지 */}
          {post.imageUrl && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-auto object-contain cursor-pointer"
                onClick={() => setLightboxImage(post.imageUrl || null)}
              />
            </div>
          )}

          {/* 본문 내용 */}
          <div className="prose prose-lg max-w-none mb-8">
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">{post.content}</div>
          </div>

          {/* 첨부파일 */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">첨부파일</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {post.attachments.map((attachment) => (
                  <button
                    key={attachment.id}
                    onClick={() => handleAttachmentClick(attachment)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-catholic-logo/30 hover:bg-gray-50 transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      attachment.type === 'image' ? 'bg-blue-100 text-blue-600' :
                      attachment.type === 'pdf' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {attachment.type === 'image' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      ) : attachment.type === 'pdf' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{attachment.name}</p>
                      {attachment.size && (
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          isOpen={!!lightboxImage}
          imageSrc={lightboxImage}
          imageAlt={post.title}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  )
}

