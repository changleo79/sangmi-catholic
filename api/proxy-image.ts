import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  try {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      res.status(400).json({ message: 'URL 파라미터가 필요합니다.' })
      return
    }

    // URL 검증 (보안)
    const imageUrl = decodeURIComponent(url)
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      res.status(400).json({ message: '유효하지 않은 URL입니다.' })
      return
    }

    // 외부 이미지 가져오기 (referrerPolicy로 CORS 문제 회피)
    const imageResponse = await fetch(imageUrl, {
      referrerPolicy: 'no-referrer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!imageResponse.ok) {
      res.status(imageResponse.status).json({ 
        message: `이미지를 가져올 수 없습니다: ${imageResponse.status}` 
      })
      return
    }

    // 이미지 데이터 가져오기
    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'

    // 응답 헤더 설정
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Access-Control-Allow-Origin', '*')
    
    // 이미지 데이터 전송
    res.status(200).send(Buffer.from(imageBuffer))
  } catch (error) {
    console.error('[proxy-image] 이미지 프록시 실패:', {
      url: req.query.url,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    res.status(500).json({ 
      message: `이미지를 가져오는 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}` 
    })
  }
}

