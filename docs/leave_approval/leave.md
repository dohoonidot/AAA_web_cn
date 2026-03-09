# 휴가 부여 상신 프로세스

## 개요

휴가 부여 전자결재 승인 후 자동으로 LeaveDraftModal을 트리거하는 프로세스 문서입니다.

## 프로세스 플로우

```
1. 전자결재 상신 (ElectronicApprovalDraftModal)
   ↓
2. 결재자 승인
   ↓
3. 서버에서 AMQP 메시지 발송 (Queue: leave.draft)
   ↓
4. 앱에서 메시지 수신 및 처리
   ↓
5. LeaveDraftModal 자동 생성 및 표시
```

## 1. 전자결재 상신

### 사용 모달
- **CommonElectronicApprovalModal**: 수동 전자결재
- **ElectronicApprovalDraftModal**: 자동 전자결재 (휴가 부여 상신)

### 결재 종류
- 선택 옵션: **"휴가 부여 상신"**

## 2. 서버 메시지 발송

### AMQP 메시지 스펙

#### Queue Type
```
leave.draft
```

#### 메시지 데이터 구조
```json
{
  "user_id": "사용자ID (String)",
  "leave_type": "휴가종류 (String)",
  "start_date": "시작일 (String, YYYY-MM-DD)",
  "end_date": "종료일 (String, YYYY-MM-DD)",
  "approver_name": "승인자이름 (String)",
  "approver_id": "승인자ID (String)",
  "reason": "휴가사유 (String, optional)",
  "half_day_slot": "반차구분 (String, optional) - '오전반차' or '오후반차'",
  "is_next_year": "내년휴가사용여부 (int, 0 or 1)",
  "cc_list": [
    {
      "name": "참조자이름 (String)",
      "user_id": "참조자ID (String)"
    }
  ],
  "leave_status": [
    {
      "leave_type": "휴가종류 (String)",
      "total_days": "총일수 (double)",
      "used_days": "사용일수 (double)",
      "remain_days": "잔여일수 (double)"
    }
  ]
}
```

#### 필수 필드
- `user_id`: 휴가를 부여받을 사용자 ID
- `leave_type`: 휴가 종류
- `start_date`: 휴가 시작일
- `end_date`: 휴가 종료일
- `approver_name`: 승인자 이름
- `approver_id`: 승인자 ID

#### 선택 필드
- `reason`: 휴가 사유
- `half_day_slot`: 반차 구분 (오전반차/오후반차)
- `is_next_year`: 내년 휴가 사용 여부 (기본값: 0)
- `cc_list`: 참조자 목록
- `leave_status`: 사용자의 휴가 현황 데이터

## 3. 앱 메시지 처리

### 코드 위치
- **파일**: `lib/shared/services/amqp_service.dart`

### 처리 플로우

#### 1) 메시지 수신 및 라우팅
**위치**: amqp_service.dart:1402-1405

```dart
case 'leave.draft':
  print('📋 [AMQP] 휴가 초안 메시지 처리로 분기');
  _handleLeaveDraftMessage(messageData, message);
  break;
```

#### 2) 메시지 데이터 변환
**위치**: amqp_service.dart:1843-1993

**함수**: `_handleLeaveDraftMessage()`

**역할**:
- AMQP 메시지 데이터를 파싱
- `VacationRequestData` 객체로 변환
- CC 리스트 및 휴가 현황 데이터 파싱

**주요 로직**:
```dart
// 메시지 데이터를 VacationRequestData로 변환
final vacationData = VacationRequestData(
  userId: data['user_id'] as String? ?? _currentUserId ?? '',
  leaveType: leaveType.isNotEmpty ? leaveType : null,
  startDate: startDate,
  endDate: endDate,
  reason: reason.isNotEmpty ? reason : null,
  halfDaySlot: halfDaySlot,
  ccList: ccList.isNotEmpty ? ccList : null,
  approvalLine: approverName.isNotEmpty ? [...] : null,
  leaveStatus: leaveStatus,
);
```

#### 3) 모달 표시
**위치**: amqp_service.dart:2210-2326

**함수**: `_showLeaveDraftModal(VacationRequestData vacationData)`

