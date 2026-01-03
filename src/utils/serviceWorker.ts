export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      
      console.log('[Service Worker] 등록 성공:', registration.scope)

      // 업데이트 확인
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 새 버전이 설치되었지만 아직 활성화되지 않음
              console.log('[Service Worker] 새 버전 사용 가능')
              // 사용자에게 새로고침 안내 가능
            }
          })
        }
      })

      return registration
    } catch (error) {
      console.error('[Service Worker] 등록 실패:', error)
    }
  }
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    const permission = await Notification.requestPermission()
    return permission
  }
  return 'denied'
}

// 푸시 알림 구독 (VAPID 키는 나중에 설정)
export const subscribeToPush = async (registration: ServiceWorkerRegistration, vapidKey?: string): Promise<PushSubscription | null> => {
  if (!vapidKey) {
    console.warn('[Push] VAPID 키가 설정되지 않았습니다.')
    return null
  }
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    })
    
    // 구독 정보를 서버에 전송 (나중에 구현)
    console.log('[Push] 구독 성공:', subscription)
    
    return subscription
  } catch (error) {
    console.error('[Push] 구독 실패:', error)
    return null
  }
}

// 푸시 알림 구독 해제
export const unsubscribeFromPush = async (registration: ServiceWorkerRegistration): Promise<boolean> => {
  try {
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      console.log('[Push] 구독 해제 성공')
      return true
    }
    return false
  } catch (error) {
    console.error('[Push] 구독 해제 실패:', error)
    return false
  }
}

// 현재 푸시 구독 상태 확인
export const getPushSubscription = async (registration: ServiceWorkerRegistration): Promise<PushSubscription | null> => {
  try {
    const subscription = await registration.pushManager.getSubscription()
    return subscription
  } catch (error) {
    console.error('[Push] 구독 상태 확인 실패:', error)
    return null
  }
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer
}
