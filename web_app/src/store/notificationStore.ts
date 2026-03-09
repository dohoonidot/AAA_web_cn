/**
 * 알림 상태 관리 Store (Zustand)
 * SSE로 수신한 알림을 저장하고 관리
 */

import { create } from 'zustand';
import type {

  NotificationEnvelope,
  NotificationDisplay,
} from '../types/notification';
import { SseConnectionState } from '../services/sseService';
import { createLogger } from '../utils/logger';
import { getTitleByQueueName, getTypeByQueueName } from '../utils/notificationHelpers';
import * as notificationApi from '../services/notificationApi';
import authService from '../services/authService';

export type NotificationCategory = '전체' | '생일' | '명절' | '휴가' | '전자결재' | '기타';

const logger = createLogger('NotificationStore');

/** 페이지당 알림 개수 */
const PAGE_SIZE = 50;

/**
 * 알림 스토어 상태
 */
interface NotificationState {
  // 데이터
  /** 알림 목록 (최신순) */
  notifications: NotificationDisplay[];
  /** 읽지 않은 알림 개수 */
  unreadCount: number;

  // 페이지네이션
  /** 현재 페이지 (1부터 시작) */
  currentPage: number;
  /** 페이지당 알림 개수 */
  pageSize: number;
  /** 전체 페이지 수 */
  totalPages: number;

  // 카테고리 필터
  /** 선택된 알림 카테고리 */
  selectedCategory: NotificationCategory;
  /** 알림 카테고리 변경 */
  setSelectedCategory: (category: NotificationCategory) => void;

  // SSE 연결 상태
  /** SSE 연결 상태 */
  connectionState: SseConnectionState;
  /** SSE 활성화 여부 */
  sseEnabled: boolean;

  // UI 상태
  /** 알림 패널 표시 여부 */
  isNotificationPanelOpen: boolean;

  // Actions - 알림 관리
  /** 알림 추가 (SSE 수신 시 호출) */
  addNotification: (envelope: NotificationEnvelope) => void;
  /** 알림함 API에서 알림 로드 */
  loadAlertsFromApi: (userId: string, forceRefresh?: boolean) => Promise<void>;
  /** 알림 읽음 처리 */
  markAsRead: (notificationId: string) => Promise<void>;
  /** 모든 알림 읽음 처리 */
  markAllAsRead: () => Promise<void>;
  /** 알림 삭제 */
  removeNotification: (notificationId: string) => Promise<void>;
  /** 모든 알림 삭제 */
  clearAllNotifications: () => Promise<void>;

  // Actions - SSE 상태
  /** SSE 활성화/비활성화 */
  setSseEnabled: (enabled: boolean) => void;
  /** SSE 연결 상태 업데이트 */
  setConnectionState: (state: SseConnectionState) => void;

  // Actions - UI
  /** 알림 패널 토글 */
  toggleNotificationPanel: () => void;
  /** 알림 패널 열기/닫기 */
  setNotificationPanelOpen: (open: boolean) => void;
  /** 기존 알림들의 메시지 재생성 (JSON → 사용자 친화적) */
  refreshNotificationMessages: () => void;

  // Actions - 페이지네이션
  /** 페이지 변경 */
  setCurrentPage: (page: number) => void;
  /** 다음 페이지로 이동 */
  goToNextPage: () => void;
  /** 이전 페이지로 이동 */
  goToPrevPage: () => void;
  /** 첫 페이지로 이동 */
  goToFirstPage: () => void;
  /** 마지막 페이지로 이동 */
  goToLastPage: () => void;
  /** 현재 페이지의 알림만 반환 (계산된 값) */
  getPaginatedNotifications: () => NotificationDisplay[];

  // Gift count (SSE 수신 시 즉각 반영용)
  /** 미사용 선물 개수 */
  giftCount: number;
  /** 선물 개수 설정 */
  setGiftCount: (count: number) => void;
  /** 선물 개수 1 증가 */
  incrementGiftCount: () => void;

  // Actions - Leave Approval Panel
  /** 휴가 결재 패널 상태 */
  isLeaveApprovalPanelOpen: boolean;
  /** 선택된 휴가 결재 데이터 */
  selectedLeaveApproval: any | null;
  /** 휴가 결재 패널 열기 */
  openLeaveApprovalPanel: (data: any) => void;
  /** 휴가 결재 패널 닫기 */
  closeLeaveApprovalPanel: () => void;

