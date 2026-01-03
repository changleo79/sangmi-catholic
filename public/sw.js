const CACHE_NAME = 'sangmi-catholic-v1'
const RUNTIME_CACHE = 'sangmi-runtime-v1'

// 캐시할 리소스 목록
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// 설치 이벤트 - 정적 리소스 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS)
    })
  )
  self.skipWaiting()
})

// 활성화 이벤트 - 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// fetch 이벤트 - 네트워크 우선, 캐시 폴백 전략
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API 요청은 네트워크만 사용
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request))
    return
  }

  // HTML 요청 - 네트워크 우선, 캐시 폴백
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 성공 시 캐시에 저장
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // 네트워크 실패 시 캐시에서 반환
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // 캐시에도 없으면 기본 페이지 반환
            return caches.match('/index.html')
          })
        })
    )
    return
  }

  // 이미지 및 기타 리소스 - 캐시 우선, 네트워크 폴백
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // 성공 시 캐시에 저장
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
    })
  )
})

// 푸시 알림 수신 이벤트
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || '상미성당 알림'
  const options = {
    body: data.body || '새로운 알림이 있습니다.',
    icon: '/images/상미성당 로고2.png',
    badge: '/images/상미성당 로고2.png',
    tag: data.tag || 'default',
    data: data.url || '/',
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// 알림 클릭 이벤트
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  )
})
