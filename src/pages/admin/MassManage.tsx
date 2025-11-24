import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  MassScheduleItem, 
  SacramentItem, 
  CatechismInfo,
  getMassSchedule, 
  saveMassSchedule,
  getSacraments,
  saveSacraments,
  getCatechismInfo,
  saveCatechismInfo
} from '../../utils/storage'

export default function MassManage() {
  const [massSchedule, setMassSchedule] = useState<MassScheduleItem[]>([])
  const [sacraments, setSacraments] = useState<SacramentItem[]>([])
  const [catechismInfo, setCatechismInfo] = useState<CatechismInfo>({
    title: '',
    description: '',
    contact: ''
  })
  
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [editingSacramentId, setEditingSacramentId] = useState<string | null>(null)
  
  const [scheduleForm, setScheduleForm] = useState<MassScheduleItem>({
    id: '',
    day: '',
    time: '',
    description: '',
    note: ''
  })
  
  const [sacramentForm, setSacramentForm] = useState<SacramentItem>({
    id: '',
    name: '',
    description: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    console.log('[MassManage] 서버에서 데이터 로드 시작')
    // 캐시 무효화하고 서버에서 강제 로드
    if ((window as any).cachedData) {
      (window as any).cachedData.massSchedule = undefined
      (window as any).cachedData.sacraments = undefined
      (window as any).cachedData.catechism = undefined
    }
    const schedule = await getMassSchedule(true) // 서버에서 강제 로드
    if (schedule.length === 0) {
      // 기본 데이터
      const defaultSchedule: MassScheduleItem[] = [
        { id: '1', day: '월요일', time: '오전 6시 30분', description: '새벽미사' },
        { id: '2', day: '화요일', time: '오후 7시 30분', description: '저녁미사' },
        { id: '3', day: '수요일', time: '오전 10시', description: '아침미사' },
        { id: '4', day: '목요일', time: '오후 7시 30분', description: '저녁미사' },
        { id: '5', day: '금요일', time: '오전 10시', description: '아침미사' },
        { id: '6', day: '토요일', time: '오후 5시', description: '청년미사', note: '매월 첫토요일 오전 10시 (성모신심미사)' },
        { id: '7', day: '일요일', time: '오전 10시', description: '교중미사' },
        { id: '8', day: '일요일', time: '오후 3시', description: '어린이미사' }
      ]
      setMassSchedule(defaultSchedule)
      await saveMassSchedule(defaultSchedule)
    } else {
      setMassSchedule(schedule)
    }

    const sacramentList = await getSacraments(true) // 서버에서 강제 로드
    if (sacramentList.length === 0) {
      // 기본 데이터
      const defaultSacraments: SacramentItem[] = [
        { id: '1', name: '세례성사', description: '예비신자 교리 후 진행' },
        { id: '2', name: '고해성사', description: '미사 전후 또는 사제와 약속' },
        { id: '3', name: '견진성사', description: '연간 일정에 따라 진행' },
        { id: '4', name: '혼인성사', description: '사제와 사전 상담 필수' },
        { id: '5', name: '병자성사', description: '사무실로 연락 바랍니다' }
      ]
      setSacraments(defaultSacraments)
      await saveSacraments(defaultSacraments)
    } else {
      setSacraments(sacramentList)
    }

    const catechism = await getCatechismInfo(true) // 서버에서 강제 로드
    if (catechism) {
      setCatechismInfo(catechism)
    } else {
      const defaultCatechism: CatechismInfo = {
        title: '예비신자 교리학교',
        description: '천주교 신자가 되시려면 세례를 받아야 합니다. 예비신자 교리학교를 통해 신앙을 배우실 수 있습니다.',
        contact: '문의 : 성당 사무실 (031-282-9989)'
      }
      setCatechismInfo(defaultCatechism)
      await saveCatechismInfo(defaultCatechism)
    }
  }

  // 미사 시간 관리
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newSchedule = [...massSchedule]
    
    if (editingScheduleId) {
      const index = newSchedule.findIndex(s => s.id === editingScheduleId)
      if (index !== -1) {
        newSchedule[index] = scheduleForm
      }
    } else {
      const newId = Date.now().toString()
      newSchedule.push({ ...scheduleForm, id: newId })
    }
    
    setMassSchedule(newSchedule)
    saveMassSchedule(newSchedule)
    setScheduleForm({ id: '', day: '', time: '', description: '', note: '' })
    setEditingScheduleId(null)
  }

  const handleScheduleEdit = (item: MassScheduleItem) => {
    setScheduleForm(item)
    setEditingScheduleId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleScheduleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newSchedule = massSchedule.filter(s => s.id !== id)
      setMassSchedule(newSchedule)
      await saveMassSchedule(newSchedule) // 서버에 저장 완료 대기
    }
  }

  // 성사 안내 관리
  const handleSacramentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newSacraments = [...sacraments]
    
    if (editingSacramentId) {
      const index = newSacraments.findIndex(s => s.id === editingSacramentId)
      if (index !== -1) {
        newSacraments[index] = sacramentForm
      }
    } else {
      const newId = Date.now().toString()
      newSacraments.push({ ...sacramentForm, id: newId })
    }
    
    setSacraments(newSacraments)
    await saveSacraments(newSacraments) // 서버에 저장 완료 대기
    setSacramentForm({ id: '', name: '', description: '' })
    setEditingSacramentId(null)
  }

  const handleSacramentEdit = (item: SacramentItem) => {
    setSacramentForm(item)
    setEditingSacramentId(item.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSacramentDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const newSacraments = sacraments.filter(s => s.id !== id)
      setSacraments(newSacraments)
      await saveSacraments(newSacraments) // 서버에 저장 완료 대기
    }
  }

  // 예비신자 교리학교 정보 저장
  const handleCatechismSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveCatechismInfo(catechismInfo) // 서버에 저장 완료 대기
    alert('저장되었습니다.')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">미사시간 및 성사안내 관리</h1>
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

        <div className="max-w-6xl mx-auto space-y-8">
          {/* 미사 시간 관리 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">미사 시간 관리</h2>
            
            {/* Form */}
            <form onSubmit={handleScheduleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingScheduleId ? '미사 시간 수정' : '새 미사 시간 추가'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">요일 *</label>
                  <input
                    type="text"
                    value={scheduleForm.day}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    placeholder="예: 월요일"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">시간 *</label>
                  <input
                    type="text"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    placeholder="예: 오전 6시 30분"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
                  <input
                    type="text"
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    placeholder="예: 새벽미사"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">추가 설명 (선택)</label>
                  <input
                    type="text"
                    value={scheduleForm.note}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, note: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    placeholder="예: 매월 첫토요일"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  {editingScheduleId ? '수정 완료' : '추가'}
                </button>
                {editingScheduleId && (
                  <button
                    type="button"
                    onClick={() => {
                      setScheduleForm({ id: '', day: '', time: '', description: '', note: '' })
                      setEditingScheduleId(null)
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>

            {/* List */}
            <div className="space-y-3">
              {massSchedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.day}</p>
                      <p className="text-gray-600">{item.time} {item.description && `(${item.description})`}</p>
                      {item.note && <p className="text-gray-500 text-sm mt-1">{item.note}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleScheduleEdit(item)}
                      className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleScheduleDelete(item.id)}
                      className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 성사 안내 관리 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">성사 안내 관리</h2>
            
            {/* Form */}
            <form onSubmit={handleSacramentSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingSacramentId ? '성사 안내 수정' : '새 성사 안내 추가'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">성사 이름 *</label>
                  <input
                    type="text"
                    value={sacramentForm.name}
                    onChange={(e) => setSacramentForm({ ...sacramentForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    placeholder="예: 세례성사"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">설명 *</label>
                  <input
                    type="text"
                    value={sacramentForm.description}
                    onChange={(e) => setSacramentForm({ ...sacramentForm, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                    placeholder="예: 예비신자 교리 후 진행"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#7B1F4B' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
                >
                  {editingSacramentId ? '수정 완료' : '추가'}
                </button>
                {editingSacramentId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSacramentForm({ id: '', name: '', description: '' })
                      setEditingSacramentId(null)
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>

            {/* List */}
            <div className="space-y-3">
              {sacraments.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#7B1F4B' }}></div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSacramentEdit(item)}
                      className="px-3 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleSacramentDelete(item.id)}
                      className="px-3 py-1 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 예비신자 교리학교 정보 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">예비신자 교리학교 정보</h2>
            
            <form onSubmit={handleCatechismSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                <input
                  type="text"
                  value={catechismInfo.title}
                  onChange={(e) => setCatechismInfo({ ...catechismInfo, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명 *</label>
                <textarea
                  value={catechismInfo.description}
                  onChange={(e) => setCatechismInfo({ ...catechismInfo, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연락처 *</label>
                <input
                  type="text"
                  value={catechismInfo.contact}
                  onChange={(e) => setCatechismInfo({ ...catechismInfo, contact: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                  placeholder="예: 문의 : 성당 사무실 (031-282-9989)"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: '#7B1F4B' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
              >
                저장
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