  // Actions - Leave Approval Alert (SSE 트리거용)
  /** 결재 요청 알림 도착 여부 (아이콘 표시용) */
  hasLeaveApprovalAlert: boolean;
  /** 결재 요청 알림 설정 */
  setHasLeaveApprovalAlert: (value: boolean) => void;
  /** 전자결재 알림 도착 여부 (아이콘 표시용) */
  hasEapprovalAlert: boolean;
  /** 전자결재 알림 설정 */
  setHasEapprovalAlert: (value: boolean) => void;
  /** 결재 대기 목록 패널 열림 여부 */
  isLeaveApprovalListPanelOpen: boolean;
  /** 결재 대기 목록 패널 열기 */
  openLeaveApprovalListPanel: () => void;
  /** 결재 대기 목록 패널 닫기 */
  closeLeaveApprovalListPanel: () => void;
}

/**
 * 카테고리 필터링 헬퍼
 */
export function getFilteredNotifications(notifications: NotificationDisplay[], category: NotificationCategory): NotificationDisplay[] {
  if (category === '전체') return notifications;
  return notifications.filter(n => {
    if (category === '생일') return n.type === 'birthday' || n.queue_name.startsWith('birthday');
    if (category === '명절') return n.type === 'holiday' || n.queue_name.startsWith('holiday');
    if (category === '휴가') return n.type.startsWith('leave') || n.queue_name.startsWith('leave');
    if (category === '전자결재') return n.type.startsWith('eapproval') || n.queue_name.startsWith('eapproval');
    // 기타
    return !['birthday', 'holiday'].includes(n.type)
      && !n.queue_name.startsWith('birthday') && !n.queue_name.startsWith('holiday')
      && !n.type.startsWith('leave') && !n.queue_name.startsWith('leave')
      && !n.type.startsWith('eapproval') && !n.queue_name.startsWith('eapproval');
  });
}

/**
 * payload에서 메시지 추출 헬퍼
 */
/**
 * 알림 미리보기 메시지 추출 헬퍼 (간단한 요약)
 * JSON이 아닌 사용자 친화적인 메시지 생성
 */
