import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type BackupEntry,
  type StorageDatasetKey,
  createBackup,
  deleteBackup,
  getBackups,
  restoreBackup
} from '../../utils/storage'

const datasets: Array<{ key: StorageDatasetKey; description: string }> = [
  { key: 'notices', description: '공지사항 목록' },
  { key: 'recruitments', description: '단체 소식 게시글' },
  { key: 'faqs', description: '자주 묻는 질문' },
  { key: 'albums', description: '성당 앨범 및 사진' },
  { key: 'massSchedule', description: '미사 시간표 데이터' },
  { key: 'sacraments', description: '성사 안내' },
  { key: 'catechism', description: '예비신자 교리 안내' },
  { key: 'bulletins', description: '주보 안내(PDF)' }
]

export default function BackupManage() {
  const [entries, setEntries] = useState<BackupEntry[]>([])
  const [selectedKey, setSelectedKey] = useState<StorageDatasetKey>('notices')
  const [isLoading, setIsLoading] = useState(false)

  const filteredEntries = useMemo(
    () => entries.filter((entry) => entry.key === selectedKey),
    [entries, selectedKey]
  )

  useEffect(() => {
    const load = async () => {
      const backups = await getBackups()
      setEntries(backups)
    }
    load()
    const handleUpdate = () => load()
    window.addEventListener('storageBackupUpdated', handleUpdate)
    return () => window.removeEventListener('storageBackupUpdated', handleUpdate)
  }, [])

  const handleCreateBackup = async () => {
    setIsLoading(true)
    try {
      const result = await createBackup(selectedKey)
      if (!result) {
        alert('백업 생성에 실패했습니다. 다시 시도해 주세요.')
      } else {
        const backups = await getBackups()
        setEntries(backups)
      }
    } catch (error) {
      console.error('백업 생성 오류:', error)
      alert('백업 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = async (id: string) => {
    if (!confirm('선택한 백업으로 복원하시겠습니까? 현재 데이터가 덮어씌워집니다.')) return
    try {
      const success = await restoreBackup(id)
      if (success) {
        alert('복원이 완료되었습니다.')
        const backups = await getBackups()
        setEntries(backups)
      } else {
        alert('복원에 실패했습니다.')
      }
    } catch (error) {
      console.error('복원 오류:', error)
      alert('복원 중 오류가 발생했습니다.')
    }
  }

  const handleDownload = (entry: BackupEntry) => {
    const blob = new Blob([JSON.stringify(entry.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${entry.key}-${entry.createdAt}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('해당 백업을 삭제하시겠습니까?')) return
    try {
      await deleteBackup(id)
      const backups = await getBackups()
      setEntries(backups)
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">데이터 백업 / 복원</h1>
            <div className="w-24 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          </div>
          <Link to="/admin" className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors">
            ← 대시보드
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-8">
          <aside className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">백업 대상</h2>
            <ul className="space-y-2">
              {datasets.map(({ key, description }) => (
                <li key={key}>
                  <button
                    onClick={() => setSelectedKey(key)}
                    className={`w-full text-left px-3 py-2 rounded-xl border transition-all duration-200 ${
                      selectedKey === key
                        ? 'border-catholic-logo text-catholic-logo bg-catholic-logo/10'
                        : 'border-gray-200 hover:border-catholic-logo/30 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-sm font-semibold capitalize">{description.split(' ')[0]}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{description}</p>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={handleCreateBackup}
              disabled={isLoading}
              className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
              style={{ backgroundColor: '#7B1F4B' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5a1538' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7B1F4B' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {isLoading ? '백업 중...' : '새 백업 생성'}
            </button>
          </aside>

          <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{datasets.find((item) => item.key === selectedKey)?.description}</h2>
                <p className="text-sm text-gray-500 mt-1">최근 20개의 백업이 보관됩니다.</p>
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p>등록된 백업이 없습니다. 좌측에서 백업을 생성해 주세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{entry.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleRestore(entry.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium shadow hover:shadow-lg transition-colors"
                        style={{ backgroundColor: '#7B1F4B' }}
                      >
                        복원
                      </button>
                      <button
                        onClick={() => handleDownload(entry)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        다운로드
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
