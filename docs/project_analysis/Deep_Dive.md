# #core_logic Deep Dive Analysis

이 문서는 **AAA_web** 프로젝트의 핵심 로직과 복잡한 모듈들을 심층 분석한 문서입니다.

## 1. API 통신 및 인증 ([[api.ts]])
- **설계 의도**: Flutter 앱과 동일한 백엔드 API를 사용하며, 쿠키 기반 인증을 채택했습니다. `withCredentials: true` 설정을 통해 쿠키를 자동으로 전송합니다.
- **주요 로직**:
  - `axios.create` 설정에서 `timeout`과 `headers`를 지정했습니다.
  - **Interceptors**: 요청/응답 시 로깅을 수행하고, 401 에러 발생 시 `/api/web/refresh` 엔드포인트를 호출하여 세션 갱신을 시도합니다. 갱신 실패 시 로그인 페이지로 리다이렉트합니다.
- **주의사항**: `Authorization` 헤더를 수동으로 제어하지 **마세요**. 쿠키 인증 방식이므로 토큰 관리 로직이 불필요합니다.

## 2. 상태 관리 및 실시간 알림 ([[notificationStore.ts]], [[App.state.ts]])
- **설계 의도**: 전역 상태 관리에 **Zustand**를 사용하여 가벼운 상태 관리를 구현했습니다. SSE(Server-Sent Events)를 통해 실시간 알림을 수신하고, 이를 Toast 및 알림 패널에 반영합니다.
- **주요 로직**:
  - **[[App.state.ts]]**: 전역적인 이벤트를 핸들링합니다. SSE 수신 시 `notificationStore`의 액션을 호출하거나, 특정 이벤트(예: `gift`, `birthday`)에 따라 팝업 상태를 변경합니다.
  - **[[notificationStore.ts]]**: 알림 목록, 읽음 처리, 알림 패널 UI 상태를 관리합니다. `loadAlertsFromApi` 액션을 통해 주기적으로 또는 이벤트 발생 시 데이터를 동기화합니다.
- **주의사항**: SSE 이벤트 타입(`event`)은 백엔드에서 전송하는 문자열과 정확히 일치해야 합니다. 새로운 이벤트 추가 시 `types/notification.ts`와 함께 업데이트해야 합니다.

## 3. 휴가 관리 로직 ([[leaveService.ts]])
- **설계 의도**: 앱 내 가장 복잡한 비즈니스 로직을 포함하고 있으며, 휴가 신청, 취소, 관리자 승인 기능 등을 제공합니다. Flutter 앱의 로직을 웹 환경에 맞춰 재구현했습니다.
- **주요 로직**:
  - 다양한 조회 API 제공: `getLeaveManagement`, `getMonthlyCalendar`, `getYearlyLeave` 등 사용자와 관리자용 API가 분리되어 있습니다.
  - 복합적인 데이터 처리: 휴가 일수 계산, 공휴일 체크 등 클라이언트 사이드에서 처리해야 할 로직들이 포함되어 있습니다.
- **주의사항**: 함수명이 Flutter 코드와 유사하게 유지되어 있으나, 파라미터 타입이나 반환값이 다를 수 있으므로 `src/types/leave.ts` 정의를 항상 확인해야 합니다.

## #analysis 결론
프로젝트는 **Zustand**와 **React Query**(또는 useEffect 기반 data fetching)의 조합을 통해 상태를 효율적으로 관리하고 있으며, **SSE**를 중심축으로 한 실시간 사용자 경험 제공에 초점이 맞춰져 있습니다. 향후 복잡도가 증가할 경우 `leaveService`를 기능별로 더 작게 분리하는 것을 고려해볼 만합니다.
