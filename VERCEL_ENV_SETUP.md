# Vercel 환경 변수 설정 가이드

## 필요한 환경 변수

다음 환경 변수들을 Vercel에 설정해야 합니다:

1. **NCP_ACCESS_KEY** - 네이버 클라우드 Access Key ID
2. **NCP_SECRET_KEY** - 네이버 클라우드 Secret Key
3. **NCP_BUCKET** - Object Storage 버킷 이름 (예: `sangmi`)
4. **NCP_CDN_DOMAIN** - CDN 서비스 도메인 (예: `rvrtufeoifdy28872225.gcdn.ntruss.com`)
5. **NCP_CDN_PATH_PREFIX** (선택) - CDN 원본 경로 (예: `/` 또는 `/albums`)
6. **NCP_REGION** (선택) - 리전 (기본값: `kr-standard`)
7. **NCP_ENDPOINT** (선택) - 엔드포인트 (기본값: `https://kr.object.ncloudstorage.com`)

## 설정 방법

### 1. Vercel 대시보드 접속
1. https://vercel.com 에 로그인
2. 프로젝트 선택 (`sangmi-catholic` 또는 해당 프로젝트)

### 2. 환경 변수 설정
1. 프로젝트 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭
3. 각 환경 변수를 추가:

#### 필수 환경 변수 추가:
```
Key: NCP_ACCESS_KEY
Value: [네이버 클라우드 Access Key ID]
Environment: Production, Preview, Development (모두 선택)

Key: NCP_SECRET_KEY
Value: [네이버 클라우드 Secret Key]
Environment: Production, Preview, Development (모두 선택)

Key: NCP_BUCKET
Value: sangmi
Environment: Production, Preview, Development (모두 선택)

Key: NCP_CDN_DOMAIN
Value: [CDN 도메인] (예: rvrtufeoifdy28872225.gcdn.ntruss.com)
Environment: Production, Preview, Development (모두 선택)
```

#### 선택적 환경 변수 (필요한 경우만):
```
Key: NCP_CDN_PATH_PREFIX
Value: / (또는 /albums - CDN 설정에 따라)
Environment: Production, Preview, Development

Key: NCP_REGION
Value: kr-standard
Environment: Production, Preview, Development

Key: NCP_ENDPOINT
Value: https://kr.object.ncloudstorage.com
Environment: Production, Preview, Development
```

### 3. 재배포
환경 변수를 추가한 후:
1. **Deployments** 탭으로 이동
2. 최신 배포 옆의 **⋯** 메뉴 클릭
3. **Redeploy** 선택
4. 또는 새로운 커밋을 푸시하면 자동 재배포됨

## 확인 방법

1. 환경 변수 설정 후 재배포 완료 대기 (1-2분)
2. 관리자 페이지 → 앨범 관리 → **🔗 연결 테스트** 버튼 클릭
3. 성공 메시지가 나오면 설정 완료!

## 문제 해결

### 여전히 "환경 변수 누락" 오류가 나는 경우:
1. **환경 변수가 모든 환경(Production, Preview, Development)에 설정되었는지 확인**
2. **재배포가 완료되었는지 확인** (Vercel 대시보드에서 배포 상태 확인)
3. **환경 변수 이름이 정확한지 확인** (대소문자 구분)
4. **Vercel Functions 로그 확인**:
   - Vercel 대시보드 → 프로젝트 → Functions 탭
   - `/api/upload` 함수의 로그 확인

### CDN 도메인 확인 방법:
1. 네이버 클라우드 콘솔 → CDN 서비스
2. 생성한 CDN 서비스 선택
3. **서비스 도메인** 확인 (예: `xxx.gcdn.ntruss.com`)

### 버킷 이름 확인 방법:
1. 네이버 클라우드 콘솔 → Object Storage
2. 버킷 목록에서 버킷 이름 확인 (예: `sangmi`)

