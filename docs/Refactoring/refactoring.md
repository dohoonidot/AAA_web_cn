# 책임 분리 리팩토링 전후 비교 문서

이 문서는 다음 3개 영역을 **리팩토링 전/후**로 비교하고, 무엇이 어떻게 좋아졌는지와 왜 이렇게 했는지를 학습용으로 상세히 설명합니다.

대상
- `ChatArea` (채팅 화면)
- `TotalCalendar` (전체 휴가 달력)
- `ElectronicApprovalDraftPanel` (전자결재 상신 패널)

---

## 1) 리팩토링의 핵심 목표

### 문제 상황(공통)
- 한 파일에 **데이터 로딩 + 상태 관리 + 이벤트 처리 + UI 렌더링 + 모달 처리**가 동시에 들어있음
- 파일이 커지고 복잡해져서 **수정 영향 범위가 불명확**
- UI를 손보면 로직이 망가질 수 있고, 로직 수정하면 UI가 깨지는 구조

### 목표
- 각 역할을 파일 단위로 명확히 분리
- 수정 시 **영향 범위를 최소화**
- 재사용/확장 가능성을 높임
- 테스트 가능성(유닛 테스트/통합 테스트) 확보

---

# A. ChatArea 리팩토링 전후 비교

## 1) 리팩토링 전 구조
- 파일: `web_app/src/components/chat/ChatArea.tsx`
- 포함된 책임
  - 메시지 로딩
  - 스트리밍 메시지 처리
  - 파일 첨부/미리보기 관리
  - 트리거(휴가/전자결재) 처리
  - UI 렌더링

즉, **한 파일이 모든 책임을 동시에 처리**.

### 문제점
- UI 변경 시 스트리밍 로직까지 손댈 위험
- 메시지 전송/첨부 로직이 UI 깊숙이 묻혀 있음
- 협업 시 충돌 확률이 높음

## 2) 리팩토링 후 구조
새 파일
- `ChatArea.state.ts` → 상태/로직 전담

기존 파일
- `ChatArea.tsx` → UI 렌더링 중심

### 구조 요약
```
ChatArea.tsx
  ├─ useChatAreaState() 호출
  ├─ state/actions/refs/derived 분해
  └─ UI 렌더링만 담당

ChatArea.state.ts
  ├─ 메시지 로딩
  ├─ 스트리밍 처리
  ├─ 파일 첨부 관리
  └─ 휴가/전자결재 트리거 처리
```

### 개선 효과
- **UI와 로직이 분리됨** → UI만 수정할 때 로직을 건드릴 필요 없음
- 스트리밍/첨부 로직은 `state.ts`에서 집중 관리
- 코드 탐색이 쉬워짐
- 상태/로직 유닛 테스트 가능

---

# B. TotalCalendar 리팩토링 전후 비교

## 1) 리팩토링 전 구조
- 파일: `web_app/src/components/calendar/TotalCalendar.tsx`
- 포함된 책임
  - 월별 휴가 데이터 조회
  - 부서별 데이터 조회
  - 공휴일 조회
  - 필터링/선택/페이징 상태 관리
  - UI 렌더링

### 문제점
- API 호출 로직과 UI가 강하게 결합됨
- 공휴일/필터 로직을 다른 달력에서 재사용하기 어려움

## 2) 리팩토링 후 구조
새 파일
- `TotalCalendar.data.ts` → API 호출 전담
- `TotalCalendar.state.ts` → 상태/필터/페이징/데이터 조합 전담

기존 파일
- `TotalCalendar.tsx` → UI 렌더링 전담

### 구조 요약
```
TotalCalendar.tsx
  ├─ useTotalCalendarState() 호출
  └─ UI 렌더링만 담당

TotalCalendar.data.ts
  ├─ fetchMonthlyCalendar()
  ├─ fetchTotalCalendar()
  └─ fetchHolidays()

TotalCalendar.state.ts
  ├─ 상태 관리
  ├─ 필터/선택/페이징 로직
  ├─ 공휴일 + 휴가 데이터 결합
```

