/**
 * 알림함 헬퍼 함수
 *
 * 알림 아이콘, 제목, 시간 포맷팅 등 유틸리티 함수 제공
 */

import { logger } from './logger';

/**
 * 큐 이름에 따른 아이콘 반환
 * @param queueName 큐 이름 (birthday, gift, alert, event 등)
 * @returns 이모지 아이콘
 */
export const getIconByQueueName = (queueName: string): string => {
  switch (queueName) {
    case 'birthday':
      return '🎂';
    case 'gift':
      return '🎁';
    case 'alert':
      return '📢';
    case 'event':
      return '🎉';
    case 'leave':
    case 'leave_approval':
    case 'leave_alert':
    case 'leave_cc':
    case 'leave_draft':
      return '📝';
    case 'eapproval_alert':
    case 'eapproval_cc':
    case 'eapproval_approval':
      return '✅';
    case 'contest_detail':
      return '🏆';
    default:
      return '🔔';
  }
};

/**
 * 큐 이름에 따른 제목 반환
 * @param queueName 큐 이름
 * @returns 한글 제목
 */
export const getTitleByQueueName = (queueName: string): string => {
  switch (queueName) {
    case 'birthday':
      return '생일 알림';
    case 'gift':
      return '선물 도착';
    case 'alert':
      return '시스템 알림';
    case 'event':
      return '이벤트';
    case 'leave':
      return '휴가 알림';
    case 'leave_approval':
      return '휴가 승인 요청';
    case 'leave_alert':
      return '휴가 알림';
    case 'leave_cc':
      return '휴가 참조';
    case 'leave_draft':
      return '휴가 임시저장';
    case 'eapproval_alert':
      return '전자결재 알림';
    case 'eapproval_cc':
      return '전자결재 참조';
    case 'eapproval_approval':
      return '전자결재 승인';
    case 'contest_detail':
      return '공모전 알림';
    default:
      return '알림';
  }
};

/**
 * 큐 이름에서 알림 타입 정규화
 * @param queueName 큐 이름
 * @returns 알림 타입 (birthday, gift, leave_alert 등)
 */
export const getTypeByQueueName = (queueName: string): string => {
  if (!queueName) return 'alert';

  if (queueName.startsWith('leave')) {
    if (queueName.startsWith('leave_approval') || queueName.startsWith('leave.approval')) return 'leave_approval';
    if (queueName.startsWith('leave_cc')) return 'leave_cc';
    if (queueName.startsWith('leave_draft')) return 'leave_draft';
    if (queueName.startsWith('leave_alert')) return 'leave_alert';
    return 'leave_alert';
  }

  if (queueName.startsWith('eapproval')) {
    if (queueName.startsWith('eapproval_alert')) return 'eapproval_alert';
    if (queueName.startsWith('eapproval_cc')) return 'eapproval_cc';
    if (queueName.startsWith('eapproval_approval')) return 'eapproval_approval';
    return 'eapproval_alert';
  }

  if (queueName.startsWith('birthday')) return 'birthday';
  if (queueName.startsWith('gift')) return 'gift';
  if (queueName.startsWith('contest_detail')) return 'contest_detail';
  if (queueName.startsWith('event')) return 'event';
  if (queueName.startsWith('alert')) return 'alert';

  return queueName;
};

/**
 * 서버 날짜 문자열에서 날짜/시간 부분만 추출 (타임존 변환 없음)
 * "2026-02-04T17:56:29.572528Z" → { year: "2026", month: "02", day: "04", hours: "17", minutes: "56" }
 * "2026-02-04 17:56:29" → 동일
 */
const parseServerDateTime = (dateTime: string) => {
  // "YYYY-MM-DD" 부분 추출
  const dateMatch = dateTime.match(/(\d{4})-(\d{2})-(\d{2})/);
  // "HH:mm" 부분 추출 (T 또는 공백 뒤)
  const timeMatch = dateTime.match(/[T ](\d{2}):(\d{2})/);

  return {
    year: dateMatch?.[1] || '',
    month: dateMatch?.[2] || '',
    day: dateMatch?.[3] || '',
    hours: timeMatch?.[1] || '00',
    minutes: timeMatch?.[2] || '00',
  };
};

/**
 * 서버 날짜 문자열을 "YYYY-MM-DD HH:mm" 형태로 반환 (타임존 변환 없음, new Date 사용 안 함)
 */
