# #common_module Improvement Ideas

이 문서는 **AAA_web** 프로젝트의 코드 구조 개선 및 리팩토링 아이디어를 제안합니다.

## 1. `App.state.ts` 로직 분리 (Hook 분할)
- **현상**: `useAppContentState` 훅이 700라인을 넘어가며, 인증 체크, SSE 수신, 팝업 관리, 타이머 등 너무 많은 책임을 지고 있습니다.
- **제안**:
  - `useAuthSync`: 인증 상태 및 리프레시 로직 담당
  - `useNotificationSync`: SSE 수신 및 `notificationStore` 연동 담당
  - `usePopupManager`: 각종 팝업(생일, 선물, 이벤트) 상태 관리 담당
- **기대 효과**: `App.tsx`의 가독성이 향상되고, 각 기능별 테스트가 용이해집니다.

## 2. `leaveService.ts` 모듈화
- **현상**: 단일 파일 크기가 50KB 이상이며, 사용자/관리자 기능이 혼재되어 있습니다.
- **제안**:
  - `leaveQueryService.ts`: 조회 전용 (사용자/관리자 분리 가능)
  - `leaveCommandService.ts`: 신청, 취소, 승인 등 상태 변경 로직
  - `adminLeaveService.ts`: 관리자 전용 기능 (부서 현황, 승인 처리 등)
- **기대 효과**: 파일 크기를 줄이고, 관련 기능끼리 응집도를 높일 수 있습니다.

## 3. 알림 로직 중앙 집중화
- **현상**: 알림 처리 로직이 `notificationStore`, `App.state.ts`, `utils/notificationHelpers`에 분산되어 있습니다.
- **제안**: `NotificationManager` 클래스 또는 전용 훅을 만들어 SSE 수신부터 스토어 업데이트, Toast 표시까지의 흐름을 단일 진입점으로 관리합니다.

## 4. 공통 모듈화 가능성 #common_module
- **Utils**: `dateUtils`(Day.js 래퍼), `formatUtils` 등은 다른 프로젝트([[_Summary_Admin]])에서도 재사용 가능합니다.
- **Components**: `NotificationPanel`, `GiftArrivalPopup` 등은 UI 라이브러리로 분리하여 여러 앱에서 공유할 수 있습니다.

---
참고 문서: [[_Summary_Admin]]
