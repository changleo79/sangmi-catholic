import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RecruitmentItem, getRecruitments, saveRecruitments } from '../../utils/storage'

export default function RecruitmentsManage() {
  const [recruitments, setRecruitments] = useState<RecruitmentItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<RecruitmentItem>({
    id: '',
    title: '',
    summary: '',
    content: ''
  })

  useEffect(() => {
    loadRecruitments()
  }, [])

  const loadRecruitments = () => {
    const stored = getRecruitments()
    if (stored.length > 0) {
      setRecruitments(stored)
    } else {
      // 기본 데이터
      const defaultData: RecruitmentItem[] = [
        { id: '1', title: '전례 성가단 단원 모집', summary: '주일 11시 미사 전례 성가단 단원 모집' },
        { id: '2', title: '주일학교 교사 모집', summary: '신앙으로 아이들을 함께 돌보실 교사 모집' }
      ]
      setRecruitments(defaultData)
      saveRecruitments(defaultData)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newRecruitments = [...recruitments]
    
    if (editingId) {
      const index = newRecruitments.findIndex(r => r.id === editingId)
      if (index !== -1) {
        newRecruitments[index] = formData
      }
    } else {
      const newId = Date.now().toString()
      newRecruitments.unshift({ ...formData, id: newId })
    }
    
    setRecruitments(newRecruitments)
    saveRecruitments(newRecruitments)
    resetForm()
  }

  const handleEdit = (item: RecruitmentItem) => {
    setFormData(item)
    setEditingId(item.id)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newRecruitments = recruitments.filter(r => r.id !== id)
      setRecruitments(newRecruitments)
      saveRecruitments(newRecruitments)
    }
  }

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      summary: '',
      content: ''
    })
    setIsEditing(false)
    setEditingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">단체 소식 관리</h1>
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
              {isEditing ? '단체 소식 수정' : '새 단체 소식 추가'}
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
                  요약 *
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  rows={4}
                  required
                  placeholder="목록에 표시될 간단한 요약"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상세 내용 (선택)
                </label>
                <textarea
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  rows={8}
                  placeholder="상세 페이지에 표시될 전체 내용"
                />
                <p className="mt-1 text-xs text-gray-500">
                  💡 상세 내용을 입력하면 상세 페이지에서 표시됩니다. 없으면 요약만 표시됩니다.
                </p>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">단체 소식 목록</h2>
            <div className="space-y-4">
              {recruitments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">단체 소식 정보가 없습니다.</p>
              ) : (
                recruitments.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-catholic-logo/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.summary}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 rounded text-sm text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95"
                          style={{ backgroundColor: '#7B1F4B' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

