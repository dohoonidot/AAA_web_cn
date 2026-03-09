# 모바일 뷰포트 & Safe Area 최적화

- **작업일**: 2026-02-20
- **분류**: `03_UI-UX / 모바일`

---

## 문제

### 증상

모바일(iOS Safari, Android Chrome)에서 **하단 버튼과 입력창이 브라우저 UI에 가려지는** 현상이 발생했다.

- 휴가 신청 모달을 열면 **"신청" 버튼이 반쯤 잘리거나 아예 안 보임**
- 채팅 페이지에서 입력창이 화면 스크롤 없이는 접근 불가
- 관리자 휴가결재 페이지 하단 영역이 완전히 가려짐

### 원인 1 — `100vh`가 실제 보이는 화면보다 크다

```
[브라우저 주소창] ← 100vh는 이걸 포함한 전체 높이로 계산
[                ]
[  실제 콘텐츠   ] ← 주소창이 열려 있으면 여기가 실제로 좁음
[  보이는 영역   ]
[하단 버튼 ← 여기가 잘림]
```

`100vh`는 모바일 브라우저가 **주소창이 완전히 숨겨졌을 때를 기준으로 계산**한다.  
주소창이 펼쳐져 있으면 실제 화면이 그만큼 줄어드는데, 레이아웃은 `100vh` 기준으로 그려져 있으니 하단이 잘린다.

### 원인 2 — `body`에 safe-area padding을 직접 걸었다

`index.html`에 아래 코드가 있었다:

```css
@supports (padding: max(0px)) {
  body {
    padding-left: max(12px, env(safe-area-inset-left));
    padding-right: max(12px, env(safe-area-inset-right));
    padding-top: max(12px, env(safe-area-inset-top));
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}
```

`body`에 padding을 걸면 **전체 좌표계가 틀어진다**.  
`position: fixed`로 배치한 요소들(FAB 버튼, 하단 네비게이션 바 등)의 위치 계산이 body padding을 포함해 계산되어 의도한 위치보다 내려가거나 겹쳐버린다.

### 원인 3 — iOS/Android 하단 UI 영역 미처리

```
[                  ]
[  앱 콘텐츠       ]
[  하단 버튼 ← 여기가 홈 인디케이터/제스처 바와 겹침]
[■■■■■■■■■■■■■■■■] ← iOS 홈 인디케이터 or Android 제스처 바
```

`env(safe-area-inset-bottom)` 값을 아무 데도 적용하지 않아서, 버튼이 기기의 하단 시스템 UI와 겹쳐버렸다.

---

## 해결 방법

### 해결 1 — `100vh` → `100dvh`로 교체

`dvh` (Dynamic Viewport Height)는 **현재 실제로 보이는 뷰포트 높이**를 실시간으로 반영한다.

```
100vh  → 브라우저 주소창 유무와 무관하게 최댓값으로 고정
100dvh → 주소창이 열리면 줄고, 닫히면 늘어남 (항상 현재 보이는 높이)
```

단, `dvh`를 지원하지 않는 구형 브라우저를 위해 **fallback으로 `100vh`를 함께 선언**한다.  
데스크톱은 주소창 문제가 없으므로 `md` 이상에서는 기존 `100vh`를 유지한다.

```tsx
height: { xs: '100dvh', md: '100vh' }
```

### 해결 2 — `body` padding 제거, CSS 변수로 교체

`body` padding을 완전히 제거하고 `:root`에 **CSS 변수**로만 선언한다.  
각 컴포넌트에서 필요한 곳에 직접 `var(--sab)` 등을 사용한다.

```css
:root {
  --sat: env(safe-area-inset-top);    /* 상단 (노치 영역) */
  --sab: env(safe-area-inset-bottom); /* 하단 (홈 인디케이터) */
  --sal: env(safe-area-inset-left);   /* 좌측 */
  --sar: env(safe-area-inset-right);  /* 우측 */
}
```

> ⚠️ `env(safe-area-inset-*)` 값이 실제로 들어오려면 `index.html`의 viewport 메타에 `viewport-fit=cover`가 반드시 있어야 한다.  
> 이미 설정되어 있어서 추가 작업 불필요:
> ```html
> <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
> ```

### 해결 3 — 하단 고정 요소에 safe-area 여백 추가

`position: fixed` 버튼들의 `bottom` 값과 모달 하단 버튼 영역의 `padding-bottom`에 safe-area 값을 반영한다.

```tsx
// FAB, 고정 버튼의 bottom
bottom: 'max(env(safe-area-inset-bottom), 16px)'
// → 홈 인디케이터가 있으면 그 높이만큼 올라가고, 없으면 최소 16px 유지

// 모달 하단 버튼 영역 padding
pb: isMobile ? 'max(env(safe-area-inset-bottom), 16px)' : 2
// → 모바일에서만 적용, 데스크톱은 기존 값 유지
```

