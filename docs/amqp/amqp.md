# AMQP 큐 타입 및 UI 연동 가이드

이 문서는 AAA(ASPN AI Agent)에서 사용하는 **모든 AMQP 큐 타입**과 각 큐가 **어떤 UI와 연동**되는지 정리한 가이드입니다.

---

## 1. AMQP 서비스 구조

AAA는 AMQP를 **2개 서비스**로 나눠 운용합니다.

| 서비스 | 파일 | 역할 |
|--------|------|------|
| 공용 AMQP 서비스 | `lib/shared/services/amqp_service.dart` | 일반 알림/이벤트/생일/선물/전자결재 alert/휴가초안 모달 |
| 휴가 전용 실시간 서비스 | `lib/features/leave/services/leave_realtime_service.dart` | leave.approval/leave.alert/leave.cc/eapproval/eapproval.cc 스트림 처리 |

---

## 2. 전체 큐 타입 (11개)

### 📦 서비스 1: 공용 AMQP 서비스 (`amqp_service.dart`)

| 큐 타입 | 핸들러 | 연결 UI / 동작 | 비고 |
|---------|--------|----------------|------|
| `gift.<userId>` | `_handleGiftMessage` | 1. `GiftArrivalPopup` 팝업<br>2. 알림함 NEW 뱃지 | 개인정보 동의 시에만 구독 |
| `birthday.<userId>` | `_handleBirthdayMessage` | 1. `BirthdayPopup` 팝업<br>2. 상단 전광판 티커<br>3. 채팅창 생일 메시지 | 개인정보 동의 시에만 구독 |
| `event.<userId>` | `_handleEventMessage` | 1. `EventPopup` 팝업<br>2. 상단 전광판 티커 | 채팅창에는 표시 안함 |
| `alert.<userId>` | `_handleAlertMessage` | 1. 상단 전광판 티커<br>2. 채팅창 공지 메시지 | `render_type: contest_detail` 분기 있음 |
| `eapproval.alert.<userId>` | `_handleEapprovalMessage` | 1. 우상단 `ApprovalAlertPopup`<br>2. 휴가 관련 시 데이터 새로고침 | 투명 배경 Toast 형태 |
| `leave.draft.<userId>` | `_handleLeaveDraftMessage` | `LeaveDraftModal` (휴가 신청서 초안) | payload로 폼 자동 채움 |

### 📦 서비스 2: 휴가 전용 실시간 서비스 (`leave_realtime_service.dart`)

| 큐 타입 | 핸들러 | 연결 UI / 동작 | 대상 |
|---------|--------|----------------|------|
| `leave.approval.<userId>` | `_handleApprovalMessage` | 1. "결재요청도착" 아이콘<br>2. 결재 슬라이드 패널 | **승인자만** |
| `leave.alert.<userId>` | `_handleAlertMessage` | `LeaveNotificationOverlay` 결재결과 카드 | 신청자 |
| `leave.cc.<userId>` | `_handleCCMessage` | `LeaveNotificationOverlay` 참조(CC) 카드 | **참조자** |
| `eapproval.<userId>` | `_handleEApprovalMessage` | ChatHome 전자결재 아이콘/모달 | 모든 사용자 |
| `eapproval.cc.<userId>` | `_handleEApprovalCCMessage` | `LeaveNotificationOverlay` 전자결재 CC 카드 | **참조자** |

---

## 3. UI 표시 방식 요약

