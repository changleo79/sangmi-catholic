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

    if (!type || !['albums', 'bulletins'].includes(type as string)) {
      res.status(400).json({ message: 'type은 "albums" 또는 "bulletins"여야 합니다.' })
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
        res.status(200).json({ data: [] })
        return
      }

      const data = JSON.parse(body)
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

