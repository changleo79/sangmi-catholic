import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getOrganizationPosts, getOrganizationInfo, saveOrganizationPosts, initializeData, type OrganizationPost, type OrganizationType, type AttachmentFile } from '../utils/storage'
import { isAuthenticated } from '../utils/auth'
import ShareButton from '../components/ShareButton'
import ImageLightbox from '../components/ImageLightbox'

export default function OrganizationPostDetail() {
  const { orgType, postId } = useParams<{ orgType: string; postId: string }>()
  const [post, setPost] = useState<OrganizationPost | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [formData, setFormData] = useState<OrganizationPost | null>(null)
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('url')
  const [attachmentInputType, setAttachmentInputType] = useState<'upload' | 'url'>('upload')
  const [isAuth, setIsAuth] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated()
      setIsAuth(auth)
    }
    checkAuth()
    // 인증 상태를 주기적으로 확인
    const interval = setInterval(checkAuth, 500)
    // storage 이벤트 리스너 추가 (다른 탭에서 로그인/로그아웃 시)
    window.addEventListener('storage', checkAuth)
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

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
              {isAuth && post && (
                <button
                  onClick={() => {
                    if (!post) return
                    setFormData({ ...post, attachments: post.attachments || [] })
                    if (post.imageUrl && post.imageUrl.startsWith('data:')) {
                      setImageInputType('upload')
                    } else {
                      setImageInputType('url')
                    }
                    if (post.attachments && post.attachments.length > 0) {
                      const hasBase64 = post.attachments.some(att => att.url.startsWith('data:'))
                      setAttachmentInputType(hasBase64 ? 'upload' : 'url')
                    }
                    setShowEditModal(true)
                  }}
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

      {/* Edit Modal */}
      {showEditModal && formData && post && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => {
          setShowEditModal(false)
          setFormData(null)
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">게시글 수정</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              if (!formData || !post) return
              
              const allPosts = getOrganizationPosts()
              const updatedPosts = allPosts.map(p => p.id === post.id ? { ...formData, id: post.id } : p)
              saveOrganizationPosts(updatedPosts)
              initializeData()
              
              // 게시글 업데이트
              const updatedPost = { ...formData, id: post.id }
              setPost(updatedPost)
              setShowEditModal(false)
              setFormData(null)
              window.dispatchEvent(new CustomEvent('organizationPostsUpdated'))
              alert('게시글이 수정되었습니다.')
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">내용 *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  rows={10}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">작성일 *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">작성자</label>
                <input
                  type="text"
                  value={formData.author || ''}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isImportant || false}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">중요 게시글</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">대표 이미지 (선택)</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="upload"
                      checked={imageInputType === 'upload'}
                      onChange={(e) => setImageInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">파일 업로드</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="imageInputType"
                      value="url"
                      checked={imageInputType === 'url'}
                      onChange={(e) => setImageInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">URL 입력</span>
                  </label>
                </div>

                {imageInputType === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string
                            setFormData({ ...formData, imageUrl: base64 })
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    />
                    {formData.imageUrl && formData.imageUrl.startsWith('data:') && (
                      <div className="mt-3 w-full max-w-md rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={formData.imageUrl} alt="이미지 미리보기" className="w-full h-auto object-contain" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={formData.imageUrl && !formData.imageUrl.startsWith('data:') ? formData.imageUrl : ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      placeholder="예: /images/post.jpg"
                    />
                    {formData.imageUrl && !formData.imageUrl.startsWith('data:') && formData.imageUrl.trim() !== '' && (
                      <div className="mt-3 w-full max-w-md rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={formData.imageUrl} alt="이미지 미리보기" className="w-full h-auto object-contain" onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E이미지 없음%3C/text%3E%3C/svg%3E'
                        }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">첨부파일</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attachmentInputType"
                      value="upload"
                      checked={attachmentInputType === 'upload'}
                      onChange={(e) => setAttachmentInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">파일 업로드</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="attachmentInputType"
                      value="url"
                      checked={attachmentInputType === 'url'}
                      onChange={(e) => setAttachmentInputType(e.target.value as 'upload' | 'url')}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">URL 입력</span>
                  </label>
                </div>

                {attachmentInputType === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files
                        if (files) {
                          const newAttachments: AttachmentFile[] = []
                          Array.from(files).forEach((file) => {
                            const reader = new FileReader()
                            reader.onload = (event) => {
                              const base64 = event.target?.result as string
                              const fileType = file.type.startsWith('image/') ? 'image' : 
                                            file.type === 'application/pdf' ? 'pdf' : 
                                            file.type.startsWith('text/') || file.type.includes('document') ? 'document' : 'other'
                              
                              newAttachments.push({
                                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                name: file.name,
                                url: base64,
                                type: fileType,
                                size: file.size
                              })

                              if (newAttachments.length === files.length) {
                                setFormData({
                                  ...formData,
                                  attachments: [...(formData.attachments || []), ...newAttachments]
                                })
                              }
                            }
                            reader.readAsDataURL(file)
                          })
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">💡 여러 파일을 선택할 수 있습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="파일 URL 입력"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const url = e.currentTarget.value
                          if (url.trim()) {
                            const fileType = url.includes('.pdf') ? 'pdf' : 
                                          url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 
                                          url.match(/\.(doc|docx|txt)$/i) ? 'document' : 'other'
                            const newAttachment: AttachmentFile = {
                              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                              name: url.split('/').pop() || '파일',
                              url: url,
                              type: fileType
                            }
                            setFormData({
                              ...formData,
                              attachments: [...(formData.attachments || []), newAttachment]
                            })
                            e.currentTarget.value = ''
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">💡 URL을 입력하고 Enter를 누르세요.</p>
                  </div>
                )}

                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="flex-1 text-sm text-gray-700 truncate">{attachment.name}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, attachments: (formData.attachments || []).filter(a => a.id !== attachment.id) })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#7B1F4B' }}
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-all duration-300 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