function extractPayloadMessage(payload: any): string {
  if (!payload || typeof payload !== 'object') {
    return typeof payload === 'string' ? payload : '';
  }

  const p = payload as any;

  // 휴가 알림 (leave_*)
  if (p.hasOwnProperty('leave_type') || p.hasOwnProperty('workdays_count') ||
    (p.hasOwnProperty('status') && !p.hasOwnProperty('approval_type'))) {
    const parts: string[] = [];

    // 취소상신 표시 (is_cancel === 1)
    if (p.is_cancel === 1) {
      parts.push('🔴 취소상신');
    }

    // 이름
    if (p.name) {
      parts.push(`이름: ${p.name}`);
    }

    // 부서
    if (p.department) {
      parts.push(`부서: ${p.department}`);
    }

    // 휴가종류
    if (p.leave_type) {
      parts.push(`휴가종류: ${p.leave_type}`);
    }

    // 시작일 (서버 값 그대로 표시)
    if (p.start_date && p.start_date !== '0001-01-01T00:00:00Z') {
      const startDate = String(p.start_date).split('T')[0];
      parts.push(`시작일: ${startDate}`);
    }

    // 종료일 (서버 값 그대로 표시)
    if (p.end_date && p.end_date !== '0001-01-01T00:00:00Z') {
      const endDate = String(p.end_date).split('T')[0];
      parts.push(`종료일: ${endDate}`);
    }

    // 사용일수
    if (p.workdays_count && p.workdays_count > 0) {
      parts.push(`사용일수: ${p.workdays_count}일`);
    }

    // 휴가사유
    if (p.reason) {
      parts.push(`사유: ${p.reason}`);
    }

    // 상태
    if (p.status) {
      let statusText = p.status;
      if (p.status === 'APPROVED') statusText = '승인완료';
      else if (p.status === 'REJECTED') statusText = '반려됨';
      else if (p.status === 'PENDING') statusText = '승인대기';
      parts.push(`상태: ${statusText}`);
    }

    // 반려사유
    if (p.reject_message) {
      parts.push(`반려사유: ${p.reject_message}`);
    }

    // 빈값이면 기본 메시지 반환
    if (parts.length === 0) {
      return '휴가 알림';
    }

    // 리스트에서는 한 줄로 간단하게 표시 (주요 정보만)
    // 취소상신 + 상태만 표시하거나, 이름 + 상태 조합
    if (parts.length > 0) {
      const cancelPart = parts.find(p => p.includes('취소상신'));
      const statusPart = parts.find(p => p.includes('상태:'));
      const namePart = parts.find(p => p.includes('이름:'));

      if (cancelPart && statusPart) {
        return `${cancelPart.replace('🔴 ', '')} - ${statusPart.replace('상태: ', '')}`;
      }
      if (namePart && statusPart) {
        return `${namePart.replace('이름: ', '')}님 - ${statusPart.replace('상태: ', '')}`;
      }
      if (statusPart) {
        return statusPart.replace('상태: ', '');
      }
      // 첫 번째 주요 정보만 반환
      return parts[0];
    }

    return '휴가 알림';
  }

  // 전자결재 알림 (eapproval_*)
  // title, name, status, department 등이 있는 경우
  if (p.hasOwnProperty('approval_type') ||
    (p.hasOwnProperty('title') && p.hasOwnProperty('status') && !p.hasOwnProperty('leave_type'))) {
    const docTitle = p.title || p.doc_title || p.document_title || '문서';
    const requester = p.name || p.drafter || p.drafter_name || '';
    const status = p.status;

    let statusText = '';
    if (status === 'APPROVED') statusText = '승인 완료';
    else if (status === 'REJECTED') statusText = '승인 거부';
    else if (status === 'PENDING') statusText = '승인 대기';
    else statusText = '결재 진행';

    if (requester && statusText) {
      return `${requester}님의 ${docTitle} - ${statusText}`;
    } else if (requester) {
      return `${requester}님의 ${docTitle}`;
    } else if (statusText) {
      return `${docTitle} - ${statusText}`;
    } else {
      return `${docTitle} 결재 요청`;
    }
  }

  // 전자결재 알림 (기존 방식 - doc_title 등)
  if (p.hasOwnProperty('doc_title') || p.hasOwnProperty('document_title')) {
    const docTitle = p.doc_title || p.document_title || '문서';
    const drafter = p.drafter || p.drafter_name || p.name || '';
    return drafter ? `${drafter}님의 ${docTitle}` : `${docTitle} 결재 요청`;
  }

  // 공모전 알림
  if (p.hasOwnProperty('contest_title') || p.hasOwnProperty('contest_name')) {
    const contestTitle = p.contest_title || p.contest_name || '공모전';
    return `${contestTitle} 공모전 시작`;
  }

  // 생일 알림
  if (p.hasOwnProperty('birthday_person') || (p.name && !p.title && !p.leave_type)) {
    const name = p.birthday_person || p.name;
    return `🎂 ${name}님 생일 축하`;
  }

  // title 필드가 있고 다른 특수 필드가 없는 경우 (일반 알림)
  if (p.title && typeof p.title === 'string' && p.title.trim()) {
    const title = p.title.trim();
    const name = p.name || p.requester || '';
    if (name) {
      return `${name}님의 ${title}`;
    }
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  }

  // 기본 메시지 필드들 (title이 없을 때만)
  const messageFields = ['message', 'content', 'body', 'text', 'description', 'subject'];
  for (const field of messageFields) {
    if (p[field] && typeof p[field] === 'string' && p[field].trim()) {
      const msg = p[field].trim();
      return msg.length > 50 ? msg.substring(0, 50) + '...' : msg;
    }
  }

  // name만 있는 경우
  if (p.name && typeof p.name === 'string' && p.name.trim()) {
    return `${p.name}님의 알림`;
  }

  // count가 있으면 개수 표시
  if (typeof p.count === 'number' && p.count > 0) {
    return `${p.count}건의 새로운 알림`;
  }

  // JSON 형태가 아닌 간단한 메시지 반환
  return '새로운 알림';
}

/**
 * 알림 상세 정보 추출 헬퍼 (모달용 상세 정보)
 */
