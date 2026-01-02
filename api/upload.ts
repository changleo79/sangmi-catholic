import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import Busboy from 'busboy'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

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

    // 파일 크기 제한 없음 (무제한)
    const busboy = Busboy({ headers: req.headers, limits: { files: 1 } })

    busboy.on('field', (name, value) => {
      if (name === 'albumId') {
        albumId = value
      }
    })

    busboy.on('file', (_name, file, info) => {
      const { filename, mimeType } = info
      const chunks: Buffer[] = []
      file.on('data', (chunk: Buffer) => chunks.push(chunk))
      // 파일 크기 제한 없음 (무제한)
      // file.on('limit', () => {
      //   reject(new Error('FILE_TOO_LARGE'))
      //   file.resume()
      // })
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
      sizeLimit: '50mb', // 최대한 크게 설정 (Vercel Pro 플랜 기준)
    },
  },
  maxDuration: 60, // 대용량 파일 업로드를 위해 시간 증가
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
    console.log('[upload] 요청 시작')
    const { albumId, files } = await parseMultipartForm(req)
    console.log('[upload] 파싱 완료:', { albumId, filesCount: files.length })

    if (!files.length) {
      console.error('[upload] 파일이 없음')
      res.status(400).json({ message: '업로드할 파일이 없습니다.' })
      return
    }

    // albumId가 'bulletins'인 경우 bulletins 폴더에 저장
    const folder = albumId === 'bulletins' 
      ? 'bulletins' 
      : (albumId || `draft-${Date.now()}`).replace(/[^a-zA-Z0-9-_]/g, '')
    
    console.log('[upload] 업로드 폴더:', folder, '버킷:', requiredEnv.bucket)

    const uploads = await Promise.all(
      files.map(async (file) => {
        console.log(`[upload] 파일 처리 시작: ${file.originalName} (${file.buffer.length} bytes, ${file.mimeType})`)
        const safeFileName = normaliseFileName(file.originalName || 'image')
        // bulletins 폴더인 경우 bulletins 경로 사용, 그 외는 albums 경로 사용
        const objectKey = folder === 'bulletins' 
          ? `bulletins/${safeFileName}`
          : `albums/${folder}/${safeFileName}`
        const isImage = file.mimeType?.startsWith('image/') || false

        try {
          console.log(`[upload] S3 업로드 시작: ${objectKey}`)
          // 원본 이미지 업로드
          await s3Client.send(
            new PutObjectCommand({
              Bucket: requiredEnv.bucket!,
              Key: objectKey,
              Body: file.buffer,
              ContentType: file.mimeType || 'image/jpeg',
              ACL: 'public-read',
              CacheControl: 'public, max-age=31536000, immutable' // CDN 캐싱 최적화 (1년)
            })
          )
          console.log(`[upload] S3 업로드 성공: ${objectKey}`)

          // CDN URL 생성 (원본)
          let cdnPath = objectKey
          if (cdnPathPrefix) {
            const prefix = cdnPathPrefix.replace(/^\/|\/$/g, '') // 앞뒤 슬래시 제거
            if (prefix && objectKey.startsWith(prefix + '/')) {
              cdnPath = objectKey.substring(prefix.length + 1)
            } else if (prefix && objectKey.startsWith(prefix)) {
              cdnPath = objectKey.substring(prefix.length)
            }
          }
          
          const cdnDomain = requiredEnv.cdnDomain.replace(/\/$/, '')
          const cdnUrl = `https://${cdnDomain}/${cdnPath}`

          // 이미지인 경우 썸네일 생성 (앨범과 주보 모두)
          let thumbnailUrl: string | undefined = undefined
          if (isImage) {
            // 앨범과 주보 모두 썸네일 생성 (성능 최적화 및 해상도 개선)
            try {
              // 주보는 300x400 (3:4 비율), 앨범은 200x200
              const thumbnailSize = folder === 'bulletins' 
                ? { width: 300, height: 400 } 
                : { width: 200, height: 200 }
              
              // 썸네일 생성 (cover-fit, WebP 포맷으로 압축, 품질 80%로 해상도 유지)
              const thumbnailBuffer = await sharp(file.buffer)
                .resize(thumbnailSize.width, thumbnailSize.height, {
                  fit: 'cover',
                  position: 'center'
                })
                .webp({ quality: 80 }) // 품질 80%로 해상도 유지
                .toBuffer()

              // 썸네일 키 생성 (앨범과 주보 모두)
              const thumbnailKey = `${folder}/thumbnails/${safeFileName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '.webp')}`
                
                await s3Client.send(
                  new PutObjectCommand({
                    Bucket: requiredEnv.bucket!,
                    Key: thumbnailKey,
                    Body: thumbnailBuffer,
                    ContentType: 'image/webp',
                    ACL: 'public-read',
                    CacheControl: 'public, max-age=31536000, immutable'
                  })
                )

                // 썸네일 CDN URL 생성
                let thumbnailCdnPath = thumbnailKey
                if (cdnPathPrefix) {
                  const prefix = cdnPathPrefix.replace(/^\/|\/$/g, '')
                  if (prefix && thumbnailKey.startsWith(prefix + '/')) {
                    thumbnailCdnPath = thumbnailKey.substring(prefix.length + 1)
                  } else if (prefix && thumbnailKey.startsWith(prefix)) {
                    thumbnailCdnPath = thumbnailKey.substring(prefix.length)
                  }
                }
                
                thumbnailUrl = `https://${cdnDomain}/${thumbnailCdnPath}`
                console.log(`[upload] 썸네일 생성 완료: ${thumbnailUrl}`)
              } catch (thumbnailError) {
                console.error(`[upload] 썸네일 생성 실패 (${file.originalName}):`, thumbnailError)
                // 썸네일 생성 실패 시 원본 URL 사용
                thumbnailUrl = cdnUrl
              }
          }

          return {
            url: cdnUrl,
            thumbnailUrl: thumbnailUrl,
            originalName: file.originalName,
            key: objectKey
          }
        } catch (uploadError) {
          console.error(`[upload] 파일 업로드 실패 (${file.originalName}):`, uploadError)
          const error = uploadError as any
          let errorMessage = error?.message || 'Unknown error'
          const errorCode = error?.Code || error?.code || ''
          const errorStatusCode = error?.$metadata?.httpStatusCode || error?.statusCode || ''
          
          console.error(`[upload] 에러 상세:`, {
            message: errorMessage,
            code: errorCode,
            statusCode: errorStatusCode,
            bucket: requiredEnv.bucket,
            objectKey,
            region,
            endpoint
          })
          
          // Access Denied 오류의 경우 더 자세한 정보 제공
          if (errorMessage.includes('Access Denied') || errorMessage.includes('403') || errorCode === 'AccessDenied' || errorStatusCode === 403) {
            errorMessage = `Access Denied (403) - 가능한 원인:\n` +
              `1. 버킷 이름이 잘못되었습니다 (현재: ${requiredEnv.bucket})\n` +
              `2. Access Key/Secret Key가 잘못되었거나 권한이 없습니다\n` +
              `3. 버킷이 존재하지 않거나 다른 리전에 있습니다\n` +
              `4. Object Storage 서비스가 활성화되지 않았습니다\n` +
              `5. 버킷의 공개 읽기 설정이 되어 있지 않습니다\n` +
              `\n확인 사항:\n` +
              `- 버킷 이름: ${requiredEnv.bucket}\n` +
              `- 리전: ${region}\n` +
              `- 엔드포인트: ${endpoint}\n` +
              `- Object Key: ${objectKey}\n` +
              `\nVercel 환경 변수 확인:\n` +
              `- NCP_ACCESS_KEY: ${requiredEnv.accessKeyId ? '설정됨' : '누락'}\n` +
              `- NCP_SECRET_KEY: ${requiredEnv.secretAccessKey ? '설정됨' : '누락'}\n` +
              `- NCP_BUCKET: ${requiredEnv.bucket || '누락'}\n` +
              `- NCP_CDN_DOMAIN: ${requiredEnv.cdnDomain || '누락'}`
          } else if (errorMessage.includes('NoSuchBucket') || errorCode === 'NoSuchBucket') {
            errorMessage = `버킷을 찾을 수 없습니다:\n` +
              `- 버킷 이름: ${requiredEnv.bucket}\n` +
              `- 리전: ${region}\n` +
              `- 엔드포인트: ${endpoint}\n` +
              `\n네이버 클라우드 플랫폼에서 버킷이 존재하는지 확인해 주세요.`
          } else if (errorMessage.includes('InvalidAccessKeyId') || errorCode === 'InvalidAccessKeyId') {
            errorMessage = `Access Key가 유효하지 않습니다:\n` +
              `- NCP_ACCESS_KEY 환경 변수를 확인해 주세요.\n` +
              `- 네이버 클라우드 플랫폼에서 Access Key가 활성화되어 있는지 확인해 주세요.`
          } else if (errorMessage.includes('SignatureDoesNotMatch') || errorCode === 'SignatureDoesNotMatch') {
            errorMessage = `Secret Key가 일치하지 않습니다:\n` +
              `- NCP_SECRET_KEY 환경 변수를 확인해 주세요.\n` +
              `- Access Key와 Secret Key가 올바른 쌍인지 확인해 주세요.`
          }
          
          throw new Error(`Failed to upload ${file.originalName}: ${errorMessage}`)
        }
      })
    )

    console.log(`[upload] 업로드 완료: ${uploads.length}개 파일`)
    res.status(200).json({ uploads })
  } catch (error) {
    // 파일 크기 제한 없음 (무제한)
    // if ((error as Error)?.message === 'FILE_TOO_LARGE') {
    //   res.status(413).json({ message: '파일 크기가 20MB를 초과했습니다. 이미지를 압축한 뒤 다시 시도해 주세요.' })
    //   return
    // }
    console.error('[upload] 이미지 업로드 실패:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('[upload] 에러 상세:', {
      message: errorMessage,
      stack: errorStack,
      env: {
        hasAccessKey: !!requiredEnv.accessKeyId,
        hasSecretKey: !!requiredEnv.secretAccessKey,
        bucket: requiredEnv.bucket,
        cdnDomain: requiredEnv.cdnDomain
      }
    })
    
    res.status(500).json({ 
      message: `이미지를 업로드하는 중 오류가 발생했습니다: ${errorMessage}`,
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    })
  }
}

