# 포트 정리

## 1. 한국지사 포트 정리

## 기준

이 문서는 현재 `web_app` 코드와 설정 파일 기준으로만 정리합니다.

## 한눈에 보기

| 포트 | 구분 | 용도 | 현재 상태 |
|------|------|------|-----------|
| `5173` | 로컬 개발 | Vite 프론트 개발 서버 | `npm run dev` 시 사용 |
| `8060` | API (개발) | 한국지사 백엔드 API 서버 (개발) | `mode=development` 기본 API 대상 |
| `8080` | API (운영) | 한국지사 백엔드 API 서버 (운영) | `mode=production` 기본 API 대상 |
| `443` | 운영 | 프론트 HTTPS 서버 | 운영 배포 기본 포트 |
| `80` | 운영 | HTTP → HTTPS 리다이렉트 | 443으로 전달 |
| `8443` | 운영 보조 | PM2 개발용 HTTPS 포트 | 선택적 개발 환경 포트 |

## 포트별 설명

### 1. `5173`

- 역할: 프론트 로컬 개발 서버
- 실행: `npm run dev`
- 접속 예시: `http://localhost:5173`
- 설정 위치:
  - `package.json` → `"dev": "vite --port 5173 --strictPort"`
  - `vite.config.ts` → `server.port = 5173`

### 2. `8060` (개발 API)

- 역할: 한국지사 백엔드 API 서버 (개발 환경)
- 기본값: `https://ai2great.com:8060`
- 적용 조건: `npm run dev` 또는 `npm run build:dev` (`mode=development`)
- 용도:
  - `/api`
  - `/sse`
  - `/streamChat/*`
  - `/leave/*`
  - 기타 Vite proxy 대상 전체 API
- 설정 위치:
  - `vite.config.ts` → `API_TARGET` (mode=development)

### 3. `8080` (운영 API)

- 역할: 한국지사 백엔드 API 서버 (운영 환경)
- 기본값: `https://ai2great.com:8080`
- 적용 조건: `npm run build` (`mode=production`)
- 용도: 개발 API와 동일한 엔드포인트, 운영 서버 대상
- 설정 위치:
  - `vite.config.ts` → `API_TARGET` (mode=production)

### 4. `443`

- 역할: 운영 프론트 HTTPS 서버
- 용도: 빌드된 React 앱 배포
- 실행 주체:
  - `server.js`
  - `ecosystem.config.js`
- 특징:
  - SSL 인증서 사용 (`fullchain.pem` / `privkey.key`)
  - 운영 기본 포트

### 5. `80`

- 역할: HTTP 요청 진입 포트
- 용도: 들어온 요청을 HTTPS로 리다이렉트
- 동작: `http://...` 접속 시 `https://...`로 301 리다이렉트
- 설정 위치:
  - `server.js` → `HTTP_PORT = 80`

### 6. `8443`

- 역할: PM2 개발 환경용 HTTPS 포트
- 용도: 운영 서버 설정에서 개발 모드로 띄울 때 사용
- 설정 위치:
  - `ecosystem.config.js` → `env_development.PORT = 8443`

## 흐름 정리

| 상황 | 접속 포트 | 설명 |
|------|-----------|------|
| 프론트 로컬 개발 | `5173` | 개발자가 브라우저에서 보는 화면 |
| 로컬 개발 API 호출 | `8060` | 프론트가 호출하는 개발 API 서버 |
| 운영 API 호출 | `8080` | 빌드 후 프론트가 호출하는 운영 API 서버 |
| 운영 HTTPS 접속 | `443` | 실제 배포 웹 접속 포트 |
| 운영 HTTP 접속 | `80` | HTTPS로 넘기는 리다이렉트 포트 |
| 운영 개발 모드 HTTPS | `8443` | PM2 개발 설정용 보조 포트 |

## 파일별 근거

| 파일 | 확인 내용 |
|------|-----------|
| `web_app/package.json` | `"dev": "vite --port 5173 --strictPort"` |
| `web_app/vite.config.ts` | `server.port = 5173`, 개발 API `ai2great.com:8060`, 운영 API `ai2great.com:8080` |
| `web_app/server.js` | 운영 서버 포트 `443`, 리다이렉트 포트 `80` |
| `web_app/ecosystem.config.js` | PM2 운영 `443`, 개발용 `8443` |

