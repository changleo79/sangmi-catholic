import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Busboy from 'busboy'
import { randomUUID } from 'crypto'

type UploadedFile = {
  buffer: Buffer
  originalName: string
  mimeType: string
}

const DEFAULT_REGION = 'kr-standard'
const DEFAULT_ENDPOINT = 'https://kr.object.ncloudstorage.com'

const requiredEnv = {
  accessKeyId: process.env.NCP_ACCESS_KEY,
  secretAccessKey: process.env.NCP_SECRET_KEY,
  bucket: process.env.NCP_BUCKET,
  cdnDomain: process.env.NCP_CDN_DOMAIN
}

const cdnPathPrefix = (process.env.NCP_CDN_PATH_PREFIX || '').replace(/^\//, '').replace(/\/$/, '')

const region = process.env.NCP_REGION || DEFAULT_REGION
const endpoint = process.env.NCP_ENDPOINT || DEFAULT_ENDPOINT

const s3Client =
  requiredEnv.accessKeyId && requiredEnv.secretAccessKey
    ? new S3Client({
        region,
        endpoint,
        credentials: {
          accessKeyId: requiredEnv.accessKeyId,
          secretAccessKey: requiredEnv.secretAccessKey
        }
      })
    : null

function normaliseFileName(name: string): string {
  const extension = name.includes('.') ? name.split('.').pop() : ''
  const base = name.replace(/\.[^/.]+$/, '')
  const safeBase = base
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
  const suffix = randomUUID().slice(0, 8)
  const safeName = `${safeBase || 'image'}-${suffix}`
  return extension ? `${safeName}.${extension}` : safeName
}

function parseMultipartForm(req: VercelRequest): Promise<{ albumId: string; files: UploadedFile[] }> {
  return new Promise((resolve, reject) => {
    const files: UploadedFile[] = []
    let albumId = ''

    // Vercel 서버리스 함수 제한: Hobby 4.5MB, Pro 50MB
    // 요청 본문 크기 제한을 고려하여 더 큰 파일도 허용 (20MB)
    const busboy = Busboy({ headers: req.headers, limits: { fileSize: 20 * 1024 * 1024, files: 1 } })

    busboy.on('field', (name, value) => {
      if (name === 'albumId') {
        albumId = value
      }
    })

    busboy.on('file', (_name, file, info) => {
      const { filename, mimeType } = info
      const chunks: Buffer[] = []
      file.on('data', (chunk: Buffer) => chunks.push(chunk))
      file.on('limit', () => {
        reject(new Error('FILE_TOO_LARGE'))
        file.resume()
      })
      file.on('end', () => {
        files.push({
          buffer: Buffer.concat(chunks),
          originalName: filename,
          mimeType
        })
      })
    })

    busboy.on('finish', () => {
      resolve({ albumId, files })
    })

    busboy.on('error', (error) => reject(error))

    req.pipe(busboy)
  })
}

// Vercel 서버리스 함수 설정
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
  maxDuration: 30,
}

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

  // 환경 변수 확인 및 상세 에러 메시지
  const missingEnv: string[] = []
  if (!requiredEnv.accessKeyId) missingEnv.push('NCP_ACCESS_KEY')
  if (!requiredEnv.secretAccessKey) missingEnv.push('NCP_SECRET_KEY')
  if (!requiredEnv.bucket) missingEnv.push('NCP_BUCKET')
  if (!requiredEnv.cdnDomain) missingEnv.push('NCP_CDN_DOMAIN')

  if (missingEnv.length > 0) {
    console.error('환경 변수 누락:', missingEnv)
    res.status(500).json({ 
      message: `Storage configuration is missing: ${missingEnv.join(', ')}. Please set these environment variables in Vercel.`,
      missingEnv 
    })
    return
  }

  if (!s3Client) {
    console.error('S3 클라이언트 초기화 실패')
    res.status(500).json({ message: 'S3 client initialization failed. Please check NCP_ACCESS_KEY and NCP_SECRET_KEY.' })
    return
  }

  try {
    const { albumId, files } = await parseMultipartForm(req)

    if (!files.length) {
      res.status(400).json({ message: '업로드할 파일이 없습니다.' })
      return
    }

    const folder = (albumId || `draft-${Date.now()}`).replace(/[^a-zA-Z0-9-_]/g, '')

    const uploads = await Promise.all(
      files.map(async (file) => {
        const safeFileName = normaliseFileName(file.originalName || 'image')
        const objectKey = `albums/${folder}/${safeFileName}`

        try {
          await s3Client.send(
            new PutObjectCommand({
              Bucket: requiredEnv.bucket!,
              Key: objectKey,
              Body: file.buffer,
              ContentType: file.mimeType || 'image/jpeg',
              ACL: 'public-read'
            })
          )

          // CDN URL 생성
          // objectKey 예: "albums/draft-123/image.jpg"
          // CDN 원본 경로가 "/"인 경우: cdnPath = "albums/draft-123/image.jpg"
          // CDN 원본 경로가 "/albums"인 경우: cdnPath = "draft-123/image.jpg" (albums 제거)
          let cdnPath = objectKey
          if (cdnPathPrefix) {
            const prefix = cdnPathPrefix.replace(/^\/|\/$/g, '') // 앞뒤 슬래시 제거
            if (prefix && objectKey.startsWith(prefix + '/')) {
              cdnPath = objectKey.substring(prefix.length + 1)
            } else if (prefix && objectKey.startsWith(prefix)) {
              cdnPath = objectKey.substring(prefix.length)
            }
          }
          
          // CDN 도메인에 슬래시가 없도록 처리
          const cdnDomain = requiredEnv.cdnDomain.replace(/\/$/, '')
          const cdnUrl = `https://${cdnDomain}/${cdnPath}`

          return {
            url: cdnUrl,
            originalName: file.originalName,
            key: objectKey
          }
        } catch (uploadError) {
          console.error(`파일 업로드 실패 (${file.originalName}):`, uploadError)
          const error = uploadError as any
          let errorMessage = error?.message || 'Unknown error'
          
          // Access Denied 오류의 경우 더 자세한 정보 제공
          if (errorMessage.includes('Access Denied') || errorMessage.includes('403')) {
            errorMessage = `Access Denied - 가능한 원인:\n` +
              `1. 버킷 이름이 잘못되었습니다 (현재: ${requiredEnv.bucket})\n` +
              `2. Access Key/Secret Key가 잘못되었거나 권한이 없습니다\n` +
              `3. 버킷이 존재하지 않거나 다른 리전에 있습니다\n` +
              `4. Object Storage 서비스가 활성화되지 않았습니다\n` +
              `\n확인 사항:\n` +
              `- 버킷 이름: ${requiredEnv.bucket}\n` +
              `- 리전: ${region}\n` +
              `- 엔드포인트: ${endpoint}`
          }
          
          throw new Error(`Failed to upload ${file.originalName}: ${errorMessage}`)
        }
      })
    )

    res.status(200).json({ uploads })
  } catch (error) {
    if ((error as Error)?.message === 'FILE_TOO_LARGE') {
      res.status(413).json({ message: '파일 크기가 20MB를 초과했습니다. 이미지를 압축한 뒤 다시 시도해 주세요.' })
      return
    }
    console.error('이미지 업로드 실패:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ 
      message: `이미지를 업로드하는 중 오류가 발생했습니다: ${errorMessage}`,
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    })
  }
}

