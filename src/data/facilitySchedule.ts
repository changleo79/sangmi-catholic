export type FacilityScheduleRow = {
  day: string
  churchOpen: string
  mass: string
  special?: string
  shop: string
  office: string
  manager: string
}

export const facilityScheduleRows: FacilityScheduleRow[] = [
  {
    day: '주일',
    churchOpen: '08:30 / 19:00',
    mass: '10:00 (교중) · 15:00 (어린이)',
    shop: '미사 종료 후 30분간',
    office: '08:30–11:30 / 12:30–17:30',
    manager: '08:30–11:30 / 14:00–19:00'
  },
  {
    day: '월요일',
    churchOpen: '06:00 / 07:30',
    mass: '06:30 새벽미사',
    shop: '휴무',
    office: '휴무',
    manager: '휴무'
  },
  {
    day: '화요일',
    churchOpen: '09:00 / 21:30',
    mass: '19:30 저녁미사',
    shop: '미사 종료 후 30분간',
    office: '12:00–16:00 / 16:30–20:30',
    manager: '09:00–12:00 / 16:30–21:30'
  },
  {
    day: '수요일',
    churchOpen: '09:00 / 18:00',
    mass: '10:00 아침미사',
    shop: '미사 종료 후 30분간',
    office: '09:00–12:00 / 13:00–18:00',
    manager: '09:00–12:00 / 13:00–18:00'
  },
  {
    day: '목요일',
    churchOpen: '09:00 / 21:30',
    mass: '19:30 저녁미사',
    special: '성시간 (첫 목요일 19:30)',
    shop: '미사 종료 후 30분간',
    office: '휴무',
    manager: '09:00–12:00 / 16:30–21:30'
  },
  {
    day: '금요일',
    churchOpen: '09:00 / 18:00',
    mass: '10:00 아침미사',
    shop: '미사 종료 후 30분간',
    office: '09:00–12:00 / 13:00–18:00',
    manager: '휴무'
  },
  {
    day: '토요일',
    churchOpen: '09:00 / 19:00',
    mass: '17:00 청년미사',
    special: '성모신심미사 (첫 토요일 10:00)',
    shop: '미사 종료 후 30분간',
    office: '09:00–12:00 / 14:00–19:00',
    manager: '09:00–12:00 / 14:00–19:00'
  }
]

export const facilityScheduleNotes = ['공휴일 : 사무실 휴무']

export type ShuttleStop = {
  time: string
  stop: string
}

export type ShuttleRun = {
  label?: string
  stops: ShuttleStop[]
}

export type ShuttleRoute = {
  title: string
  runs: ShuttleRun[]
}

export const shuttleRoutes: ShuttleRoute[] = [
  {
    title: '1지역 (카니발 운행)',
    runs: [
      {
        stops: [
          { time: '09:00', stop: '롯데스카이 아파트 주차장 앞 마을버스 정류장' },
          { time: '09:15', stop: '판다몰' }
        ]
      }
    ]
  },
  {
    title: '3·4지역 (25인승 노란색 뉴카운티 지원차량)',
    runs: [
      {
        stops: [
          { time: '09:25', stop: '신일 마을버스 정류장' },
          { time: '09:26', stop: '태영 · 대명 부동산 앞' },
          { time: '09:27', stop: '효성 정문' },
          { time: '09:35', stop: '성당 도착' }
        ]
      }
    ]
  },
  {
    title: '5·6지역 (25인승 노란색 뉴카운티 지원차량)',
    runs: [
      {
        label: '1회',
        stops: [
          { time: '09:00', stop: '기흥역 지웰 정문' },
          { time: '09:13', stop: '성당 도착' }
        ]
      },
      {
        label: '2회',
        stops: [
          { time: '09:00', stop: '뚜레쥬르' },
          { time: '09:01', stop: '파크 정문' },
          { time: '09:01', stop: '더샵 정문' },
          { time: '09:20', stop: '성당 도착' }
        ]
      },
      {
        label: '3회',
        stops: [
          { time: '09:25', stop: '기흥역 지웰 정문' },
          { time: '09:26', stop: '뚜레쥬르' },
          { time: '09:27', stop: '파크 정문' },
          { time: '09:27', stop: '더샵 정문' },
          { time: '09:40', stop: '성당 도착' }
        ]
      }
    ]
  }
]

