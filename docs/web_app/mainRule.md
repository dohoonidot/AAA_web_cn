# Web App Architecture Principles (web_app/src)

목표
- 코드 수정/개선/버그 추적/기능 추가를 체계적으로 수행하기 위한 구조 기준을 제공한다.
- 기능 동작 100% 보존을 전제로 리팩터링한다.

핵심 원칙
1) 단일 책임 (Single Responsibility)
- 한 파일은 한 가지 역할만 담당한다.
- UI 렌더링, 상태 관리, 데이터 로드, 도메인 규칙을 같은 파일에 섞지 않는다.

2) 레이어 분리
- pages: 라우팅 단위의 컨테이너. 데이터 로딩, 전역 상태 연결, 화면 구성을 조합한다.
- components: 프레젠테이셔널 컴포넌트. props 기반으로 렌더링하며 비즈니스 로직을 두지 않는다.
- hooks: 재사용 가능한 상태/효과 로직. UI에 의존하지 않는다.
- services: API 통신. HTTP, 인증/세션, IO만 담당한다.
- store: 전역 상태. 도메인 이벤트/상태 관리만 담당한다.
- types/utils: 타입 정의 및 순수 함수/헬퍼.

3) 데이터 흐름
- API 호출은 services 또는 *.data.ts에서만 수행한다.
- 컴포넌트는 데이터가 준비된 상태에서 props를 받아 렌더링한다.
- 변환/매핑 로직은 data 또는 utils로 이동한다.

4) 상태 분리
- 복잡한 UI 상태는 *.state.ts로 분리한다.
- 파생 값(derived)은 selector 함수로 만든다.
- side effect는 state/hook에서 처리하고 UI 파일은 호출만 한다.

5) 의존성 방향
- pages -> components/hooks/store/services/utils/types
- components -> hooks/utils/types
- hooks -> services/store/utils/types
- services -> utils/types
- utils/types는 어느 곳에서도 순환 의존을 만들지 않는다.

6) 파일 네이밍
- 컨테이너: FeaturePage.tsx
- UI 구성 요소: Feature.tsx
- 상태/도메인 로직: Feature.state.ts, Feature.data.ts, Feature.shared.ts
- 모달/다이얼로그: Feature.modals.tsx

7) 로깅/디버깅
- UI 파일의 console.log는 최소화한다.
- 필요 시 utils/logger 사용.

8) 리팩터링 규칙
- 기능 동작을 변경하지 않는다.
- 구조 변경만 수행한다.
- 변경 범위는 우선 핵심 페이지부터 단계적으로 확장한다.

개발 체크리스트 (항상 준수)
- 상태/사이드이펙트는 `*.state.ts(x)`로 이동하고 UI는 호출/렌더만 한다.
- `*.state`에서 JSX를 쓰면 반드시 `*.state.tsx` 확장자를 사용한다.
- UI에서 쓰는 파생값/목록(예: `workMenuItems`, `filteredSections`)은 state에서 생성해 반환한다.
- 라우팅/네비게이션은 state에서 처리하고 UI는 핸들러만 연결한다.
- `useMemo`만 쓰는 순수 표현 컴포넌트는 분리하지 않아도 된다.

적용 우선순위 (Phase 1)
- App.tsx
- ChatPage.tsx
- LeaveManagementPage.tsx
- PersonalCalendar.tsx
