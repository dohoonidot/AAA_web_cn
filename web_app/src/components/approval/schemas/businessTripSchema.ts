import type { ApprovalFormSchema } from '../types/formSchema';

export const businessTripSchema: ApprovalFormSchema = {
  approvalType: '출장 신청서',
  displayName: '출장 신청서',
  sections: [
    {
      id: 'basic',
      title: '출장 기본 정보',
      icon: '✈️',
      fields: [
        { key: 'destination', label: '출장지', type: 'text', placeholder: '출장 장소', required: true, colSpan: 2 },
        { key: 'purpose', label: '출장목적', type: 'text', placeholder: '출장 목적', required: true, colSpan: 3 },
        { key: 'departureDate', label: '출발일', type: 'date', required: true, colSpan: 1 },
        { key: 'returnDate', label: '복귀일', type: 'date', required: true, colSpan: 1 },
      ],
    },
    {
      id: 'expenses',
      title: '비용 내역',
      icon: '💰',
      fields: [
        { key: 'transportation', label: '교통비', type: 'currency', placeholder: '0', colSpan: 1, unit: '원' },
        { key: 'accommodation', label: '숙박비', type: 'currency', placeholder: '0', colSpan: 1, unit: '원' },
        { key: 'dailyAllowance', label: '일비', type: 'currency', placeholder: '0', colSpan: 1, unit: '원' },
        { key: 'others', label: '기타', type: 'currency', placeholder: '0', colSpan: 1, unit: '원' },
        { key: 'totalExpense', label: '합계', type: 'readonly', colSpan: 2, unit: '원' },
      ],
    },
    {
      id: 'extra',
      title: '기타',
      icon: '📝',
      fields: [
        { key: 'companions', label: '동행자', type: 'text', placeholder: '동행자 이름 (없으면 공란)', colSpan: 2 },
        { key: 'remarks', label: '비고', type: 'textarea', placeholder: '기타 사항을 입력하세요', colSpan: 3, rows: 3 },
      ],
    },
  ],
};
