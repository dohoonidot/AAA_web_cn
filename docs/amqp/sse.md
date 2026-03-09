# SSE (Server-Sent Events) 알림 시스템

## 개요

React 웹앱에서 실시간 알림을 수신하기 위한 SSE 연결 시스템.

- **엔드포인트**: `https://ai2great.com:8060/sse/notifications`
- **인증**: 쿠키 기반 (`session_id`) + 쿼리 파라미터 fallback

## 관련 파일

| 파일 | 설명 |
|------|------|
| `web_app/src/hooks/useSseNotifications.ts` | SSE 연결 React Hook |
| `web_app/src/services/sseService.ts` | SSE 연결 관리 클래스, ACK API |
| `web_app/src/types/notification.ts` | 알림 타입 정의 |

## 에러 분석 (2026-01-29)

### 발생 에러

```
[useSseNotifications] ERROR: SSE 에러:
- readyState: 2 (CLOSED)
- url: https://ai2great.com:8060/sse/notifications
- withCredentials: true
```

### EventSource readyState 값

| 값 | 상수 | 의미 |
|----|------|------|
| 0 | CONNECTING | 연결 중 |
| 1 | OPEN | 연결됨 |
| 2 | CLOSED | 연결 닫힘 |

### 가능한 원인

#### 1. CORS 문제 (가장 가능성 높음)

`withCredentials: true`로 크로스 도메인 요청 시 서버에서 다음 헤더 필요:

```
Access-Control-Allow-Origin: [특정 도메인]  # 와일드카드 * 사용 불가
Access-Control-Allow-Credentials: true
```

#### 2. 인증 실패

- `session_id` 쿠키가 없거나 만료됨
- 쿼리 파라미터로도 session_id 전송 중 (`sseService.ts:187`)

#### 3. 서버 연결 거부

- 서버 다운 또는 8060 포트 차단
- SSL 인증서 문제

#### 4. 네트워크 문제

- 방화벽이 SSE 연결 차단
- 프록시가 long-polling 연결 종료

## 디버깅 방법

### 1. 브라우저 Network 탭 확인

1. F12 → Network 탭
2. 필터에 `sse` 또는 `notifications` 입력
3. 페이지 새로고침
4. `sse/notifications` 요청 클릭하여 확인:
   - Status 코드
   - Response Headers
   - Response 본문

### 2. 상태 코드별 의미

| 코드 | 의미 | 해결 방향 |
|------|------|----------|
| 200 | 정상 연결 후 끊김 | 서버 측 타임아웃/keep-alive 설정 확인 |
| 401 | 인증 실패 | 로그인 상태/session_id 쿠키 확인 |
| 403 | 권한 없음 | CORS 또는 서버 권한 설정 확인 |
| 404 | 엔드포인트 없음 | URL 경로 확인 |
| 502/503 | 서버 오류 | 백엔드 서버 상태 확인 |

### 3. 쿠키 확인

브라우저 개발자 도구 → Application 탭 → Cookies → `session_id` 존재 여부

### 4. curl로 서버 테스트

```bash
curl -v -N "https://ai2great.com:8060/sse/notifications?session_id=YOUR_SESSION" \
  -H "Accept: text/event-stream"
```

## 서버 측 요구사항

### CORS 설정 (필수)

```python
# FastAPI 예시
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # 특정 도메인
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### SSE 응답 헤더

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

## 코드 구조

### SseConnection 클래스 (`sseService.ts`)

```typescript
// 연결 생성
const connection = new SseConnection({
  url: '/sse/notifications',
  withCredentials: true,
  onStateChange: (state) => { /* DISCONNECTED, CONNECTING, CONNECTED, ERROR */ },
  onError: (error) => { /* 에러 처리 */ },
});

// 연결 시작
const eventSource = connection.connect();

// 이벤트 리스너 등록
eventSource.addEventListener('notification', (e) => {
  const data = JSON.parse(e.data);
});

// 연결 종료
connection.disconnect();
```

### useSseNotifications Hook (`useSseNotifications.ts`)

```typescript
const { connectionState, reconnect, isConnected } = useSseNotifications({
  enabled: isLoggedIn,
  onNotification: (envelope) => {
    // 알림 처리
  },
});
```

## AMQP 대응 SSE 동작 요약 (2026-02-06)

AMQP 문서(`docs/amqp.md`) 기준으로 **SSE에서도 동일 동작**을 구현했습니다.  
핵심 분기 기준은 `event`(SSE 이벤트 타입)이며, `queue_name`은 보조 분기에 사용됩니다.

### SSE Envelope 필드

```
{
  event: string,
  queue_name: string,
  event_id: string,
  user_id: string,
  sent_at: string,
  payload: object | string
}
```

### 이벤트별 UI 매핑

- `gift` / `gift_arrival`
  - GiftArrivalPopup 표시
  - 개인정보 동의 미완료 시 무시
- `birthday`
  - BirthdayPopup 표시
  - 2초 후 상단 티커
  - 2초 후 채팅 공지 메시지 추가
  - 개인정보 동의 미완료 시 무시
- `event`
  - EventPopup 표시
  - 2초 후 상단 티커
- `alert`
  - 2초 후 상단 티커
  - 2초 후 채팅 공지 메시지 추가
- `contest_detail`
  - 2초 후 상단 티커
  - 2초 후 채팅 공지 메시지 추가
- `eapproval_alert`
  - 2초 후 우상단 ApprovalAlertPopup 표시
- `leave_draft`
  - LeaveRequestDraftPanel 자동 오픈
- `leave_approval`
  - 결재 요청 아이콘 표시 (클릭 시 결재 대기 패널 오픈)
- `leave_alert`
  - 우측 하단 LeaveNotificationOverlay 카드
- `leave_cc`
  - 우측 하단 LeaveNotificationOverlay 카드
- `eapproval_cc`
  - 우측 하단 LeaveNotificationOverlay 카드
- `eapproval`
  - 전자결재 아이콘 표시 (클릭 시 `/approval` 이동)
- `eapproval_approval`
  - 전자결재 아이콘 표시

### 구현 위치

- SSE 수신/파싱: `web_app/src/hooks/useSseNotifications.ts`
- UI 분기/라우팅: `web_app/src/App.state.ts`
- 전역 UI 마운트: `web_app/src/App.tsx`

### 개인정보 동의 필터링

- `gift`, `gift_arrival`, `birthday` 이벤트는
  `authService.getCurrentUser().privacyAgreed`가 `false`면 무시

## TODO

- [ ] Network 탭에서 실제 응답 상태 코드 확인
- [ ] 서버 CORS 설정 확인
- [ ] session_id 쿠키 전달 여부 확인
- [ ] 서버 로그에서 SSE 요청 확인
