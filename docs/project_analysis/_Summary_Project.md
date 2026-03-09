# #aaa_web Project Summary

이 문서는 **AAA_web** 프로젝트의 전체 구조와 핵심 내용을 요약한 허브 문서입니다.

## 1. 프로젝트 개요
**AAA_web**은 React 19와 TypeScript를 기반으로 한 웹 애플리케이션으로, AI 채팅, 휴가 관리, 전자 결재, 선물함 등의 기능을 제공합니다. 상태 관리는 Zustand를 사용하며, 실시간 데이터 동기화를 위해 SSE(Server-Sent Events)를 적극적으로 활용합니다.

## 2. 핵심 기술 스택
| 구분 | 기술 | 비고 |
|------|------|------|
| **Core** | React 19, TypeScript, Vite | 최신 React 기능 및 빠른 빌드 환경 |
| **State** | Zustand | 전역 상태 관리 (가볍고 직관적) |
| **UI** | MUI (Material-UI) v7 | UI 컴포넌트 라이브러리 |
| **Network** | Axios | API 통신 (Interceptors 활용) |
| **Realtime** | SSE (Server-Sent Events) | 실시간 알림 및 데이터 푸시 |
| **DB** | Dexie (IndexedDB) | 로컬 데이터 저장소 |
| **Utils** | Day.js, Recharts | 날짜 처리 및 차트 시각화 |

## 3. 폴더 구조 및 역할
- **[[web_app/src/pages]]**: 라우팅 단위의 페이지 컴포넌트
  - [[ChatPage.tsx]] (AI 채팅), [[LeaveManagementPage.tsx]] (휴가 관리)
  - [[AdminLeaveApprovalPage.tsx]] (관리자 결재), [[LoginPage.tsx]] (로그인)
- **[[web_app/src/components]]**: 재사용 가능한 UI 컴포넌트
  - `leave`: 휴가 관련 ([[LeaveRequestDraftPanel.tsx]], [[LeaveApprovalListPanel.tsx]])
  - `admin`: 관리자 기능, `approval`: 결재 관련, `common`: 공통 UI
- **[[web_app/src/services]]**: API 통신 및 비즈니스 로직
  - [[api.ts]] (Axios 인스턴스), [[leaveService.ts]] (휴가 API)
  - [[authService.ts]] (인증), [[notificationStore.ts]] (알림 상태)
- **[[web_app/src/store]]**: Zustand 기반 전역 상태 저장소
  - [[notificationStore.ts]], [[chatStore.ts]], [[themeStore.ts]]
- **[[web_app/src/types]]**: TypeScript 타입 정의
- **[[web_app/src/App.state.ts]]**: 앱 전역 레벨의 상태 및 이벤트 핸들링 (SSE 수신 처리 등).

## 4. 서비스 흐름 (Service Flow)
1.  **초기화**: 앱 실행 시 `App.tsx`에서 라우팅 및 전역 Provider 설정.
2.  **인증**: `authService`를 통해 쿠키 기반 인증 수행. 로딩 시 `App.state.ts`에서 인증 상태 체크.
3.  **실시간 연결**: 로그인 성공 시 `useSseNotifications` 훅을 통해 SSE 연결 수립.
4.  **데이터 동기화**: SSE 이벤트 수신 시 `notificationStore` 업데이트 및 Toast 표시. 필요 시 API를 호출하여 데이터 최신화 (예: 알림함 동기화).

## 5. 상세 문서 연결
프로젝트에 대한 더 자세한 분석 내용은 아래 문서들을 참고하세요.

- **[[Deep_Dive]]**: 핵심 로직(API, 상태 관리, 결재 흐름)에 대한 상세 분석
- **[[Improvement_Ideas]]**: 리팩토링 제안 및 개선 아이디어
- **[[_Project_Map]]**: 프로젝트 모듈 간의 연결 관계 시각화

---
*Created by Gemini Agent*
