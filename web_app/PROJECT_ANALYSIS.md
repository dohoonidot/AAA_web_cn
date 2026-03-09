# AAA_web 프로젝트 분석 문서

본 문서는 `AAA_web` 프로젝트의 기술 스택, 프레임워크, UI 구성 요소 그리고 주요 기능들을 분석하여 요약한 기술 명세입니다.

## 1. 프로젝트 개요 (Overview)
- **프로젝트 명**: AAA_web
- **개발 환경**: React 기반의 프론트엔드 웹 어플리케이션
- **주요 목적**: AI 기반 채팅 어시스턴트 기능과 사내/업무 관련 기능(근태 관리, 결재, 알림, 선물함 등)을 통합적으로 제공하는 서비스

## 2. 프레임워크 및 핵심 기술 스택 (Framework & Tech Stack)
본 프로젝트는 최신 React 구현체와 번들러를 사용해 빠른 성능과 개발자 경험을 제공합니다.
- **핵심 프레임워크**: React 19 (`react` v19.1.1)
- **빌드 툴**: Vite (`vite` v7.1.7) - 빠른 HMR 및 프로덕션 빌드 시스템
- **프로그래밍 언어**: TypeScript - 강력한 정적 타이핑 지원
- **상태 관리 (Global State)**: Zustand (`zustand` v5.0) - 보일러플레이트가 적은 경량/강력한 상태 관리 도구
- **라우팅 (Routing)**: React Router DOM v7 - 싱글 페이지 애플리케이션(SPA) 구성을 위한 라우팅
- **HTTP 통신 (Network)**: Axios (`axios`) 및 SSE(Server-Sent Events) 활용

## 3. UI 구현 방식 (UI & Styling)
모바일부터 데스크톱까지 일관된 UX를 제공하기 위한 모던 UI 라이브러리를 채택하고 있습니다.
- **UI 라이브러리 (컴포넌트)**: **Material-UI (MUI) v7**
  - `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers` (날짜/달력 선택기) 등을 적극 사용하였습니다.
- **스타일링 (CSS)**: `Emotion` (`@emotion/react`, `@emotion/styled`) 기반의 CSS-in-JS와 Vanilla CSS(`index.css`)를 혼용하여 고급스러운 Glassmorphism(유리 질감)이나 미려한 테마 처리에 적극 사용됩니다.
- **다크/라이트 모드 지원**: 배경과 내용의 대비를 자동으로 조절하고 테마간 전환이 자유롭도록 설계되었습니다.

## 4. 주요 기능 (Key Features)
### (1) AI 채팅 (Chat Assistant)
- **기능**: 사용자의 질문에 답을 제공하는 AI 챗봇
- **특징**: `react-markdown`과 `remark-gfm`을 통해 마크다운 문법을 파싱하고, `react-syntax-highlighter`로 코드 문법을 하이라이팅하여 가독성 높은 AI 답변을 출력합니다.

### (2) 근태 및 휴가 관리 (Leave Management)
- **기능**: 개인 휴가 신청, 취소 및 잔여 연차 조회
- **특징**: 달력을 통한 직관적인 날짜 관리 (`dayjs` 활용) 및 모바일/PC 모두에 맞춘 데이터 인터페이스 제공.

### (3) 관리자용 결재 시스템 (Approval System)
- **기능**: 임직원의 휴가 및 기타 기안에 대해 결재/반려 처리
- **특징**: URL パ라미터 처리 및 상세 모달 조회 기능 등을 통해 빠른 결재 흐름 유도.

### (4) 실시간 알림 (Real-time Notification)
- **기능**: 새로운 결재, 공지사항 발생 시 즉각적으로 토스트 및 알림함 트리거
- **특징**: 서버와의 `SSE 연동`을 통해 즉각 통신하며, 끊김 대비를 위한 폴링 시스템(30~60초) 백업 로직으로 신뢰성을 보장합니다.

### (5) 선물함 컴포넌트 (Gift Box)
- **기능**: 임직원 복지차원 혹은 보상 차원의 쿠폰/선물 획득 현황 조회
- **특징**: `react-confetti` 라이브러리를 사용해 선물 확인 시 폭죽이 터지는 동적 UI/UX를 제공.

## 5. 프로젝트 아키텍처 패턴 (Architecture Pattern)
- **비즈니스 로직 분리**: 화면을 렌더링하는 View(`.tsx`)와 상태/로직을 정의하는 State(`.state.ts`)를 분리하는 **커스텀 훅 패턴(Hook Pattern)**을 통해 유지보수성을 극대화하였습니다. (예: `ChatPage.tsx` / `ChatPage.state.ts`)
- **Store 기반 설계**: `store/` 디렉토리에 도메인별 Zustand Store(예: `notificationStore`, `chatStore`, `themeStore`)를 구성하여 전역 상태를 효과적으로 스토리지와 동기화 시킵니다.
- **로컬 스토리지 DB**: `dexie` (IndexedDB Wrapper)를 사용하여 클라이언트 단에서도 구조화된 데이터(채팅 기록 등) 캐시 관리를 돕습니다.

---
**보고일자**: 2026-03-01