**역할**:
- Provider에 데이터 전달
- `LeaveDraftModal` 다이얼로그 표시
- 에러 처리 및 재시도 로직

**주요 로직**:
```dart
// Provider를 통해 데이터 업데이트
container.read(vacationDataProvider.notifier).updateVacationData(vacationData);

// 모달 표시
showDialog(
  context: context,
  builder: (dialogContext) => LeaveDraftModal(
    onClose: () {
      Navigator.of(dialogContext).pop();
    },
  ),
);
```

## 4. LeaveDraftModal

### 파일 위치
- `lib/features/leave/leave_draft_modal.dart`

### 주요 기능
- 휴가 신청 초안 작성
- 서버로부터 받은 데이터 자동 입력
- 사용자가 내용 확인 및 수정 가능
- 최종 휴가 신청 제출

### 데이터 수신
**Provider**: `vacationDataProvider`

모달이 생성되면 Provider로부터 `VacationRequestData`를 읽어와 폼 필드에 자동으로 채워집니다.

## 5. 데이터 모델

### VacationRequestData
**파일**: `lib/features/leave/vacation_data_provider.dart:87`

```dart
class VacationRequestData {
  final String? userId;              // 사용자 ID
  final DateTime? startDate;         // 시작일
  final DateTime? endDate;           // 종료일
  final String? reason;              // 사유
  final List<CcPersonData>? ccList;  // 참조자 목록
  final List<ApprovalLineData>? approvalLine;  // 결재라인
  final String? leaveType;           // 휴가 종류
  final String? halfDaySlot;         // 반차 구분
  final List<LeaveStatusData>? leaveStatus;    // 휴가 현황
  final Map<String, List<Map<String, dynamic>>>? organizationData;  // 조직도
}
```

### ApprovalLineData
```dart
class ApprovalLineData {
  final String approverName;   // 승인자 이름
  final String approverId;     // 승인자 ID
  final int approvalSeq;       // 승인 순서
}
```

### CcPersonData
```dart
class CcPersonData {
  final String name;     // 참조자 이름
  final String userId;   // 참조자 ID
}
```

### LeaveStatusData
```dart
class LeaveStatusData {
  final String leaveType;    // 휴가 종류
  final double totalDays;    // 총 일수
  final double usedDays;     // 사용 일수
  final double remainDays;   // 잔여 일수
}
```

## 트러블슈팅

### 모달이 표시되지 않는 경우

1. **AMQP 연결 상태 확인**
   - AMQP 서비스가 정상적으로 연결되어 있는지 확인
   - 콘솔 로그에서 `[AMQP]` 태그로 연결 상태 확인

2. **Queue Type 확인**
   - 서버에서 발송한 메시지의 큐 타입이 정확히 `leave.draft`인지 확인
   - 대소문자 구분 주의

3. **필수 데이터 확인**
   - 필수 필드(user_id, leave_type, start_date, end_date, approver_name, approver_id)가 모두 포함되어 있는지 확인

4. **날짜 형식 확인**
   - start_date, end_date가 `YYYY-MM-DD` 형식인지 확인

5. **Context 확인**
   - `navigatorKey.currentContext`가 유효한지 확인
   - 앱이 백그라운드 상태가 아닌지 확인

### 로그 확인 방법

메시지 처리 과정에서 다음 로그를 확인할 수 있습니다:

```
📋 [AMQP] ===== 휴가 초안 메시지 처리 시작 =====
📋 [AMQP] 원본 AMQP 메시지 데이터: {...}
📋 [AMQP] 휴가 초안 메시지 처리 시작: {...}
✅ [AMQP] VacationRequestData 생성 완료:
📋 [AMQP] 휴가 초안 모달 표시
✅ [AMQP] 휴가 초안 모달 표시 완료
✅ [AMQP] 휴가 초안 메시지 UI 표시 완료, ACK 처리
```

## 참고 문서

- `leave_amqp.md`: 휴가 신청 AMQP 메시지 처리
- `leave_request.md`: 휴가 신청 프로세스
- `mobile_webView.md`: 모바일 웹뷰 통합 가이드
