# 상미성당 웹사이트 배포 가이드

## 배포 방법

이 프로젝트는 React + Vite로 만들어졌으며, 여러 플랫폼에 배포할 수 있습니다.

### 1. 빌드하기

먼저 프로젝트를 빌드합니다:

```bash
npm run build
```

빌드가 완료되면 `dist` 폴더에 배포용 파일이 생성됩니다.

### 2. 배포 플랫폼 선택

#### 방법 A: Vercel (추천 - 가장 간단)

1. [Vercel](https://vercel.com)에 가입
2. GitHub에 프로젝트를 푸시
3. Vercel에서 "New Project" 클릭
4. GitHub 저장소 선택
5. 자동으로 설정 감지됨
6. "Deploy" 클릭

**장점:**
- 무료
- 자동 HTTPS
- 자동 배포 (GitHub push 시)
- 빠른 속도

#### 방법 B: Netlify

1. [Netlify](https://www.netlify.com)에 가입
2. GitHub에 프로젝트를 푸시
3. Netlify에서 "Add new site" → "Import an existing project"
4. GitHub 저장소 선택
5. Build command: `npm run build`
6. Publish directory: `dist`
7. "Deploy site" 클릭

**장점:**
- 무료
- 자동 HTTPS
- 자동 배포
- 폼 제출 기능

#### 방법 C: GitHub Pages

1. GitHub에 프로젝트를 푸시
2. `package.json`에 배포 스크립트 추가:
```json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}
```
3. `npm install -g gh-pages` 설치
4. `npm run deploy` 실행

**참고:** React Router를 사용하므로 `404.html` 파일이 필요합니다.

#### 방법 D: 일반 웹 호스팅

1. `npm run build` 실행
2. `dist` 폴더의 모든 파일을 호스팅 서버의 웹 루트에 업로드
3. 서버에서 SPA 라우팅을 지원하도록 설정 (모든 요청을 `index.html`로 리다이렉트)

### 3. 환경 변수 설정 (필요시)

현재는 환경 변수가 없지만, 추후 관리자 기능 추가 시 필요할 수 있습니다.

### 4. 도메인 연결 (선택)

배포 후 무료 도메인을 받거나, 자신의 도메인을 연결할 수 있습니다.

## 주의사항

- 빌드 전에 `src/data/notices.ts`와 `src/data/albums.ts`의 내용이 최신인지 확인
- 이미지 파일은 `사진파일` 폴더에 있으므로 빌드 시 포함됨
- React Router를 사용하므로 모든 경로가 `index.html`로 리다이렉트되어야 함

## 빠른 시작 (Vercel)

1. GitHub에 프로젝트 푸시
2. [vercel.com](https://vercel.com) 접속
3. "Import Project" 클릭
4. GitHub 저장소 선택
5. 자동 감지된 설정 확인
6. "Deploy" 클릭

배포가 완료되면 몇 분 안에 웹사이트가 공개됩니다!


