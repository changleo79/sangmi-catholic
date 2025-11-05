import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NoticeItem } from '../../data/notices'
import { getNotices, saveNotices } from '../../utils/storage'
import { notices as defaultNotices } from '../../data/notices'

export default function NoticesManage() {
  const navigate = useNavigate()
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<NoticeItem>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    summary: '',
    linkUrl: ''
  })

  useEffect(() => {
    loadNotices()
  }, [])

  const loadNotices = () => {
    const stored = getNotices()
    if (stored.length > 0) {
      setNotices(stored)
    } else {
      // 기본 데이터 로드
      setNotices(defaultNotices)
      saveNotices(defaultNotices)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newNotices = [...notices]
    
    if (editingIndex !== null) {
      newNotices[editingIndex] = formData
    } else {
      newNotices.unshift(formData)
    }
    
    setNotices(newNotices)
    saveNotices(newNotices)
    resetForm()
  }

  const handleEdit = (index: number) => {
    setFormData(notices[index])
    setEditingIndex(index)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (index: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newNotices = notices.filter((_, i) => i !== index)
      setNotices(newNotices)
      saveNotices(newNotices)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      linkUrl: ''
    })
    setIsEditing(false)
    setEditingIndex(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">공지사항 관리</h1>
              <div className="w-24 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
            </div>
            <Link
              to="/admin"
              className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              ← 대시보드
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isEditing ? '공지사항 수정' : '새 공지사항 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜 *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요약
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  링크 URL (선택)
                </label>
                <input
                  type="url"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  {isEditing ? '수정' : '추가'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">공지사항 목록</h2>
            <div className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">공지사항이 없습니다.</p>
              ) : (
                notices.map((notice, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-200 hover:border-catholic-logo/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">{notice.date}</p>
                        {notice.summary && (
                          <p className="text-sm text-gray-500">{notice.summary}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="px-3 py-1 rounded text-sm text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                          style={{ backgroundColor: '#7B1F4B' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-3 py-1 rounded text-sm bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

