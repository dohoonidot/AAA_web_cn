export const APPROVAL_TYPES_ALL = [
  '매출/매입계약 기안서',
  'Novation order_(고객사명)',
  'Online Order',
  '경비 추가 예산 신청서',
  '구매신청서',
  '선계약/선지급 승인 요청서',
  '교육신청서',
  '경조사비 지급신청서',
  '병가신청서',
  '복직신청서',
  '주말 당직 결과보고서',
  '직원 채용 공고 등록 신청',
  '출장 신청서',
  '프로젝트 결과 보고',
  '프로젝트 제안완료 보고',
  '프로젝트 출장비 신청서',
  '휴직신청서',
  '기본양식',
  '휴가 부여 상신',
];

export const APPROVAL_TYPES_PROD = ['휴가 부여 상신'];

export const LEAVE_TYPES = [
  '예비군/민방위 연차',
  '배우자 출산휴가',
  '경조사휴가',
  '산전후휴가',
  '결혼휴가',
  '병가',
];

export const getApprovalTypeLabel = (value?: string) => {
  if (!value) return '';
  if (value === 'hr_leave_grant') return '휴가 부여 상신';
  if (value === '매출/매입 계약 기안서') return '매출/매입계약 기안서';
  return value;
};

export const getApprovalTypeValue = (label?: string) => {
  if (!label) return '';
  if (label === '휴가 부여 상신') return 'hr_leave_grant';
  if (label === '매출/매입계약 기안서') return '매출/매입 계약 기안서';
  return label;
};