## 빠른 요약

- 프론트 개발: `5173`
- API 서버 (개발): `8060`
- API 서버 (운영): `8080`
- 운영 HTTPS: `443`
- HTTP 리다이렉트: `80`
- PM2 개발용 HTTPS: `8443`

---

## 2. 중국지사 포트 정리

## 기준

이 문서는 현재 `web_app` 코드와 설정 파일 기준으로만 정리합니다.

## 한눈에 보기

| 포트 | 구분 | 용도 | 현재 상태 |
|------|------|------|-----------|
| `5273` | 로컬 개발 | Vite 프론트 개발 서버 | `npm run dev` 시 사용 |
| `8180` | API | 중국지사 백엔드 API 서버 | 프론트의 기본 API 대상 |
| `443` | 운영 | 프론트 HTTPS 서버 | 운영 배포 기본 포트 |
| `80` | 운영 | HTTP → HTTPS 리다이렉트 | 443으로 전달 |
| `8443` | 운영 보조 | PM2 개발용 HTTPS 포트 | 선택적 개발 환경 포트 |

## 포트별 설명

### 1. `5273`

- 역할: 프론트 로컬 개발 서버
- 실행: `npm run dev`
- 접속 예시: `http://localhost:5273`
- 설정 위치:
  - `package.json`
  - `vite.config.ts`

### 2. `8180`

- 역할: 중국지사 API 서버
- 기본값: `https://localhost:8180`
- 용도:
  - `/api`
  - `/sse`
  - `/leave`
  - 기타 Vite proxy 대상 API
- 설정 위치:
  - `vite.config.ts`
  - `src/config/env.config.ts`
  - `scripts/sync-env.cjs`

### 3. `443`

- 역할: 운영 프론트 HTTPS 서버
- 용도: 빌드된 React 앱 배포
- 실행 주체:
  - `server.js`
  - `ecosystem.config.js`
- 특징:
  - SSL 인증서 사용
  - 운영 기본 포트

### 4. `80`

- 역할: HTTP 요청 진입 포트
- 용도: 들어온 요청을 HTTPS로 리다이렉트
- 동작: `http://...` 접속 시 `https://...`로 이동
- 설정 위치:
  - `server.js`

### 5. `8443`

- 역할: PM2 개발 환경용 HTTPS 포트
- 용도: 운영 서버 설정에서 개발 모드로 띄울 때 사용
- 설정 위치:
  - `ecosystem.config.js`

## 흐름 정리

| 상황 | 접속 포트 | 설명 |
|------|-----------|------|
| 프론트 로컬 개발 | `5273` | 개발자가 브라우저에서 보는 화면 |
| 로컬/개발 API 호출 | `8180` | 프론트가 호출하는 API 서버 |
| 운영 HTTPS 접속 | `443` | 실제 배포 웹 접속 포트 |
| 운영 HTTP 접속 | `80` | HTTPS로 넘기는 리다이렉트 포트 |
| 운영 개발 모드 HTTPS | `8443` | PM2 개발 설정용 보조 포트 |

## 파일별 근거

| 파일 | 확인 내용 |
|------|-----------|
| `web_app/package.json` | `vite --port 5273 --strictPort` |
| `web_app/vite.config.ts` | `server.port = 5273`, API 대상 `https://localhost:8180` |
| `web_app/src/config/env.config.ts` | 중국지사 API 단일 포트 `8180` |
| `web_app/server.js` | 운영 서버 포트 `443`, 리다이렉트 포트 `80` |
| `web_app/ecosystem.config.js` | PM2 운영 `443`, 개발용 `8443` |

## 빠른 요약

- 프론트 개발: `5273`
- API 서버: `8180`
- 운영 HTTPS: `443`
- HTTP 리다이렉트: `80`
- PM2 개발용 HTTPS: `8443`

---

## 3. 어드민웹 포트 정리

