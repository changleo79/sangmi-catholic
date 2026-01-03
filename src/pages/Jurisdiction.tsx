import { useState, useMemo, useEffect } from 'react'

interface District {
  alias: string
  area: string
}

interface Region {
  name: string
  districts: District[]
}

interface SearchResult {
  region: Region
  district: District
  matchType: 'alias' | 'area'
}

const jurisdictionData: Region[] = [
  {
    name: '1지역',
    districts: [
      { alias: '신갈2', area: '신갈동 32, 33, 39, 40, 43～47, 49～53번지' },
      { alias: '신갈3', area: '신갈동 17, 34, 42번지' },
      { alias: '원대', area: '신갈로102 원대마을 한신 101동～106동' },
      { alias: '구갈1', area: '신갈동 64～66번지 / 구갈동 402～414, 540, 541번지' },
      { alias: '롯데스카이', area: '중부대로 375(신갈동. 기흥역롯데캐슬스카이), 101～103동\n경기도 용인시 기흥구 중부대로 376 이안두드림기흥역' },
      { alias: '우림,풍림', area: '신구로42번길15 우림아파트 / 신구로42번길22 풍림아파트' },
    ]
  },
  {
    name: '2지역',
    districts: [
      { alias: '신갈1', area: '신갈동 16, 35～38, 57, 60～63, 68～71번지' },
      { alias: '상미', area: '신갈동 410～456번지, 신역동 전체' },
      { alias: '롯데캐슬1', area: '신정로 25(신갈동, 신흥덕롯데캐슬레이시티) 101동~105동' },
      { alias: '롯데캐슬2', area: '신정로 25(신갈동, 신흥덕롯데캐슬레이시티) 106동~111동' },
      { alias: '우방', area: '신정로41번길 31(신갈동, 용인기흥우방아이유쉘)' },
    ]
  },
  {
    name: '3지역',
    districts: [
      { alias: '두진1', area: '덕영대로2077번길 8(영덕동, 두진아파트) 101동~102동' },
      { alias: '두진2', area: '덕영대로2077번길 8(영덕동, 두진아파트) 103동~104동' },
      { alias: '신일1', area: '덕영대로2077번길 20(영덕동, 청현마을 신일아파트) 101동~105동, 107동' },
      { alias: '신일2', area: '덕영대로2077번길 20(영덕동, 청현마을 신일아파트) 106동, 109동, 201동~203동' },
      { alias: '태영', area: '덕영대로2077번길 53(영덕동, 청현마을 태영데시앙) 201동~207동' },
      { alias: '대명', area: '덕영대로2077번길 55(영덕동, 청현마을 대명레이크빌) 101동~107동' },
      { alias: '힉스', area: '중부대로 184(영덕동) 힉스유타워 A동, B동, C동' },
    ]
  },
  {
    name: '4지역',
    districts: [
      { alias: '효성1', area: '덕영대로2077번길 33(영덕동, 기흥효성해링턴플레이스) 101동~105동' },
      { alias: '효성2', area: '덕영대로2077번길 33(영덕동, 기흥효성해링턴플레이스) 106동~111동' },
      { alias: '효성3', area: '덕영대로2077번길 33(영덕동, 기흥효성해링턴플레이스) 112동~117동, T101동~106동' },
      { alias: '포레피스', area: '덕영대로2063,(영덕동, 기흥 푸르지오 포레피스) 101동~106동' },
    ]
  },
  {
    name: '5지역',
    districts: [
      { alias: '지웰1', area: '기흥역로 16(구갈동, 기흥역 더퍼스트푸르지오) 101동, 102동' },
      { alias: '지웰2', area: '기흥역로 16(구갈동, 기흥역 더퍼스트푸르지오) 103동, 104동' },
      { alias: '지웰3', area: '기흥역로 16(구갈동, 기흥역 더퍼스트푸르지오) 105동, 106동' },
      { alias: '롯데기흥', area: '기흥역로 9 (구갈동, 기흥역 롯데캐슬 레이시티/주상복합) A동, B동' },
      { alias: '힐스1', area: '기흥역로 63 (구갈동, 힐스테이트 기흥) 201동, 202동' },
      { alias: '힐스2', area: '기흥역로 63 (구갈동, 힐스테이트 기흥) 203동~205동' },
    ]
  },
  {
    name: '6지역',
    districts: [
      { alias: '센트럴1', area: '기흥역로58번길 10 (구갈동, 기흥역 센트럴푸르지오) 201동~203동' },
      { alias: '센트럴2', area: '기흥역로58번길 10 (구갈동, 기흥역 센트럴푸르지오) 204동~207동' },
      { alias: '파크1', area: '기흥역로58번길 56 (구갈동, 기흥역 파크푸르지오) 301동~303동' },
      { alias: '파크2', area: '기흥역로58번길 56 (구갈동, 기흥역 파크푸르지오) 304동~306동' },
      { alias: '더샵1', area: '기흥역로58번길 78(구갈동, 기흥역 더샵) 102동, 103동, 201동' },
      { alias: '더샵2', area: '기흥역로58번길 78(구갈동, 기흥역 더샵) 104동, 105동' },
      { alias: '더샵3', area: '기흥역로58번길 78(구갈동, 기흥역 더샵) 101동, 106동' },
    ]
  },
]