```
┌─────────────────────────────────────────────────────────────────┐
│                        화면 구성                                 │
├─────────────────────────────────────────────────────────────────┤
│  [상단 전광판 티커]  ← alert, birthday, event                   │
│                                                                  │
│  [우상단 Toast]      ← eapproval.alert (ApprovalAlertPopup)     │
│                                                                  │
│  [우상단 아이콘]     ← leave.approval (결재요청도착)            │
│                      ← eapproval (전자결재 알림)                │
│                                                                  │
│  [중앙 팝업]         ← gift (GiftArrivalPopup)                  │
│                      ← birthday (BirthdayPopup)                 │
│                      ← event (EventPopup)                       │
│                      ← leave.draft (LeaveDraftModal)            │
│                                                                  │
│  [채팅창 메시지]     ← alert (공지), birthday (축하 메시지)     │
│                                                                  │
│  [우측 하단 오버레이] ← leave.alert, leave.cc, eapproval.cc     │
│                       (LeaveNotificationOverlay)                │
│                                                                  │
│  [우측 슬라이드]     ← leave.approval (결재 패널)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. 전체 큐 11개 한눈에 보기

| # | 큐 이름 | 서비스 | 대상 | UI |
|---|---------|--------|------|-----|
| 1 | `gift` | 공용 | 모든 사용자 | 중앙 팝업 + NEW 뱃지 | -> birthday 이후 gift 로 선물 받음. 
| 2 | `birthday` | 공용 | 모든 사용자 | 팝업 + 티커 + 채팅 | -> 생일 축하용.
| 3 | `event` | 공용 | 모든 사용자 | 팝업 + 티커 | -> 현재 명절 선물로 사용중. 
| 4 | `alert` | 공용 | 모든 사용자 | 티커 + 채팅 | -> 공지용 
| 5 | `eapproval.alert` | 공용 | **신청자** | 우상단 Toast |
| 6 | `leave.draft` | 휴가전용 | **신청자** | 휴가 신청 모달 |
| 7 | `leave.approval` | 휴가전용 | **승인자** | 아이콘 + 슬라이드 패널 |
| 8 | `leave.alert` | 휴가전용 | **신청자** | 오버레이 카드 |
| 9 | `leave.cc` | 휴가전용 | **참조자** | 오버레이 카드 |
| 10 | `eapproval` | 전자결재 |  **승인자** | 아이콘 + 모달 |
| 11 | `eapproval.cc` | 전자결재 | **참조자** | 오버레이 카드 |

---

## 5. 큐별 상세 설명

### 5.1 gift (선물 도착)

- **큐 이름**: `gift.<userId>`
- **조건**: 개인정보 동의 시에만 구독
- **처리 흐름**:
  1. `_handleGiftMessage()` 호출
  2. `_showNewGiftArrivalPopup()` → `GiftArrivalPopup` 팝업 표시
  3. `_notificationNotifier.setNewGiftIndicator(true)` → NEW 뱃지 표시
  4. 선물 개수 업데이트 콜백 호출

### 5.2 birthday (생일 축하)

- **큐 이름**: `birthday.<userId>`
- **조건**: 개인정보 동의 시에만 구독
- **처리 흐름**:
  1. `_handleBirthdayMessage()` 호출
  2. `_showBirthdayPopup()` → `BirthdayPopup` 팝업 표시
  3. 2초 후 `_alertTickerNotifier.showMessage()` → 상단 티커 표시
  4. `_addBirthdayChatMessage()` → 채팅창에 생일 메시지 추가
- **특이사항**: 채팅 메시지에 "선물 고르기" 버튼 포함

### 5.3 event (이벤트 알림)

- **큐 이름**: `event.<userId>`
- **처리 흐름**:
  1. `_handleEventMessage()` 호출
  2. `_showEventPopup()` → `EventPopup` 팝업 표시
  3. 2초 후 `_alertTickerNotifier.showMessage()` → 상단 티커 표시
- **특이사항**: 채팅창에는 메시지를 남기지 않음 (의도적)

### 5.4 alert (일반 알림/공지)

- **큐 이름**: `alert.<userId>`
- **처리 흐름**:
  1. `_handleAlertMessage()` 호출
  2. Header에서 `render_type` 확인
  3. 2초 후 `_alertTickerNotifier.showMessage()` → 상단 티커 표시
  4. `_addAnnouncementChatMessage()` → 채팅창에 공지 메시지 추가
- **분기 로직**: 
  - `render_type: contest_detail`인 경우 → 대회 상세 페이지 이동 데이터 포함

### 5.5 eapproval.alert (전자결재 승인/반려)

- **큐 이름**: `eapproval.alert.<userId>`
- **처리 흐름**:
  1. `_handleEapprovalMessage()` 호출
  2. 2초 후 `showGeneralDialog()` → 우상단 `ApprovalAlertPopup` 표시
  3. 휴가 관련(`hr_leave`, `hr_leave_grant`)이면 데이터 새로고침
- **특이사항**: 
  - `showGeneralDialog` + `Alignment.topRight` 사용
  - 투명 배경으로 작업 흐름 방해 최소화

### 5.6 leave.draft (휴가 신청서 초안)

- **큐 이름**: `leave.draft.<userId>`
- **처리 흐름**:
  1. `_handleLeaveDraftMessage()` 호출
  2. payload 파싱 (`leave_type`, `start_date`, `end_date`, `reason` 등)
  3. `VacationRequestData` 객체 생성
  4. `vacationDataProvider`에 데이터 주입
  5. `_showLeaveDraftModal()` → `LeaveDraftModal` 표시
- **특이사항**: 단순 알림이 아닌 **데이터 동반 액션**

### 5.7 leave.approval (휴가 결재 요청)

- **큐 이름**: `leave.approval.<userId>`
- **대상**: **승인자(관리자)만**
- **처리 흐름**:
  1. `_handleApprovalMessage()` 호출
  2. `LeaveApprovalRequest` 객체 생성
  3. `_approvalRequestController.add()` → 스트림 발행
  4. ChatHome에서 `approvalRequestStream.listen()` → 아이콘 표시
  5. 아이콘 클릭 → `_fetchApprovalRequests()` API 호출
  6. 결재 슬라이드 패널 표시
- **관련 API**: `POST /leave/admin/management/waitingLeaves`

### 5.8 leave.alert (휴가 결재 결과)

- **큐 이름**: `leave.alert.<userId>`
- **대상**: 휴가 신청자
- **처리 흐름**:
  1. `_handleAlertMessage()` 호출
  2. `LeaveAlertMessage` 객체 생성
  3. `_alertMessageController.add()` → 스트림 발행
  4. `LeaveNotificationProvider`에서 구독
  5. `LeaveNotificationOverlay`에서 결재결과 카드 표시

### 5.9 leave.cc (휴가 참조 알림)

- **큐 이름**: `leave.cc.<userId>`
- **대상**: **참조자**
- **처리 흐름**:
  1. `_handleCCMessage()` 호출
  2. `LeaveCCMessage` 객체 생성
  3. `_ccMessageController.add()` → 스트림 발행
  4. `LeaveNotificationProvider`에서 구독
  5. `LeaveNotificationOverlay`에서 참조(CC) 카드 표시
- **데이터 모델**:
  ```dart
  class LeaveCCMessage {
    final String name;       // 신청자 이름
    final String department; // 소속 부서
    final String leaveType;  // 휴가 종류
    final String startDate;  // 시작일
    final String endDate;    // 종료일
  }
  ```

### 5.10 eapproval (전자결재 알림)

- **큐 이름**: `eapproval.<userId>`
- **대상**: 모든 사용자
- **처리 흐름**:
  1. `_handleEApprovalMessage()` 호출
  2. `LeaveEApprovalMessage` 객체 생성
  3. `_eapprovalMessageController.add()` → 스트림 발행
  4. ChatHome에서 `eapprovalMessageStream.listen()` → 아이콘 표시
  5. 아이콘 클릭 → 전자결재 목록 모달 표시

### 5.11 eapproval.cc (전자결재 참조 알림)

- **큐 이름**: `eapproval.cc.<userId>`
- **대상**: **참조자**
- **처리 흐름**:
  1. `_handleEApprovalCCMessage()` 호출
  2. `LeaveEApprovalMessage` 객체 생성
  3. 스트림 발행 → Provider 구독 → Overlay 표시

---

## 6. 관련 파일 목록

| 역할 | 파일 경로 |
|------|----------|
| 공용 AMQP 서비스 | `lib/shared/services/amqp_service.dart` |
| 휴가 전용 AMQP 서비스 | `lib/features/leave/services/leave_realtime_service.dart` |
| 공용 알림 상태 관리 | `lib/shared/providers/notification_notifier.dart` |
| 휴가 알림 상태 관리 | `lib/features/leave/providers/leave_notification_provider.dart` |
| 휴가 알림 오버레이 UI | `lib/features/leave/widgets/leave_notification_overlay.dart` |
| 메인 알림함/상세 UI | `lib/ui/screens/chat_home_page_v5.dart` |
| 선물 팝업 | `lib/features/gift/gift_arrival_popup.dart` |
| 생일 팝업 | `lib/features/gift/birthday_popup.dart` |
| 이벤트 팝업 | `lib/features/gift/event_popup.dart` |
| 전자결재 알림 팝업 | `lib/features/approval/approval_alert_popup.dart` |
| 휴가 신청 초안 모달 | `lib/features/leave/leave_draft_modal.dart` |

---

## 7. 초기화 흐름

```
main.dart
    ↓