export function extractNotificationDetails(payload: any, type: string) {
  if (!payload || typeof payload !== 'object') return null;

  const p = payload as any;
  const details: Record<string, any> = {};

  // 휴가 알림 상세 정보 (leave_alert)
  if (type === 'leave_alert') {
    // 필수 정보
    if (p.leave_type) details['휴가 유형'] = p.leave_type;
    if (p.status) {
      details['처리 상태'] = p.is_cancel === 1 ? '취소 요청' :
        p.status === 'APPROVED' ? '승인 완료' :
          p.status === 'REJECTED' ? '승인 거부' :
            p.status === 'PENDING' ? '승인 대기' : p.status;
    }
    if (p.workdays_count && p.workdays_count > 0) details['휴가 일수'] = `${p.workdays_count}일`;

    // 날짜 정보 (서버 값 그대로 표시)
    if (p.start_date && !p.start_date.startsWith('0001-01-01') && p.start_date !== '0001-01-01T00:00:00Z') {
      details['휴가 시작'] = String(p.start_date).split('T')[0];
    }

    if (p.end_date && !p.end_date.startsWith('0001-01-01') && p.end_date !== '0001-01-01T00:00:00Z') {
      details['휴가 종료'] = String(p.end_date).split('T')[0];
    }

    // 추가 정보
    if (p.reason && p.reason.trim()) details['휴가 사유'] = p.reason.trim();
    if (p.reject_message && p.reject_message.trim()) details['거부 사유'] = p.reject_message.trim();

    // 요청자 정보 (있는 경우)
    if (p.requester_name || p.requester) details['요청자'] = p.requester_name || p.requester;
  }

  // 휴가 승인 요청 알림 (leave_approval)
  else if (type === 'leave_approval') {
    if (p.requester_name || p.requester) details['휴가 신청자'] = p.requester_name || p.requester;
    if (p.leave_type) details['휴가 유형'] = p.leave_type;
    if (p.workdays_count && p.workdays_count > 0) details['신청 일수'] = `${p.workdays_count}일`;

    // 날짜 정보 (서버 값 그대로 표시)
    if (p.start_date && !p.start_date.startsWith('0001-01-01')) {
      const start = String(p.start_date).split('T')[0];
      const end = (p.end_date && !p.end_date.startsWith('0001-01-01'))
        ? String(p.end_date).split('T')[0]
        : '';
      details['휴가 기간'] = end ? `${start} ~ ${end}` : start;
    }

    if (p.reason && p.reason.trim()) details['신청 사유'] = p.reason.trim();
    details['요청 사항'] = '휴가 승인 처리를 기다리고 있습니다';
  }

  // 휴가 참조 알림 (leave_cc)
  else if (type === 'leave_cc') {
    if (p.requester_name || p.requester) details['휴가 신청자'] = p.requester_name || p.requester;
    if (p.leave_type) details['휴가 유형'] = p.leave_type;
    if (p.workdays_count && p.workdays_count > 0) details['참조 일수'] = `${p.workdays_count}일`;
    details['참조 사유'] = '귀하의 승인이 필요한 휴가 신청이 있습니다';
  }

  // 휴가 임시저장 알림 (leave_draft)
  else if (type === 'leave_draft') {
    details['알림 유형'] = '휴가 임시저장';
    if (p.leave_type) details['휴가 유형'] = p.leave_type;
    if (p.workdays_count && p.workdays_count > 0) details['예정 일수'] = `${p.workdays_count}일`;
    details['진행 상태'] = '임시저장된 휴가 신청이 있습니다';
  }

  // 전자결재 알림들 (eapproval_*)
  else if (type.includes('eapproval')) {
    // 문서 제목 (여러 필드명 지원)
    if (p.title) details['문서 제목'] = p.title;
    else if (p.doc_title) details['문서 제목'] = p.doc_title;
    else if (p.document_title) details['문서 제목'] = p.document_title;

    // 기안자/신청자 정보
    if (p.name) details['신청자'] = p.name;
    else if (p.drafter) details['기안자'] = p.drafter;
    else if (p.drafter_name) details['기안자'] = p.drafter_name;

    // 부서 정보
    if (p.department && p.department.trim()) details['소속 부서'] = p.department.trim();

    // 직급 정보
    if (p.job_position && p.job_position.trim()) details['직급'] = p.job_position.trim();

    // 결재 상태
    if (p.status) {
      details['결재 상태'] = p.status === 'APPROVED' ? '승인 완료' :
        p.status === 'REJECTED' ? '승인 거부' :
          p.status === 'PENDING' ? '승인 대기' :
            p.status;
    }

    // 결재 유형
    if (p.approval_type && p.approval_type.trim()) {
      details['결재 유형'] = p.approval_type.trim();
    }

    // 결재 유형에 따른 메시지
    if (type === 'eapproval_approval') {
      if (!details['결재 상태']) details['결재 상태'] = '승인 대기';
      details['요청 사항'] = '문서 승인을 기다리고 있습니다';
    } else if (type === 'eapproval_alert') {
      if (!details['결재 상태']) details['결재 상태'] = '결재 진행 중';
      details['알림 내용'] = '결재가 진행 중인 문서입니다';
    } else if (type === 'eapproval_cc') {
      if (!details['결재 상태']) details['결재 상태'] = '참조됨';
      details['참조 사유'] = '결재 문서가 귀하에게 참조되었습니다';
    }

    // 금액 정보
    if (p.amount && p.amount > 0) details['관련 금액'] = `${p.amount.toLocaleString()}원`;

    // 메시지/코멘트
    if (p.comment && p.comment.trim()) details['코멘트'] = p.comment.trim();
    else if (p.message && p.message.trim()) details['메시지'] = p.message.trim();

    // 사용자 ID (필요한 경우)
    if (p.user_id && p.user_id.trim() && !details['신청자']) {
      details['사용자 ID'] = p.user_id;
    }
  }

  // 공모전 알림
  else if (type === 'contest_detail') {
    if (p.title || p.contest_title) details['공모전 제목'] = p.title || p.contest_title;
    if (p.description) details['공모전 설명'] = p.description;
    if (p.start_date) details['공모 시작'] = String(p.start_date).split('T')[0];
    if (p.end_date) details['공모 마감'] = String(p.end_date).split('T')[0];
    details['참여 안내'] = '새로운 공모전이 시작되었습니다';
  }

  // 생일 알림
  else if (type === 'birthday') {
    if (p.name || p.birthday_person) {
      const name = p.name || p.birthday_person;
      details['생일 축하 🎂'] = `${name}님의 생일을 축하합니다!`;
    }
    if (p.birth_date) details['생년월일'] = String(p.birth_date).split('T')[0];
    details['축하 메시지'] = '오늘은 특별한 날입니다 🎉';
  }

  // 일반 알림
  else if (type === 'alert' || type === 'notification') {
    // 주요 필드들 우선 표시
    const priorityFields = [
      { key: 'title', label: '제목' },
      { key: 'subject', label: '제목' },
      { key: 'message', label: '내용' },
      { key: 'content', label: '내용' },
      { key: 'description', label: '설명' },
      { key: 'name', label: '이름' },
      { key: 'requester', label: '요청자' },
      { key: 'requester_name', label: '요청자' }
    ];

    priorityFields.forEach(({ key, label }) => {
      if (p[key] && typeof p[key] === 'string' && p[key].trim()) {
        details[label] = p[key].length > 150 ? p[key].substring(0, 150) + '...' : p[key];
      }
    });

    // 추가 정보들
    if (Object.keys(details).length === 0) {
      details['알림 내용'] = '새로운 알림이 도착했습니다';
    }
  }

  // 추가 정보 표시 (ID, 상태 등)
  if (Object.keys(details).length > 0) {
    if (p.id && typeof p.id === 'number' && p.id > 0) {
      details['알림 ID'] = `#${p.id}`;
    }
  }

  return Object.keys(details).length > 0 ? details : null;
}

