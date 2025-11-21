import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const requiredEnv = {
  accessKeyId: process.env.NCP_ACCESS_KEY,
  secretAccessKey: process.env.NCP_SECRET_KEY,
  bucket: process.env.NCP_BUCKET,
  endpoint: process.env.NCP_ENDPOINT || 'https://kr.object.ncloudstorage.com'
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  // 환경 변수 확인
  const missingEnv: string[] = []
  if (!requiredEnv.accessKeyId) missingEnv.push('NCP_ACCESS_KEY')
  if (!requiredEnv.secretAccessKey) missingEnv.push('NCP_SECRET_KEY')
  if (!requiredEnv.bucket) missingEnv.push('NCP_BUCKET')

  if (missingEnv.length > 0) {
    res.status(500).json({ 
      message: `환경 변수가 설정되지 않았습니다: ${missingEnv.join(', ')}` 
    })
    return
  }

  try {
    const { type, data } = req.body

    if (!type || !['albums', 'bulletins'].includes(type)) {
      res.status(400).json({ message: 'type은 "albums" 또는 "bulletins"여야 합니다.' })
      return
    }

    if (!data) {
      res.status(400).json({ message: 'data가 필요합니다.' })
      return
    }

    // 메타데이터를 JSON 파일로 저장
    const objectKey = `metadata/${type}.json`
    const jsonData = JSON.stringify(data, null, 2)

    await s3Client.send(
      new PutObjectCommand({
        Bucket: requiredEnv.bucket!,
        Key: objectKey,
        Body: jsonData,
        ContentType: 'application/json',
        ACL: 'public-read',
        CacheControl: 'no-cache' // 항상 최신 데이터 가져오기
      })
    )

    res.status(200).json({ 
      message: '메타데이터 저장 완료',
      type,
      count: Array.isArray(data) ? data.length : 1
    })
  } catch (error: any) {
    console.error('메타데이터 저장 오류:', error)
    res.status(500).json({ 
      message: '메타데이터 저장 실패',
      error: error.message 
    })
  }
}

