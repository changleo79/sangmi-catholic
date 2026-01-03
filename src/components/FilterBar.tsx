import { useState } from 'react'

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void
  showImportantFilter?: boolean
  showDateRange?: boolean
  showYearFilter?: boolean
}

export interface FilterOptions {
  importantOnly?: boolean
  startDate?: string
  endDate?: string
  year?: string
}

export default function FilterBar({
  onFilterChange,
  showImportantFilter = false,
  showDateRange = false,
  showYearFilter = false
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {}
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '')

  return (
    <div className="mb-6">
      {/* 필터 토글 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>필터</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-semibold text-white rounded-full" style={{ backgroundColor: '#7B1F4B' }}>
              {Object.values(filters).filter(v => v !== undefined && v !== '').length}
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            필터 초기화
          </button>
        )}
      </div>

      {/* 필터 옵션 */}
      {isExpanded && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          {/* 중요공지 필터 */}
          {showImportantFilter && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.importantOnly || false}
                  onChange={(e) => handleFilterChange('importantOnly', e.target.checked ? true : undefined)}
                  className="w-4 h-4 rounded border-gray-300 text-catholic-logo focus:ring-catholic-logo"
                />
                <span className="text-sm font-medium text-gray-700">중요공지만 보기</span>
              </label>
            </div>
          )}

          {/* 연도 필터 */}
          {showYearFilter && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">연도 선택</label>
              <select
                value={filters.year || ''}
                onChange={(e) => handleFilterChange('year', e.target.value || undefined)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
              >
                <option value="">전체</option>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - i
                  return (
                    <option key={year} value={year.toString()}>
                      {year}년
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* 날짜 범위 필터 */}
          {showDateRange && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-catholic-logo focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

