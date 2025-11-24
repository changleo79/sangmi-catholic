import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FAQItem, getFAQs, saveFAQs } from '../../utils/storage'

export default function FAQsManage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<FAQItem>({
    id: '',
    question: '',
    answer: ''
  })

  useEffect(() => {
    loadFAQs()
  }, [])

  const loadFAQs = async () => {
    console.log('[FAQsManage] 서버에서 FAQ 로드 시작')
    const stored = await getFAQs()
    if (stored.length > 0) {
      console.log('[FAQsManage] 서버에서 FAQ 로드 완료:', stored.length, '개')
      setFaqs(stored)
    } else {
      // 기본 데이터
      const defaultData: FAQItem[] = [
        { id: '1', question: '세례성사는 어떻게 신청하나요?', answer: '예비신자 교리학교 등록 후 사무실을 통해 안내드립니다.' },
        { id: '2', question: '혼인성사 준비는 어떻게 하나요?', answer: '사무실로 연락하셔서 사제와 상담 일정을 잡아주세요.' },
        { id: '3', question: '주보는 어디서 볼 수 있나요?', answer: '공지/소식 페이지에 주보 PDF가 업로드될 예정입니다.' }
      ]
      setFaqs(defaultData)
      await saveFAQs(defaultData)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newFaqs = [...faqs]
    
    if (editingId) {
      const index = newFaqs.findIndex(f => f.id === editingId)
      if (index !== -1) {
        newFaqs[index] = formData
      }
    } else {
      const newId = Date.now().toString()
      newFaqs.unshift({ ...formData, id: newId })
    }
    
    setFaqs(newFaqs)
    await saveFAQs(newFaqs) // 서버에 저장 완료 대기
    resetForm()
  }

  const handleEdit = (item: FAQItem) => {
    setFormData(item)
    setEditingId(item.id)
    setIsEditing(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newFaqs = faqs.filter(f => f.id !== id)
      setFaqs(newFaqs)
      saveFAQs(newFaqs)
    }
  }

  const resetForm = () => {
    setFormData({
      id: '',
      question: '',
      answer: ''
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">FAQ 관리</h1>
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
              {isEditing ? 'FAQ 수정' : '새 FAQ 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  질문 *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  답변 *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  rows={5}
                  required
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">FAQ 목록</h2>
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">FAQ가 없습니다.</p>
              ) : (
                faqs.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-catholic-logo/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
                        <p className="text-sm text-gray-600">{item.answer}</p>
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