로그인 성공 후 AmqpService.connect()
    ↓
AmqpService.setNotifiers() - Notifier 연결
    ↓
AmqpService._subscribeAndConsume() - 큐 구독 시작
    ↓
ChatHomePage initState()
    ↓
LeaveApprovalRealtimeService.startListening() - 휴가 전용 서비스 시작
    ↓
LeaveNotificationProvider.startListening() - 오버레이 구독 시작
```

---

## 8. 큐 추가 시 작업 절차

새 큐(예: `foo.bar.<userId>`)를 추가할 때:

1. **AMQP 구독 등록**
   - 공용: `amqp_service.dart`의 `queuesToCreate` + `switch(queueType)` 추가
   - 휴가전용: `leave_realtime_service.dart`에 subscribe + handler 추가

2. **핸들러 구현**
   - 메시지 파싱 / ACK / 오류 처리 정책 명확화

3. **UI surface 선택**
   - 팝업, 티커, 오버레이, 아이콘 배지, 모달 중 선택

4. **Provider/상태 연결**
   - 상태 누적 / 삭제 / 읽음 처리 규칙 정의

5. **알림함 `queue_name` 분기 추가 (필요 시)**
   - 리스트 아이콘 / 타이틀 / 상세 액션까지 반영

6. **문서 업데이트**
   - 본 문서 동기화
