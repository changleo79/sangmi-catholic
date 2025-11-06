import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrganizationTypes, type OrganizationType } from '../utils/storage'

interface PostWriteButtonProps {
  organization: OrganizationType
  className?: string
}

export default function PostWriteButton({ organization, className = '' }: PostWriteButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    isImportant: false
  })
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // localStorage에서 기존 게시글 가져오기
    const existingPosts = JSON.parse(localStorage.getItem('admin_organization_posts') || '[]')
    
    const newPost = {
      id: Date.now().toString(),
      organization: organization,
      title: formData.title,
      content: formData.content,
      date: new Date().toISOString().split('T')[0],
      author: formData.author || undefined,
      attachments: [],
      imageUrl: undefined,
      isImportant: formData.isImportant
    }
    
    existingPosts.unshift(newPost)
    localStorage.setItem('admin_organization_posts', JSON.stringify(existingPosts))
    
    // 데이터 새로고침을 위해 페이지 리로드
    alert('게시글이 등록되었습니다.')
    setShowModal(false)
    setFormData({ title: '', content: '', author: '', isImportant: false })
    window.location.reload()
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105 ${className}`}
        style={{ backgroundColor: '#7B1F4B' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
      >
        글쓰기
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">게시글 작성</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">작성자</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">중요 게시글</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: '#7B1F4B' }}
                >
                  등록
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-all duration-300 hover:bg-gray-50"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