export default function Jurisdiction() {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const toggleRegion = (regionName: string) => {
    setExpandedRegion(expandedRegion === regionName ? null : regionName)
  }

  // 검색 기능
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.trim().toLowerCase()
    const results: SearchResult[] = []
    
    jurisdictionData.forEach(region => {
      region.districts.forEach(district => {
        const aliasMatch = district.alias.toLowerCase().includes(query)
        const areaMatch = district.area.toLowerCase().includes(query)
        
        if (aliasMatch || areaMatch) {
          results.push({
            region,
            district,
            matchType: aliasMatch ? 'alias' : 'area'
          })
        }
      })
    })
    
    return results
  }, [searchQuery])

  // 검색 결과가 있으면 해당 지역 자동 펼치기
  useEffect(() => {
    if (searchResults.length > 0 && searchResults[0].region.name !== expandedRegion) {
      setExpandedRegion(searchResults[0].region.name)
    }
  }, [searchResults])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            관할구역 안내
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-4" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          <p className="text-gray-600 text-lg mb-8">2025. 07.06 현재</p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="아파트명, 동 이름, 주소 등으로 검색하세요 (예: 롯데캐슬, 지웰, 101동)"
                className="w-full px-6 py-4 pl-14 rounded-2xl border-2 border-gray-200 focus:border-catholic-logo focus:ring-2 focus:ring-catholic-logo/20 text-base transition-all duration-300 shadow-sm"
              />
              <svg 
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Search Results */}
            {searchQuery.trim() && (
              <div className="mt-4">
                {searchResults.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-lg border-2 border-catholic-logo/30 p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          검색 결과: {searchResults.length}개 구역 발견
                        </h3>
                        <div className="space-y-3">
                          {searchResults.map((result, index) => (
                            <div 
                              key={`${result.region.name}-${result.district.alias}-${index}`}
                              className="bg-gradient-to-r from-catholic-logo/5 to-transparent rounded-lg p-4 border border-catholic-logo/20"
                            >
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span 
                                  className="inline-flex items-center justify-center min-w-[3rem] h-8 px-2 rounded-lg text-white font-bold text-sm shadow-md whitespace-nowrap flex-shrink-0"
                                  style={{ backgroundColor: '#7B1F4B' }}
                                >
                                  {result.region.name}
                                </span>
                                <span className="font-bold text-gray-900 whitespace-nowrap">
                                  {result.district.alias}구역
                                </span>
                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                  ({result.matchType === 'alias' ? '구역명 일치' : '주소 일치'})
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 ml-10 mt-1">{result.district.area}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-base font-semibold text-catholic-logo">
                            해당 구역은 <span className="text-xl">{searchResults[0]?.region.name}</span>에 속합니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-600">
                        &quot;{searchQuery}&quot;에 대한 검색 결과가 없습니다. 다른 검색어로 시도해보세요.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Regions Grid */}
        <div className="max-w-6xl mx-auto space-y-4">
          {jurisdictionData.map((region) => (
            <div
              key={region.name}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Region Header */}
              <button
                onClick={() => toggleRegion(region.name)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="min-w-[3.5rem] h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md px-3" style={{ backgroundColor: '#7B1F4B' }}>
                    {region.name}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{region.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{region.districts.length}개 구역</p>
                  </div>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${expandedRegion === region.name ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Districts List */}
              {expandedRegion === region.name && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {region.districts.map((district, index) => {
                      const isHighlighted = searchQuery.trim() && searchResults.some(
                        r => r.region.name === region.name && r.district.alias === district.alias
                      )
                      return (
                        <div
                          key={`${region.name}-${index}`}
                          className={`bg-gradient-to-br rounded-xl p-5 border transition-all duration-300 ${
                            isHighlighted
                              ? 'from-catholic-logo/10 to-white border-2 border-catholic-logo shadow-lg scale-105'
                              : 'from-gray-50 to-white border-gray-200 hover:border-catholic-logo/30 hover:shadow-md'
                          }`}
                        >
                          <div className="mb-3">
                            <h3 className={`font-bold text-lg mb-1 ${
                              isHighlighted ? 'text-catholic-logo' : 'text-gray-900'
                            }`}>
                              {district.alias}구역
                              {isHighlighted && (
                                <span className="ml-2 text-sm text-catholic-logo">✓ 검색 결과</span>
                              )}
                            </h3>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{district.area}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="max-w-6xl mx-auto mt-8 bg-gradient-to-r from-catholic-logo/10 to-catholic-logo/5 rounded-2xl p-6 border border-catholic-logo/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(123, 31, 75, 0.1)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#7B1F4B' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">안내사항</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                관할구역 정보는 2025년 7월 6일 기준입니다. 정확한 관할구역 확인은 성당 사무실(031-282-9989)로 문의해 주세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

