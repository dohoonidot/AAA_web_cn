import React from 'react';
import { Typography } from '@mui/material';

/**
 * 취소사유가 포함된 reason 파싱하여 UI 표시
 * Flutter admin_leave_approval_screen.dart의 _buildReasonText와 동일한 로직
 */
export const parseReasonWithCancelReason = (reason: string) => {
  if (!reason || !reason.includes('취소사유:')) {
    return { hasCancelReason: false, cancelReason: '', originalReason: reason };
  }

  // "취소사유:"로 분리
  const parts = reason.split('취소사유:');
  if (parts.length < 2) {
    return { hasCancelReason: false, cancelReason: '', originalReason: reason };
  }

  const afterCancel = parts[1].trim();

  // "\n\n\n"으로 취소사유와 원래 사유 분리
  const cancelParts = afterCancel.split('\n\n\n');
  const cancelReason = cancelParts[0]?.trim() || '';
  const originalReason = cancelParts[1]?.trim() || '';

  return {
    hasCancelReason: true,
    cancelReason,
    originalReason,
  };
};

/**
 * 취소사유 UI 컴포넌트
 */
export const RenderReasonWithCancelHighlight: React.FC<{ reason: string; maxLines?: number; color?: string }> = ({ reason, maxLines, color }) => {
  const parsed = parseReasonWithCancelReason(reason);
  const textColor = color || 'text.secondary';

  if (!parsed.hasCancelReason) {
    // 일반 사유만 표시
    return (
      <Typography
        variant="body2"
        color={textColor}
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: maxLines || 3,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
      >
        {reason}
      </Typography>
    );
  }

  return (
    <Typography
      variant="body2"
      color={textColor}
      sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: maxLines || 3,
        WebkitBoxOrient: 'vertical',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    >
      <Typography component="span" sx={{ fontWeight: 700, color: '#DC3545' }}>
        취소사유: {parsed.cancelReason}
      </Typography>
      {'\n'}
      {parsed.originalReason}
    </Typography>
  );
};

const getDatePart = (value?: string) => {
  if (!value) return '';
  const text = String(value);
  const datePart = text.split('T')[0].split(' ')[0];
  return datePart;
};

export const formatServerDateYMD = (value?: string) => getDatePart(value);

export const formatServerDateDots = (value?: string) => {
  const part = getDatePart(value);
  return part ? part.replace(/-/g, '.') : '';
};

export const formatServerDateMD = (value?: string) => {
  const part = getDatePart(value);
  if (!part) return '';
  const [_, month, day] = part.split('-');
  if (month && day) return `${month}.${day}`;
  return part;
};

export const formatServerDateKorean = (value?: string) => {
  const part = getDatePart(value);
  if (!part) return '';
  const [year, month, day] = part.split('-');
  if (year && month && day) return `${year}년 ${month}월 ${day}일`;
  return part;
};

/**
 * 서버 KST 날짜+시간 문자열을 타임존 변환 없이 포맷
 * "2026-02-20T20:30:00Z" → "2026-02-20 20:30" (Z 무시, 숫자만 추출)
 */
export const formatServerDateTime = (value?: string) => {
  if (!value) return '';
  const text = String(value);
  // 정규식으로 날짜와 시간 파트만 추출 (타임존 무시)
  const match = text.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
  return text;
};

/**
 * 서버 KST 날짜+시간 문자열을 한국어 형식으로 포맷
 * "2026-02-20T20:30:00Z" → "2026년 02월 20일 20:30"
 */
export const formatServerDateTimeKorean = (value?: string) => {
  if (!value) return '';
  const text = String(value);
  const match = text.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute] = match;
    return `${year}년 ${month}월 ${day}일 ${hour}:${minute}`;
  }
  return text;
};