---

## 수정 / 생성 파일

| 파일 | 역할 | 변경 내용 |
|------|------|-----------|
| `web_app/index.html` | HTML 진입점, 전역 스타일 정의 | `body` safe-area padding 완전 제거 → `:root`에 `--sat/--sab/--sal/--sar` CSS 변수로 대체 |
| `src/index.css` | 전역 CSS, 공통 유틸 클래스 | `body`, `#root`에 `min-height: 100dvh` 적용 / `.pb-safe` 헬퍼 클래스 추가 |
| `src/components/layout/MobileMainLayout.tsx` | 모든 페이지를 감싸는 공통 레이아웃 래퍼 | 루트 Box `height: '100vh'` → `height: { xs: '100dvh', md: '100vh' }` |
| `src/pages/ChatPage.tsx` | AI 채팅 페이지 | 최외각 컨테이너 height 교체 / 채팅 영역 `calc(100dvh - 48px - var(--sat))` |
| `src/pages/LeaveManagementPage.tsx` | 휴가관리 페이지 (모바일 UI) | Container `height: 100dvh` / `paddingBottom: max(env(safe-area-inset-bottom), 80px)` |
| `src/pages/AdminLeaveApprovalPage.tsx` | 관리자 휴가결재 전체 페이지 | 루트 Box `height: { xs: '100dvh', md: '100vh' }` |
| `src/components/leave/LeaveRequestModal.tsx` | 휴가 신청 모달 (풀스크린) | 모달 height `100dvh` / 하단 버튼 영역 `pb: max(env(safe-area-inset-bottom), 16px)` |
| `src/components/leave/LeaveRequestDraftPanel.tsx` | 결재라인 저장 패널 (모달과 동일 구조) | LeaveRequestModal과 동일한 처리 |
| `src/pages/LeaveManagement.tsx` | 휴가관리 구버전 desktop 페이지 | FAB(휴가신청 버튼) `bottom: 'max(env(safe-area-inset-bottom), 16px)'` |
| `src/components/common/MobileComponents.tsx` | 공통 모바일 컴포넌트 모음 | `MobileBottomNav` Paper에 `paddingBottom: env(safe-area-inset-bottom)` 추가 |

---

## 최종 결과

모바일에서 올바르게 동작하는 패턴이 정립되었다. 앞으로 새 컴포넌트 작성 시 아래 패턴을 따르면 된다.

```tsx
// 페이지 최상단 컨테이너
height: { xs: '100dvh', md: '100vh' }

// AppBar가 있는 페이지의 콘텐츠 영역
height: {
  xs: 'calc(100dvh - 48px - var(--sat))',  // AppBar 높이 + 상단 safe area 제외
  md: '100vh',
}

// 풀스크린 모달
height: isMobile ? '100dvh' : '90vh'

// 모달/페이지의 하단 버튼 fixed 영역
pb: isMobile ? 'max(env(safe-area-inset-bottom), 16px)' : 2

// FAB 또는 position:fixed 하단 버튼
bottom: 'max(env(safe-area-inset-bottom), 16px)'
```

---

## 개선 전/후 비교

| 항목 | 개선 전 | 개선 후 |
|------|---------|---------|
| 뷰포트 높이 단위 | `100vh` — 주소창 상태와 무관하게 고정 | `{ xs: '100dvh', md: '100vh' }` — 모바일은 실시간 반영 |
| Safe area 선언 위치 | `body { padding-bottom: ... }` — 전체 레이아웃 좌표계 틀어짐 | `:root { --sab: env(...) }` — CSS 변수로만 선언, 필요한 곳에서만 사용 |
| 모달 풀스크린 높이 | `100vh` — 주소창 열리면 하단 잘림 | `100dvh` — 항상 보이는 영역 안에서 렌더링 |
| FAB / 고정 버튼 하단 위치 | `bottom: 16` — 홈 인디케이터와 겹침 | `bottom: max(env(safe-area-inset-bottom), 16px)` — 인디케이터 위에 표시 |
| 모달 하단 버튼 영역 | `p: 2` — 홈 인디케이터에 가려짐 | `pb: max(env(safe-area-inset-bottom), 16px)` — 인디케이터 위에 표시 |
| iOS 홈 인디케이터 대응 | ❌ 미처리 — 버튼이 인디케이터와 겹침 | ✅ safe-area 여백으로 분리 |
| Android 제스처 바 대응 | ❌ 미처리 — FAB이 제스처 바와 겹침 | ✅ safe-area 여백으로 분리 |
| 구형 브라우저 호환 | `100vh` 단일 선언 | `100dvh` 선언 후 `100vh` fallback 병기 |