/**
 * Envelope를 NotificationDisplay로 변환
 */
function envelopeToDisplay(envelope: NotificationEnvelope): NotificationDisplay {
  // 이벤트 타입에 따라 제목과 메시지 생성
  let title = '새 알림';
  let message = '';
  let link: string | undefined;

  // payload가 객체인 경우 처리
  const payload = envelope.payload;
  const p = payload as any;

  switch (envelope.event) {
    case 'leave_approval':
      title = '휴가 승인 요청';
      message = extractPayloadMessage(payload) || '새로운 휴가 승인 요청이 있습니다';
      link = '/leave/approval';
      break;

    case 'leave_alert':
      title = '휴가 알림';
      message = extractPayloadMessage(payload) || '휴가 관련 알림이 있습니다';
      link = '/leave';
      break;

    case 'leave_cc':
      title = '휴가 참조';
      message = extractPayloadMessage(payload) || '참조로 지정된 휴가 신청이 있습니다';
      link = '/leave';
      break;

    case 'leave_draft':
      title = '휴가 임시저장';
      message = extractPayloadMessage(payload) || '임시저장된 휴가 신청이 있습니다';
      link = '/leave';
      break;

    case 'eapproval_approval':
      title = '전자결재 승인 요청';
      message = extractPayloadMessage(payload) || '새로운 결재 문서가 도착했습니다';
      link = '/approval';
      break;

    case 'eapproval_alert':
      title = '전자결재 알림';
      message = extractPayloadMessage(payload) || '전자결재 관련 알림이 있습니다';
      link = '/approval';
      break;

    case 'eapproval_cc':
      title = '전자결재 참조';
      message = extractPayloadMessage(payload) || '참조로 지정된 결재 문서가 있습니다';
      link = '/approval';
      break;

    case 'contest_detail':
      title = '공모전 알림';
      message = extractPayloadMessage(payload) || '새로운 공모전 정보가 있습니다';
      link = '/contest';
      break;

    case 'birthday':
      title = '생일 축하 🎂';
      message = p?.name
        ? `${p.name}님의 생일을 축하합니다! 🎉`
        : extractPayloadMessage(payload) || '오늘은 특별한 날입니다!';
      break;

    case 'alert':
    case 'notification':
    default:
      title = '알림';
      message = envelope.payload_text || extractPayloadMessage(payload) || '새로운 알림이 있습니다';
      break;
  }

  return {
    id: envelope.event_id,
    type: envelope.event,
    queue_name: envelope.queue_name,
    title,
    message,
    payload: envelope.payload,
    receivedAt: envelope.sent_at, // 서버 원본 값 그대로 저장
    read: false,
    link,
  };
}

/**
 * 알림 스토어
 *
 * 메모리(state)에만 저장 - localStorage 사용 안 함
 * (로그아웃 또는 새로고침 시 초기화됨)
 * (추후 서버 API로 알림 목록 관리 예정)
 */
