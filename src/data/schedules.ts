export type FacilitySchedule = {
  day: string
  chapelOpen: string[]
  mass: string[]
  specials?: string[]
  giftShop?: string | null
  office: string[]
  manager: string[]
}

export const facilityScheduleNote = '* 공휴일에는 사무실이 휴무입니다.'

export const facilitySchedules: FacilitySchedule[] = [
  {
    day: '주일',
    chapelOpen: ['08:30', '19:00'],
    mass: ['10:00 교중미사', '15:00 어린이미사'],
    giftShop: '미사 종료 후 30분간',
    office: ['08:30~11:30', '12:30~17:30'],
    manager: ['08:30~11:30', '14:00~19:00']
  },
  {
    day: '월요일',
    chapelOpen: ['06:00', '19:00'],
    mass: ['06:30 새벽미사'],
    office: ['휴무'],
    manager: ['휴무']
  },
  {
    day: '화요일',
    chapelOpen: ['09:00', '21:30'],
    mass: ['19:30 저녁미사'],
    giftShop: '미사 종료 후 30분간',
    office: ['12:00~16:00', '16:30~20:30'],
    manager: ['09:00~12:00', '16:30~21:30']
  },
  {
    day: '수요일',
    chapelOpen: ['09:00', '18:00'],
    mass: ['10:00 아침미사'],
    giftShop: '미사 종료 후 30분간',
    office: ['09:00~12:00', '13:00~18:00'],
    manager: ['09:00~12:00', '13:00~18:00']
  },
  {
    day: '목요일',
    chapelOpen: ['09:00', '21:30'],
    mass: ['19:30 저녁미사'],
    specials: ['성시간 (첫 목요일) 19:30'],
    office: ['휴무'],
    manager: ['09:00~12:00', '16:30~21:30']
  },
  {
    day: '금요일',
    chapelOpen: ['09:00', '18:00'],
    mass: ['10:00 아침미사'],
    office: ['09:00~12:00', '13:00~18:00'],
    manager: ['휴무']
  },
  {
    day: '토요일',
    chapelOpen: ['09:00', '19:00'],
    mass: ['17:00 토요미사'],
    specials: ['성모신심미사 (첫 토요일) 10:00'],
    office: ['09:00~12:00', '14:00~19:00'],
    manager: ['09:00~12:00', '14:00~19:00']
  }
]

export type ShuttleStop = {
  time: string
  location: string
}

export type ShuttleCourse = {
  label?: string
  stops: ShuttleStop[]
}

export type ShuttleRoute = {
  title: string
  description: string
  courses: ShuttleCourse[]
  accent: string
}

export const shuttleRoutes: ShuttleRoute[] = [
  {
    title: '1지역 (카니발 운행)',
    description: '카니발 차량으로 순환 운행합니다.',
    accent: '#7B1F4B',
    courses: [
      {
        stops: [
          { time: '09:00', location: '롯데스카이 아파트 주차장 앞 마을버스 정류장' },
          { time: '09:15', location: '판다몰' }
        ]
      }
    ]
  },
  {
    title: '3·4지역 (25인승 노란색 뉴카운티 지원차량)',
    description: '3·4지역은 25인승 차량이 한 차례 운행합니다.',
    accent: '#4C9C84',
    courses: [
      {
        stops: [
          { time: '09:25', location: '신일 마을버스 정류장' },
          { time: '09:26', location: '태영 · 대명 부동산 앞' },
          { time: '09:27', location: '효성 정문' },
          { time: '09:35', location: '성당 도착' }
        ]
      }
    ]
  },
  {
    title: '5·6지역 (25인승 노란색 뉴카운티 지원차량)',
    description: '5·6지역은 세 차례 운행합니다.',
    accent: '#3A7CA5',
    courses: [
      {
        label: '1회',
        stops: [
          { time: '09:00', location: '기흥역 지웰 정문' },
          { time: '09:13', location: '성당 도착' }
        ]
      },
      {
        label: '2회',
        stops: [
          { time: '09:00', location: '뚜레쥬르' },
          { time: '09:01', location: '파크 정문' },
          { time: '09:01', location: '더샵 정문' },
          { time: '09:20', location: '성당 도착' }
        ]
      },
      {
        label: '3회',
        stops: [
          { time: '09:25', location: '기흥역 지웰 정문' },
          { time: '09:26', location: '뚜레쥬르' },
          { time: '09:27', location: '파크 정문' },
          { time: '09:27', location: '더샵 정문' },
          { time: '09:40', location: '성당 도착' }
        ]
      }
    ]
  }
]