## 기준

이 문서는 현재 `AAA_admin` 코드와 설정 파일 기준으로만 정리합니다.

## 한눈에 보기

| 포트 | 구분 | 용도 | 현재 상태 |
|------|------|------|-----------|
| `3000` | 로컬 개발 | Express 어드민 웹 서버 (개발) | `npm run dev` 시 사용 |
| `9988` | 서버 배포 | Express 어드민 웹 서버 (운영) | `.env`에 `PORT=9988` 설정 |
| `9999` | 기본 폴백 | Express 기본값 (`.env` 미설정 시) | 코드 내 `process.env.PORT \|\| 9999` |
| `8060` | 외부 API | 한국지사 백엔드 API 서버 (upstream) | 휴가·로그인·사용자 관리 등 전 API 프록시 대상 |
| `9999` | 외부 API | 선물 전송 API 서버 (gift upstream) | 선물보내기 전용 프록시 대상 |
| `5432` | DB | PostgreSQL 데이터베이스 | 사용자 조회·대시보드·관리자 활동 등 직접 DB 쿼리 |

## 포트별 설명

### 1. `3000` (로컬 개발)

- 역할: 개발 환경 Express 서버 포트
- 실행: `npm run dev` → `dev-runner.js` → nodemon
- 접속 예시: `http://localhost:3000`
- 동작: dev-runner가 기존 3000 포트 점유 프로세스를 kill 후 nodemon으로 서버 기동
- 설정 위치:
  - `nodemon.json` → `env.PORT = "3000"`
  - `scripts/dev-runner.js` → `process.env.PORT || 3000`

### 2. `9988` (서버 배포)

- 역할: 운영 서버 Express 포트
- 실행: `npm start` → `node server/server.js`
- 접속 예시: `http://[서버IP]:9988`
- 바인딩: `0.0.0.0` (모든 네트워크 인터페이스)
- 설정 위치:
  - `.env` → `PORT=9988`
  - `server/server.js` → `process.env.PORT || 9999`

### 3. `9999` (기본 폴백)

- 역할: `.env`에 PORT가 설정되지 않았을 때의 기본값
- 적용 조건: `.env` 파일 없이 `npm start` 실행 시
- 설정 위치:
  - `server/server.js` 22행 → `const PORT = process.env.PORT || 9999;`
- 참고: `.env.example`에서는 `9998`을 배포 기본값으로 안내

### 4. `8060` (Upstream API - 휴가·사용자 관리)

- 역할: 한국지사 백엔드 API 서버 (HTTPS)
- 대상 호스트: `ai2great.com:8060`
- 용도: Express 서버가 클라이언트 요청을 받아서 이 서버로 프록시
- 프록시 대상 API:
  - `/admin/login` - 로그인
  - `/admin/createUser`, `/admin/updateUser`, `/admin/deleteUser` - 사용자 CRUD
  - `/admin/initPassword` - 비밀번호 초기화
  - `/admin/leave/*` - 휴가 승인/반려/승인자 지정/삭제/이력 등
  - `/leave/grant/*` - 휴가 부여 요청/목록/승인/메모
  - `/leave/user/getApprover` - 승인자 목록
  - `/api/getDepartmentList` - 부서 목록
  - `/api/getDepartmentMembers` - 부서원 목록
  - `/api/getUpdatePrivacyCount` - 개인정보 동의 추이
  - `/api/getFileUrl` - 첨부파일 URL (IP 직접 연결: `211.43.205.49`)
- 설정 위치:
  - `.env` → `UPSTREAM_HOST=ai2great.com`, `UPSTREAM_PORT=8060`
  - `server/server.js` → `const UPSTREAM_PORT = Number(process.env.UPSTREAM_PORT || 8060);`

### 5. `9999` (Gift Upstream API - 선물보내기)

- 역할: 선물 전송 전용 API 서버 (HTTP/HTTPS)
- 대상 호스트: `211.43.205.49:9999`
- 용도: 선물보내기 기능에서 외부 발송 API 호출
- 프록시 대상 API:
  - `/send_gift` - 선물 발송
