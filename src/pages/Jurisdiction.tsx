import { useState } from 'react'

interface District {
  zone: string
  alias: string
  area: string
}

interface Region {
  name: string
  districts: District[]
}

const jurisdictionData: Region[] = [
  {
    name: '1지역',
    districts: [
      { zone: '구역 1', alias: '신갈2', area: '신갈동 32, 33, 39, 40, 43~47, 49~53번지' },
      { zone: '구역 3', alias: '원대', area: '신갈로102 원대마을 한신 101동~106동' },
      { zone: '구역 5', alias: '롯데스카이', area: '중부대로 375(신갈동 기흥역롯데캐슬스카이), 101~103동; 경기도 용인시 기흥구 중부대로 376 이안두드림기흥역' },
    ]
  },
  {
    name: '2지역',
    districts: [
      { zone: '구역 1', alias: '신갈1', area: '신갈동 16, 35~38, 57, 60~63, 68~71번지' },
      { zone: '구역 3', alias: '롯데캐슬1', area: '신정로 25(신갈동, 신흥덕롯데캐슬레이시티) 101동~105동' },
      { zone: '5', alias: '우방', area: '신정로41번길 31(신갈동, 용인기흥우방아이유쉘)' },
    ]
  },
  {
    name: '3지역',
    districts: [
      { zone: '구역 1', alias: '두진1', area: '덕영대로2077번길 8(영덕동, 두진아파트) 101동~102동' },
      { zone: '구역 3', alias: '신일1', area: '덕영대로2077번길 20(영덕동, 청현마을 신일아파트) 101동~105동, 107동' },
      { zone: '구역 7', alias: '힉스', area: '중부대로 184(영덕동) 힉스유타워 A동, B동, C동' },
    ]
  },
  {
    name: '4지역',
    districts: [
      { zone: '구역 1', alias: '효성1', area: '덕영대로2077번길 33(영덕동, 기흥효성해링턴플레이스) 101동~105동' },
      { zone: '구역 4', alias: '포레피스', area: '덕영대로2063, (영덕동, 기흥 푸르지오 포레피스) 101동~106동' },
    ]
  },
  {
    name: '5지역',
    districts: [
      { zone: '구역 1', alias: '지웰1', area: '기흥역로 16(구갈동, 기흥역 더퍼스트푸르지오) 101동, 102동' },
      { zone: '구역 4', alias: '롯데기흥', area: '기흥역로 9 (구갈동, 기흥역 롯데캐슬 레이시티/주상복합) A동, B동' },
      { zone: '구역 6', alias: '힉스2', area: '기흥역로 63 (구갈동, 힐스테이트 기흥) 203동~205동' },
    ]
  },
  {
    name: '6지역',
    districts: [
      { zone: '구역 1', alias: '센트럴1', area: '기흥역로58번길 10 (구갈동, 기흥역 센트럴푸르지오) 201동~203동' },
      { zone: '구역 3', alias: '파크1', area: '기흥역로58번길 56 (구갈동, 기흥역 파크푸르지오) 301동~303동' },
      { zone: '구역 7', alias: '더샵3', area: '기흥역로58번길 78(구갈동, 기흥역 더샵) 101동, 106동' },
    ]
  },
]

export default function Jurisdiction() {
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null)

  const toggleRegion = (regionName: string) => {
    setExpandedRegion(expandedRegion === regionName ? null : regionName)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
            관할구역 안내
          </h1>
          <div className="w-24 h-1.5 mx-auto rounded-full mb-4" style={{ background: 'linear-gradient(to right, #7B1F4B, rgba(123, 31, 75, 0.3))' }}></div>
          <p className="text-gray-600 text-lg">2025. 07.06 현재</p>
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
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md" style={{ backgroundColor: '#7B1F4B' }}>
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
                    {region.districts.map((district, index) => (
                      <div
                        key={`${region.name}-${index}`}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-catholic-logo/30 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ backgroundColor: '#7B1F4B' }}>
                            {district.zone}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">{district.alias}</h3>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 leading-relaxed">{district.area}</p>
                        </div>
                      </div>
                    ))}
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