### 개선 효과
- API 변경 시 `data.ts`만 수정하면 됨
- 상태 로직(선택/필터/페이징)이 분리됨 → UI 복잡도 감소
- 공휴일 로직을 다른 달력에도 재사용 가능
- UI 수정 시 API 로직 영향 없음

---

# C. ElectronicApprovalDraftPanel 리팩토링 전후 비교

## 1) 리팩토링 전 구조
- 파일: `web_app/src/components/approval/ElectronicApprovalDraftPanel.tsx`
- 포함된 책임
  - API 호출 (부서 목록, 결재라인 저장/불러오기, 상신 요청)
  - 상태 관리
  - 모달/스낵바 처리
  - UI 렌더링
  - 상수/유틸 포함

### 문제점
- 파일이 크고 복잡해서 변경 시 실수 가능성 증가
- 모달/스낵바 로직이 UI와 섞여 가독성 저하
- 상수/유틸 재사용 어려움

## 2) 리팩토링 후 구조
새 파일
- `ElectronicApprovalDraftPanel.data.ts` → API 호출 전담
- `ElectronicApprovalDraftPanel.state.ts` → 상태/핸들러 전담
- `ElectronicApprovalDraftPanel.modals.tsx` → 모달/스낵바 UI 전담
- `ElectronicApprovalDraftPanel.shared.ts` → 상수/유틸 전담

기존 파일
- `ElectronicApprovalDraftPanel.tsx` → UI 렌더링 전담

### 구조 요약
```
ElectronicApprovalDraftPanel.tsx
  ├─ useElectronicApprovalDraftState() 호출
  ├─ UI 렌더링
  └─ 모달 컴포넌트 호출

ElectronicApprovalDraftPanel.data.ts
  ├─ fetchDepartments()
  ├─ loadApprovalLine()
  ├─ saveApprovalLine()
  └─ submitLeaveGrantRequest()

ElectronicApprovalDraftPanel.state.ts
  ├─ 상태 관리
  ├─ 이벤트 핸들러

ElectronicApprovalDraftPanel.modals.tsx
  ├─ Approver/Reference 모달
  ├─ Webview 모달
  └─ Snackbar

ElectronicApprovalDraftPanel.shared.ts
  ├─ 상수
  └─ 승인유형 변환 유틸
```

### 개선 효과
- 데이터/API 수정 시 `data.ts`만 수정
- 상태 로직은 `state.ts`에서 집중 관리
- 모달/스낵바 UI는 별도 파일로 분리
- UI 파일은 훨씬 읽기 쉬워짐
- 코드 재사용성과 테스트 가능성 증가

---

# 2) 왜 이렇게 했는지 (원칙 정리)

### 1. SRP(단일 책임 원칙)
- 각 파일이 **하나의 역할만** 담당하도록 분리

### 2. 변경 영향 최소화
- UI 변경 ↔ 로직 변경 서로 영향 최소화
- 실제 유지보수 시 수정 리스크 감소

### 3. 재사용/확장 용이
- 다른 화면에서 같은 로직을 가져다 쓰기 쉬움
- 공휴일, 결재라인 같은 기능을 재사용 가능

### 4. 테스트 가능 구조
- 상태/로직만 분리해 유닛 테스트 가능

---

# 3) 결과적으로 얻는 것

- **코드 가독성 개선**
- **유지보수성 상승**
- **버그 발생 가능성 감소**
- **협업 충돌 감소**
- **확장성 증가**

---

## 참고: 실전 적용 포인트

- UI만 손볼 때는 `*.tsx`
- API/데이터 변경은 `*.data.ts`
- 상태/로직 변경은 `*.state.ts`
- 모달은 `*.modals.tsx`
- 상수/유틸은 `*.shared.ts`

이렇게 분리하면 앞으로 기능 추가/수정이 훨씬 빠르고 안전해집니다.