- 특징: HTTP 먼저 시도, 실패 시 HTTPS로 재시도
- 설정 위치:
  - `.env` → `GIFT_UPSTREAM_HOST=211.43.205.49`, `GIFT_UPSTREAM_PORT=9999`
  - `server/controllers/gifts.controller.js` → `GIFT_UPSTREAM_PORT`

### 6. `5432` (PostgreSQL DB)

- 역할: 데이터베이스 직접 연결
- 대상 호스트: `211.43.205.49:5432`
- DB명: `aiagent`
- 용도: 사용자 정보 조회, 대시보드 통계, 대화 목록, 관리자 활동 로그 등
- 설정 위치:
  - `.env` → `PGHOST=211.43.205.49`, `PGPORT=5432`, `PGDATABASE=aiagent`
  - `server/config/db.js` → `new Pool({ port: process.env.PGPORT || 5432 })`

## 흐름 정리

| 상황 | 접속 포트 | 설명 |
|------|-----------|------|
| 로컬 개발 접속 | `3000` | `npm run dev` → 브라우저에서 접속하는 화면 |
| 운영 서버 접속 | `9988` | `npm start` → 배포된 어드민 웹 접속 |
| 휴가·사용자 API 호출 | `8060` | Express → `ai2great.com:8060` HTTPS 프록시 |
| 선물 API 호출 | `9999` | Express → `211.43.205.49:9999` HTTP/HTTPS 프록시 |
| DB 쿼리 | `5432` | Express → `211.43.205.49:5432` PostgreSQL 직접 연결 |

## 파일별 근거

| 파일 | 확인 내용 |
|------|-----------|
| `.env` | `PORT=9988`, `UPSTREAM_PORT=8060`, `GIFT_UPSTREAM_PORT=9999`, `PGPORT=5432` |
| `.env.example` | 배포 기본값 `9998` 안내, 로컬 테스트 `3003` 안내 |
| `nodemon.json` | 개발 환경 `PORT=3000` 주입 |
| `scripts/dev-runner.js` | `PORT || 3000` 포트 kill 후 nodemon 기동 |
| `server/server.js` | `PORT || 9999`, `UPSTREAM_PORT || 8060`, 바인딩 `0.0.0.0` |
| `server/config/db.js` | `PGPORT || 5432` PostgreSQL 연결 |
| `server/controllers/gifts.controller.js` | `GIFT_UPSTREAM_PORT || 9999` 선물 API 프록시 |
| `package.json` | `start` → `node server/server.js`, `dev` → `node scripts/dev-runner.js` |

## 빠른 요약

- 어드민웹 개발: `3000`
- 어드민웹 운영: `9988`
- 휴가·사용자 API (upstream): `8060`
- 선물 API (gift upstream): `9999`
- PostgreSQL DB: `5432`

---

## 4. 전체 비교 표

| 구분 | 사용 포트 | 어디에 쓰는지 |
|------|-----------|---------------|
| 한국지사 | `5173`, `8060`, `8080`, `443`, `80`, `8443` | `5173`은 Vite 프론트 로컬 개발 서버, `8060`은 개발 API 서버, `8080`은 운영 API 서버, `443`은 운영 HTTPS 서버, `80`은 HTTP에서 HTTPS로 넘기는 리다이렉트 포트, `8443`은 PM2 개발 환경용 HTTPS 포트 |
| 중국지사 | `5273`, `8180`, `443`, `80`, `8443` | `5273`은 Vite 프론트 로컬 개발 서버, `8180`은 중국지사 API 서버, `443`은 운영 HTTPS 서버, `80`은 HTTP에서 HTTPS로 넘기는 리다이렉트 포트, `8443`은 PM2 개발 환경용 HTTPS 포트 |
| 어드민웹 | `3000`, `9988`, `9999`, `8060`, `5432` | `3000`은 로컬 개발 Express 서버, `9988`은 운영 Express 서버, `9999`는 기본 폴백 포트이자 선물 API upstream 포트, `8060`은 휴가·로그인·사용자 관리용 upstream API 포트, `5432`는 PostgreSQL DB 직접 연결 포트 |
