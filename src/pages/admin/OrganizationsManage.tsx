import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  getOrganizationPosts, 
  saveOrganizationPosts, 
  exportOrganizationPosts, 
  importJSON, 
  initializeData,
  getOrganizationTypes,
  getOrganizationInfo,
  type OrganizationPost,
  type OrganizationType,
  type AttachmentFile
} from '../../utils/storage'

export default function OrganizationsManage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [posts, setPosts] = useState<OrganizationPost[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<OrganizationPost>({
    id: '',
    organization: '총회장',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    attachments: [],
    imageUrl: '',
    isImportant: false
  })
  const [imageInputType, setImageInputType] = useState<'upload' | 'url'>('url')
  const [attachmentInputType, setAttachmentInputType] = useState<'upload' | 'url'>('upload')

  useEffect(() => {
    loadPosts()
    
    // URL 쿼리 파라미터에서 edit ID 확인
    const editId = searchParams.get('edit')
    if (editId) {
      const allPosts = getOrganizationPosts()
      const postToEdit = allPosts.find(p => p.id === editId)
      if (postToEdit) {
        handleEdit(postToEdit)
      }
    }
  }, [searchParams])

  const loadPosts = () => {
    const stored = getOrganizationPosts()
    setPosts(stored.sort((a, b) => {
      if (a.isImportant && !b.isImportant) return -1
      if (!a.isImportant && b.isImportant) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPosts = [...posts]
    
    if (editingId) {
      const index = newPosts.findIndex(p => p.id === editingId)
      if (index !== -1) {
        newPosts[index] = { ...formData, id: editingId }
      }
    } else {
      const newPost: OrganizationPost = {
        ...formData,
        id: Date.now().toString()
      }
      newPosts.unshift(newPost)
    }
    
    setPosts(newPosts)
    saveOrganizationPosts(newPosts)
    initializeData()
    
    // 수정 완료 후 원래 페이지로 돌아가기 (URL에 returnTo가 있는 경우)
    const returnTo = searchParams.get('returnTo')
    if (returnTo && editingId) {
      resetForm()
      navigate(decodeURIComponent(returnTo))
      return
    }
    
    resetForm()
  }

  const handleEdit = (post: OrganizationPost) => {
    setFormData({
      ...post,
      attachments: post.attachments || []
    })
    setIsEditing(true)
    setEditingId(post.id)
    if (post.imageUrl && post.imageUrl.startsWith('data:')) {
      setImageInputType('upload')
    } else {
      setImageInputType('url')
    }
    // 첨부파일 입력 타입 설정
    if (post.attachments && post.attachments.length > 0) {
      const hasBase64 = post.attachments.some(att => att.url.startsWith('data:'))
      setAttachmentInputType(hasBase64 ? 'upload' : 'url')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newPosts = posts.filter(p => p.id !== id)
      setPosts(newPosts)
      saveOrganizationPosts(newPosts)
      initializeData()
    }
  }

  const resetForm = () => {
    setFormData({
      id: '',
      organization: '총회장',
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      author: '',
      attachments: [],
      imageUrl: '',
      isImportant: false
    })
    setIsEditing(false)
    setEditingId(null)
    setImageInputType('url')
  }

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        setFormData({ ...formData, imageUrl: base64 })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAttachmentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const handleRemoveAttachment = (id: string) => {
    setFormData({
      ...formData,
      attachments: (formData.attachments || []).filter(a => a.id !== id)
    })
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const data = await importJSON<OrganizationPost[]>(file)
        setPosts(data)
        saveOrganizationPosts(data)
        await initializeData()
        alert('데이터를 성공적으로 가져왔습니다.')
      } catch (error) {
        alert('데이터 가져오기 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류'))
      }
    }
  }

  const handleExport = () => {
    exportOrganizationPosts()
  }

  const getPostsByOrganization = (org: OrganizationType) => {
    return posts.filter(p => p.organization === org)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-catholic-logo transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            관리자 대시보드로
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">단체 게시판 관리</h1>
              <div className="w-24 h-1.5 rounded-full mt-4" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
            </div>
            <div className="flex gap-3">
              <label className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 cursor-pointer" style={{ backgroundColor: '#7B1F4B' }}>
                JSON 가져오기
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
              <button
                onClick={handleExport}
                className="px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#7B1F4B' }}
              >
                JSON 내보내기
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isEditing ? '게시글 수정' : '새 게시글 작성'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">단체 *</label>
                  <select
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value as OrganizationType })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    required
                  >
                    {getOrganizationTypes().map(org => (
                      <option key={org} value={org}>{org}</option>
                    ))}
                  </select>
                </div>

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
                    rows={8}
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
                        onChange={handleImageFileUpload}
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
                        onChange={handleAttachmentFileUpload}
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
                            onClick={() => handleRemoveAttachment(attachment.id)}
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
                    {isEditing ? '수정' : '등록'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-all duration-300 hover:bg-gray-50"
                    >
                      취소
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Posts List */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {getOrganizationTypes().map((org) => {
                const orgPosts = getPostsByOrganization(org)
                if (orgPosts.length === 0) return null

                return (
                  <div key={org} className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)', color: '#7B1F4B' }}>
                        {org}
                      </span>
                      <span className="text-sm text-gray-500">({orgPosts.length}개)</span>
                    </h3>
                    <div className="space-y-3">
                      {orgPosts.map((post) => (
                        <div
                          key={post.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-catholic-logo/30 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {post.isImportant && (
                                <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: '#7B1F4B' }}>
                                  중요
                                </span>
                              )}
                              <h4 className="font-bold text-gray-900 truncate">{post.title}</h4>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{post.content}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span>{post.date}</span>
                              {post.author && <span>작성자: {post.author}</span>}
                              {post.attachments && post.attachments.length > 0 && (
                                <span>첨부파일 {post.attachments.length}개</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(post)}
                              className="px-3 py-1 rounded text-sm text-white transition-all duration-300 hover:scale-105"
                              style={{ backgroundColor: '#7B1F4B' }}
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="px-3 py-1 rounded text-sm text-red-600 border border-red-600 hover:bg-red-50 transition-all duration-300"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {posts.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                  <p className="text-gray-500 text-lg">아직 게시글이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

