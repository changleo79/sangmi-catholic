# Access Denied 오류 해결 가이드

## 오류 메시지
```
Access Denied
Failed to upload [파일명]: Access Denied
```

## 가능한 원인 및 해결 방법

### 1. 버킷 이름 확인
**확인 방법:**
1. 네이버 클라우드 콘솔 → Object Storage → 버킷
2. 버킷 목록에서 정확한 이름 확인

**해결:**
- Vercel 환경 변수 `NCP_BUCKET`에 정확한 버킷 이름 입력
- 예: `sangmi` (대소문자 구분)

### 2. Access Key/Secret Key 권한 확인
**확인 방법:**
1. 네이버 클라우드 콘솔 → Platform → Management → API 인증키 관리
2. 사용 중인 인증키 확인
3. 해당 인증키가 Object Storage 접근 권한이 있는지 확인

**해결:**
- Object Storage 서비스에 접근 권한이 있는 인증키 사용
- 필요시 새 인증키 발급 후 Vercel에 업데이트

### 3. 버킷 존재 여부 및 리전 확인
**확인 방법:**
1. 네이버 클라우드 콘솔 → Object Storage → 버킷
2. 버킷이 생성되어 있는지 확인
3. 버킷의 리전 확인 (예: KR, US 등)

**해결:**
- 버킷이 없으면 생성
- 리전이 다르면 Vercel 환경 변수 `NCP_REGION` 확인/수정
  - 한국 리전: `kr-standard`
  - 미국 리전: `us-standard`

### 4. Object Storage 서비스 활성화 확인
**확인 방법:**
1. 네이버 클라우드 콘솔 → Services → Storage → Object Storage
2. 서비스 상태 확인

**해결:**
- 서비스가 비활성화되어 있으면 활성화

### 5. 버킷 접근 권한 확인
**확인 방법:**
1. Object Storage → 버킷 선택 → 권한 설정
2. Public Read 권한 확인

**해결:**
- 버킷 또는 폴더에 Public Read 권한 설정
- 또는 ACL 설정 확인

### 6. 엔드포인트 확인
**확인 방법:**
- 현재 설정된 엔드포인트: `https://kr.object.ncloudstorage.com`
- 리전에 맞는 엔드포인트 사용

**해결:**
- 한국 리전: `https://kr.object.ncloudstorage.com`
- 미국 리전: `https://us.object.ncloudstorage.com`
- Vercel 환경 변수 `NCP_ENDPOINT` 확인/수정

## 체크리스트

다음 항목들을 순서대로 확인하세요:

- [ ] 버킷이 생성되어 있고 이름이 정확한가?
- [ ] Vercel 환경 변수 `NCP_BUCKET`에 정확한 버킷 이름이 입력되어 있는가?
- [ ] Access Key와 Secret Key가 올바른가?
- [ ] 인증키에 Object Storage 접근 권한이 있는가?
- [ ] 버킷의 리전과 `NCP_REGION` 환경 변수가 일치하는가?
- [ ] Object Storage 서비스가 활성화되어 있는가?
- [ ] 버킷에 Public Read 권한이 설정되어 있는가?
- [ ] `NCP_ENDPOINT`가 리전에 맞게 설정되어 있는가?
- [ ] 환경 변수 변경 후 재배포를 했는가?

## 단계별 해결 방법

### Step 1: 버킷 확인 및 생성
1. 네이버 클라우드 콘솔 → Object Storage → 버킷
2. 버킷이 없으면 "버킷 생성" 클릭
3. 버킷 이름: `sangmi` (또는 원하는 이름)
4. 리전 선택: 한국 리전 (KR)
5. 생성 완료

### Step 2: 버킷 권한 설정
1. 생성한 버킷 선택
2. 권한 설정 → Public Read 권한 부여
3. 또는 `albums` 폴더에 Public Read 권한 부여

### Step 3: Vercel 환경 변수 확인
다음 환경 변수들이 정확히 설정되어 있는지 확인:

```
NCP_ACCESS_KEY = [정확한 Access Key ID]
NCP_SECRET_KEY = [정확한 Secret Key]
NCP_BUCKET = sangmi (버킷 이름과 정확히 일치)
NCP_CDN_DOMAIN = [CDN 도메인]
NCP_REGION = kr-standard (한국 리전인 경우)
NCP_ENDPOINT = https://kr.object.ncloudstorage.com (한국 리전인 경우)
```

### Step 4: 재배포
1. Vercel 대시보드 → Deployments
2. 최신 배포 → ⋯ → Redeploy
3. 또는 새 커밋 푸시

### Step 5: 테스트
1. 관리자 페이지 → 앨범 관리
2. 🔗 연결 테스트 버튼 클릭
3. 결과 확인

## 여전히 문제가 있는 경우

1. **Vercel Functions 로그 확인:**
   - Vercel 대시보드 → 프로젝트 → Functions
   - `/api/upload` 함수의 로그에서 상세 에러 확인

2. **네이버 클라우드 콘솔 로그 확인:**
   - Object Storage → 모니터링 → 접근 로그

3. **인증키 재발급:**
   - 새 인증키 발급 후 Vercel에 업데이트
   - 재배포