export const useNotificationStore = create<NotificationState>()((set, get) => ({
  // 초기 상태
  notifications: [],
  unreadCount: 0,
  currentPage: 1,
  pageSize: PAGE_SIZE,
  totalPages: 1,
  selectedCategory: '전체',
  connectionState: SseConnectionState.DISCONNECTED,
  sseEnabled: false,
  isNotificationPanelOpen: false,

  // 알림 추가
  addNotification: (envelope) => {
    // SSE 알림 수신 로그
    logger.dev('SSE 알림 수신', {
      event: envelope.event,
      event_id: envelope.event_id,
      user_id: envelope.user_id,
      queue_name: envelope.queue_name,
    });

    const notification = envelopeToDisplay(envelope);

    set((state) => {
      // 중복 확인 (event_id 기준) - 조용히 무시
      const exists = state.notifications.some((n) => n.id === notification.id);
      if (exists) {
        return state;
      }

      // 최신 알림을 앞에 추가
      const newNotifications = [notification, ...state.notifications];

      const trimmed = newNotifications;

      // 읽지 않은 개수 계산
      const unreadCount = trimmed.filter((n) => !n.read).length;

      logger.dev('알림 추가 완료', {
        title: notification.title,
        total: trimmed.length,
        unread: unreadCount,
      });

      // 전체 페이지 수 계산
      const filtered = getFilteredNotifications(trimmed, state.selectedCategory);
      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

      return {
        notifications: trimmed,
        unreadCount,
        totalPages,
        // 새 알림이 오면 첫 페이지로 이동
        currentPage: 1,
      };
    });
  },

  // 알림함 API에서 알림 로드
  loadAlertsFromApi: async (userId: string, forceRefresh = false) => {
    try {
      logger.dev('[NotificationStore] checkAlerts API 호출 시작:', userId);

      // notificationApi를 여기서 import해야 함 (순환 참조 방지를 위해 동적 import)
      const { notificationApi } = await import('../services/notificationApi');
      const alertItems = await notificationApi.getAlerts(userId, forceRefresh);

      logger.dev('[NotificationStore] checkAlerts API 응답:', alertItems);

      // AlertItem[]을 NotificationDisplay[]로 변환
      const notifications: NotificationDisplay[] = alertItems.map((alert) => {
        const normalizedType = getTypeByQueueName(alert.queue_name);
        return {
          id: String(alert.id), // number -> string 변환
          type: normalizedType,
          queue_name: alert.queue_name,
          title: getTitleByQueueName(normalizedType),
          message: alert.message,
          payload: undefined, // API 응답에는 payload 없음
          receivedAt: alert.send_time, // 서버 원본 값 그대로 저장
          read: alert.is_read,
          link: undefined,
        };
      });

      // API 응답으로 알림 목록 교체 (API가 유일한 source of truth)
      set((state) => {
        const trimmed = notifications;

        // 읽지 않은 개수 계산
        const unreadCount = trimmed.filter((n) => !n.read).length;

        // 전체 페이지 수 계산
        const filtered = getFilteredNotifications(trimmed, state.selectedCategory);
        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        // 현재 페이지가 전체 페이지 수를 초과하면 마지막 페이지로 조정
        const currentPage = Math.min(state.currentPage, totalPages);

        logger.dev('[NotificationStore] 알림함 스토어 업데이트:', {
          total: trimmed.length,
          unread: unreadCount,
          totalPages,
          currentPage,
        });

        return {
          notifications: trimmed,
          unreadCount,
          totalPages,
          currentPage,
        };
      });
    } catch (error) {
      console.error('[NotificationStore] checkAlerts API 오류:', error);
      throw error;
    }
  },

  // 알림 읽음 처리
  markAsRead: async (notificationId) => {
    // 1. 낙관적 UI 업데이트 (즉시 읽음 처리)
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    });

    // 2. API 호출
    try {
      const user = authService.getCurrentUser();
      if (user?.userId) {
        // id가 숫자로 변환 가능한 경우만 API 호출 (SSE로 받은 임시 ID 등은 제외될 수 있음)
        const numericId = Number(notificationId);
        if (!isNaN(numericId)) {
          await notificationApi.markAsRead(user.userId, numericId);
          logger.dev(`[NotificationStore] 알림 읽음 처리 완료: ${notificationId}`);
        }
      }
    } catch (error) {
      logger.error(`[NotificationStore] 알림 읽음 처리 실패: ${notificationId}`, error);
      // 실패 시 롤백 로직은 복잡도를 높이므로 생략 (다음 동기화 때 맞춰짐)
    }
  },

  // 모든 알림 읽음 처리
  markAllAsRead: async () => {
    // 1. 처리할 대상 식별 (읽지 않은 알림 ID 수집)
    const state = get();
    const unreadNotifications = state.notifications.filter(n => !n.read);
    const unreadIds = unreadNotifications.map(n => n.id);

    // 읽을 알림이 없으면 종료
    if (unreadIds.length === 0) return;

    // 2. 낙관적 UI 업데이트
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    // 3. API 호출 (개별 ID에 대해 반복 호출 - 서버 부하 고려하여 추후 일괄 처리 API 필요)
    try {
      const user = authService.getCurrentUser();
      if (user?.userId) {
        // 숫자 ID만 필터링 (서버 DB ID)
        const validIds = unreadIds
          .map(id => Number(id))
          .filter(id => !isNaN(id) && id > 0);

        if (validIds.length > 0) {
          logger.dev(`[NotificationStore] ${validIds.length}개 알림 일괄 읽음 처리 시작 (개별 API 반복 호출)`);

          // 병렬 처리 (주의: 요청 수가 많으면 브라우저/서버 부하 가능성 있음)
          // 알림 건수가 많을 수 있으므로 Promise.all 처리에 주의
          const results = await Promise.allSettled(
            validIds.map(id => notificationApi.markAsRead(user.userId, id))
          );

          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const failCount = results.filter(r => r.status === 'rejected').length;

          logger.dev(`[NotificationStore] 일괄 읽음 처리 완료: 성공 ${successCount}, 실패 ${failCount}`);
        }
      }
    } catch (error) {
      logger.error('[NotificationStore] 모든 알림 읽음 처리 중 오류', error);
      // UI를 롤백하지는 않음 (다음 동기화 때 맞춰짐)
    }
  },

  // 알림 삭제
  removeNotification: async (notificationId) => {
    // 1. 낙관적 UI 업데이트 (즉시 삭제)
    set((state) => {
      const notifications = state.notifications.filter((n) => n.id !== notificationId);
      const unreadCount = notifications.filter((n) => !n.read).length;

      const filtered = getFilteredNotifications(notifications, state.selectedCategory);
      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

      // 현재 페이지가 전체 페이지 수를 초과하면 마지막 페이지로 조정
      const currentPage = Math.min(state.currentPage, totalPages);
      return { notifications, unreadCount, totalPages, currentPage };
    });

    // 2. API 호출
    try {
      const user = authService.getCurrentUser();
      if (user?.userId) {
        const numericId = Number(notificationId);
        if (!isNaN(numericId)) {
          await notificationApi.deleteAlert(user.userId, numericId);
          logger.dev(`[NotificationStore] 알림 삭제 완료: ${notificationId}`);
        }
      }
    } catch (error) {
      logger.error(`[NotificationStore] 알림 삭제 실패: ${notificationId}`, error);
      // 실패 시 롤백 대신 에러 로그만 남김 (다음 동기화 때 복구됨)
    }
  },

  // 모든 알림 삭제
  clearAllNotifications: async () => {
    // 1. 삭제할 대상 ID 수집
    const state = get();
    const notificationIds = state.notifications.map(n => n.id);

    if (notificationIds.length === 0) return;

    // 2. 낙관적 UI 업데이트 (화면에서 즉시 지움)
    set({
      notifications: [],
      unreadCount: 0,
      totalPages: 1,
      currentPage: 1,
    });

    // 3. API 호출 (백그라운드 병렬 처리)
    try {
      const user = authService.getCurrentUser();
      if (user?.userId) {
        // 숫자 ID만 필터링 (서버 DB ID)
        const validIds = notificationIds
          .map(id => Number(id))
          .filter(id => !isNaN(id) && id > 0);

        if (validIds.length > 0) {
          logger.dev(`[NotificationStore] ${validIds.length}개 알림 일괄 삭제 시작 (개별 API 반복 호출)`);

          // 병렬 처리
          const results = await Promise.allSettled(
            validIds.map(id => notificationApi.deleteAlert(user.userId, id))
          );

          const successCount = results.filter(r => r.status === 'fulfilled').length;
          logger.dev(`[NotificationStore] 일괄 삭제 완료: 성공 ${successCount}`);
        }
      }
    } catch (error) {
      logger.error('[NotificationStore] 알림 일괄 삭제 중 오류', error);
      // UI를 롤백하지는 않음
    }
  },

  // SSE 활성화/비활성화
  setSseEnabled: (enabled) => {
    logger.dev('[NotificationStore] SSE 활성화:', enabled);
    set({ sseEnabled: enabled });
  },

  // SSE 연결 상태 업데이트
  setConnectionState: (state) => {
    logger.dev('[NotificationStore] SSE 연결 상태:', state);
    set({ connectionState: state });
  },

  // 알림 패널 토글
  toggleNotificationPanel: () => {
    set((state) => {
      const isOpen = !state.isNotificationPanelOpen;
      return {
        isNotificationPanelOpen: isOpen,
        ...(isOpen ? { selectedCategory: '전체' } : {}),
      };
    });
  },

  // 알림 패널 열기/닫기
  setNotificationPanelOpen: (open) => {
    set({
      isNotificationPanelOpen: open,
      ...(open ? { selectedCategory: '전체' } : {})
    });
  },

  // 기존 알림들의 메시지 재생성 (JSON → 사용자 친화적)
  refreshNotificationMessages: () => {
    set((state) => {
      const updatedNotifications = state.notifications.map((notification) => {
        // 메시지가 JSON 형태인지 확인
        const isJsonLike = typeof notification.message === 'string' &&
          (notification.message.trim().startsWith('{') ||
            notification.message.trim().startsWith('[') ||
            notification.message.includes('"id":') ||
            notification.message.includes('"user_id":') ||
            notification.message.includes('"name":'));

        // JSON처럼 보이거나 기본 메시지인 경우 재생성
        if (isJsonLike ||
          notification.message === '새로운 알림이 있습니다' ||
          notification.message === '전자결재 관련 알림이 있습니다' ||
          notification.message === '휴가 관련 알림이 있습니다' ||
          notification.message.includes('{"')) {

          // payload가 있으면 메시지 재생성
          if (notification.payload) {
            const newMessage = extractPayloadMessage(notification.payload);
            if (newMessage && newMessage !== notification.message) {
              return {
                ...notification,
                message: newMessage,
              };
            }
          }
        }

        return notification;
      });

      // 변경사항이 있는지 확인
      const hasChanges = updatedNotifications.some((n, i) =>
        n.message !== state.notifications[i].message
      );

      if (hasChanges) {
        logger.dev('🔄 [NotificationStore] 기존 알림 메시지 재생성 완료');
        return {
          ...state,
          notifications: updatedNotifications,
        };
      }

      return state;
    });
  },

  // Gift count
  giftCount: 0,
  setGiftCount: (count) => set({ giftCount: count }),
  incrementGiftCount: () => set((state) => ({ giftCount: state.giftCount + 1 })),

  // Leave Approval Panel
  isLeaveApprovalPanelOpen: false,
  selectedLeaveApproval: null,
  openLeaveApprovalPanel: (data) => {
    set({
      isLeaveApprovalPanelOpen: true,
      selectedLeaveApproval: data,
    });
  },
  closeLeaveApprovalPanel: () => {
    set({
      isLeaveApprovalPanelOpen: false,
      selectedLeaveApproval: null,
    });
  },

  // Leave Approval Alert (SSE 트리거용)
  hasLeaveApprovalAlert: false,
  setHasLeaveApprovalAlert: (value) => {
    logger.dev('[NotificationStore] 결재 요청 알림 플래그 설정:', value);
    set({ hasLeaveApprovalAlert: value });
  },
  hasEapprovalAlert: false,
  setHasEapprovalAlert: (value) => {
    logger.dev('[NotificationStore] 전자결재 알림 플래그 설정:', value);
    set({ hasEapprovalAlert: value });
  },
  isLeaveApprovalListPanelOpen: false,
  openLeaveApprovalListPanel: () => {
    logger.dev('[NotificationStore] 결재 대기 목록 패널 열기');
    set({ isLeaveApprovalListPanelOpen: true });
  },
  closeLeaveApprovalListPanel: () => {
    logger.dev('[NotificationStore] 결재 대기 목록 패널 닫기');
    set({ isLeaveApprovalListPanelOpen: false });
  },

  // 페이지네이션 액션
  setCurrentPage: (page) => {
    set((state) => ({
      currentPage: Math.max(1, Math.min(page, state.totalPages)),
    }));
  },

  goToNextPage: () => {
    set((state) => ({
      currentPage: Math.min(state.currentPage + 1, state.totalPages),
    }));
  },

  goToPrevPage: () => {
    set((state) => ({
      currentPage: Math.max(state.currentPage - 1, 1),
    }));
  },

  goToFirstPage: () => {
    set({ currentPage: 1 });
  },

  goToLastPage: () => {
    set((state) => ({
      currentPage: state.totalPages,
    }));
  },

  setSelectedCategory: (category) => {
    set((state) => {
      const filtered = getFilteredNotifications(state.notifications, category);
      const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      return {
        selectedCategory: category,
        currentPage: 1,
        totalPages,
      };
    });
  },

  getPaginatedNotifications: () => {
    const state = get();
    const filtered = getFilteredNotifications(state.notifications, state.selectedCategory);
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    return filtered.slice(startIndex, endIndex);
  },
})
);