export const formatDateTime = (dateTime: string): string => {
  const { year, month, day, hours, minutes } = parseServerDateTime(dateTime);
  if (!year) return dateTime;
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 서버 날짜 문자열을 "YYYY년 MM월 DD일 HH:mm" 형태로 반환 (타임존 변환 없음, new Date 사용 안 함)
 */
export const formatAbsoluteDateTime = (dateTime: string): string => {
  const { year, month, day, hours, minutes } = parseServerDateTime(dateTime);
  if (!year) return dateTime;
  return `${year}년 ${Number(month)}월 ${Number(day)}일 ${hours}:${minutes}`;
};

/**
 * 알림 메시지를 축약 (긴 메시지를 자르고 ... 추가)
 * @param message 원본 메시지
 * @param maxLength 최대 길이 (기본값: 100)
 * @returns 축약된 메시지
 */
export const truncateMessage = (message: string, maxLength = 100): string => {
  if (message.length <= maxLength) return message;
  return `${message.substring(0, maxLength)}...`;
};

/**
 * 알림 미리보기 메시지 정리 (마크다운 제거 + 축약)
 * @param message 원본 메시지
 * @param maxLength 최대 길이
 * @returns 정리된 미리보기
 */
export const sanitizeNotificationPreview = (
  message: string,
  maxLength = 100
): string => {
  if (!message) return '';

  let cleaned = message;

  cleaned = cleaned.replace(/\\n/g, '\n');
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`([^`]*)`/g, '$1');
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  cleaned = cleaned.replace(/^>\s?/gm, '');
  cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '');
  cleaned = cleaned.replace(/^\s*\d+\.\s+/gm, '');
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1');
  cleaned = cleaned.replace(/\|/g, ' ');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return truncateMessage(cleaned, maxLength);
};

/**
 * 큐 이름에 따른 색상 반환 (GPT 스타일 뮤트 톤)
 * @param queueName 큐 이름
 * @returns 색상 코드
 */
export const getColorByQueueName = (queueName: string): string => {
  // 모던한 회색 톤 통일, 아이콘으로 구분
  if (queueName.startsWith('leave')) return '#6B7280';
  if (queueName.startsWith('eapproval')) return '#6B7280';
  if (queueName === 'birthday') return '#9CA3AF';
  if (queueName === 'gift') return '#9CA3AF';
  if (queueName === 'contest_detail') return '#6B7280';
  return '#6B7280';
};

/**
 * 이벤트와 payload 기반으로 알림 멘트 생성
 * @param event 이벤트 타입
 * @param payload 메시지 페이로드
 * @returns 사용자 친화적 알림 멘트
 */
export const buildNotificationMessage = (
  event: string,
  payload?: Record<string, unknown>
): string => {
  const p = payload || {};

  switch (event) {
    case 'birthday': {
      const name = typeof p.name === 'string' ? p.name : '';
      return name ? `${name}님의 생일을 축하합니다! 🎂` : '생일을 축하합니다! 🎂';
    }

    case 'leave_approval': {
      const requester = typeof p.requester === 'string' ? p.requester : '';
      return requester
        ? `${requester}님의 휴가 결재가 도착했습니다.`
        : '휴가 결재가 도착했습니다.';
    }

    case 'leave_alert': {
      const status = p.status;
      const leaveType = (typeof p.leave_type === 'string' && p.leave_type) || (typeof p.leaveType === 'string' && p.leaveType) || '휴가 신청';
      if (status === 'APPROVED') return `${leaveType}이(가) 승인되었습니다.`;
      if (status === 'REJECTED') return `${leaveType}이(가) 반려되었습니다.`;
      return '휴가 관련 알림이 있습니다.';
    }

    case 'leave_cc': {
      const requester = typeof p.requester === 'string' ? p.requester : '';
      return requester
        ? `${requester}님의 휴가 신청에 참조되었습니다.`
        : '휴가 참조 알림이 도착했습니다.';
    }

    case 'leave_draft': {
      const leaveType = typeof p.leave_type === 'string' ? p.leave_type : '휴가';
      const grantDays = typeof p.grant_days === 'number' ? p.grant_days : 0;
      return grantDays > 0
        ? `${leaveType} ${grantDays}일이 부여되었습니다. 휴가를 신청해주세요.`
        : '휴가가 부여되었습니다. 휴가를 신청해주세요.';
    }

    case 'eapproval_approval': {
      const requester = typeof p.requester === 'string' ? p.requester : '';
      return requester
        ? `${requester}님의 전자결재가 도착했습니다.`
        : '전자결재가 도착했습니다.';
    }

    case 'eapproval_alert': {
      const status = p.status;
      const title = typeof p.title === 'string' ? p.title : '전자결재';
      if (status === 'APPROVED') return `"${title}"가 승인되었습니다.`;
      if (status === 'REJECTED') return `"${title}"가 반려되었습니다.`;
      return '전자결재가 처리되었습니다.';
    }

    case 'eapproval_cc': {
      const title = typeof p.title === 'string' ? p.title : '';
      return title
        ? `"${title}" 전자결재에 참조되었습니다.`
        : '전자결재 참조 문서가 도착했습니다.';
    }

    case 'contest_detail': {
      const title = typeof p.title === 'string' ? p.title : '';
      return title ? `공모전 알림: ${title}` : '새로운 공모전 알림이 도착했습니다.';
    }

    case 'gift':
    case 'gift_arrival': {
      const giftName = typeof p.gift_name === 'string' ? p.gift_name : '';
      const senderName = typeof p.sender_name === 'string' ? p.sender_name : '';
      if (giftName && senderName) return `${senderName}님이 "${giftName}"을(를) 보냈습니다. 🎁`;
      if (giftName) return `"${giftName}" 선물이 도착했습니다. 🎁`;
      return '선물이 도착했습니다. 🎁';
    }

    case 'alert':
    case 'notification':
    default: {
      const message = typeof p.message === 'string' ? p.message : '';
      const title = typeof p.title === 'string' ? p.title : '';
      return message || title || '새로운 알림이 도착했습니다.';
    }
  }
};
