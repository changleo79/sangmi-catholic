import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const requiredEnv = {
  accessKeyId: process.env.NCP_ACCESS_KEY,
  secretAccessKey: process.env.NCP_SECRET_KEY,
  bucket: process.env.NCP_BUCKET,
  endpoint: process.env.NCP_ENDPOINT || 'https://kr.object.ncloudstorage.com',
  cdnDomain: process.env.NCP_CDN_DOMAIN
}

const s3Client = new S3Client({
  endpoint: requiredEnv.endpoint,
  region: 'kr-standard',
  credentials: {
    accessKeyId: requiredEnv.accessKeyId!,
    secretAccessKey: requiredEnv.secretAccessKey!
  }
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  // 모바일 브라우저 캐시 완전 회피를 위한 강력한 헤더
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0, private')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('X-Content-Type-Options', 'nosniff')

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
    const { type } = req.query

    const validTypes = ['notices', 'recruitments', 'faqs', 'albums', 'massSchedule', 'sacraments', 'catechism', 'bulletins', 'organizationPosts', 'backups']
    if (!type || !validTypes.includes(type as string)) {
      res.status(400).json({ message: `type은 다음 중 하나여야 합니다: ${validTypes.join(', ')}` })
      return
    }

    const objectKey = `metadata/${type}.json`

    try {
      const command = new GetObjectCommand({
        Bucket: requiredEnv.bucket!,
        Key: objectKey
      })

      const response = await s3Client.send(command)
      const body = await response.Body?.transformToString()
      
      if (!body) {
        console.log(`[load-metadata] ${type} 파일 없음, 빈 배열 반환`)
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        res.status(200).json({ data: [] })
        return
      }

      const data = JSON.parse(body)
      console.log(`[load-metadata] ${type} 로드 성공:`, Array.isArray(data) ? `${data.length}개` : '데이터 있음')
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.status(200).json({ data })
    } catch (error: any) {
      // 파일이 없으면 빈 배열 반환
      if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
        res.status(200).json({ data: [] })
        return
      }
      throw error
    }
  } catch (error: any) {
    console.error('메타데이터 로드 오류:', error)
    res.status(500).json({ 
      message: '메타데이터 로드 실패',
      error: error.message 
    })
  }
}

