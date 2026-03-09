import type { ApprovalFormSchema } from '../types/formSchema';

export const educationSchema: ApprovalFormSchema = {
  approvalType: '교육신청서',
  displayName: '교육신청서',
  sections: [
    {
      id: 'info',
      title: '교육 정보',
      icon: '🎓',
      fields: [
        { key: 'educationName', label: '교육명', type: 'text', placeholder: '교육/과정명', required: true, colSpan: 2 },
        { key: 'institution', label: '교육기관', type: 'text', placeholder: '교육기관명', required: true, colSpan: 1 },
        { key: 'location', label: '교육장소', type: 'text', placeholder: '교육 장소', colSpan: 1 },
      ],
    },
    {
      id: 'schedule',
      title: '일정 및 비용',
      icon: '📅',
      fields: [
        { key: 'startDate', label: '교육시작일', type: 'date', required: true, colSpan: 1 },
        { key: 'endDate', label: '교육종료일', type: 'date', required: true, colSpan: 1 },
        { key: 'educationFee', label: '교육비', type: 'currency', placeholder: '0', colSpan: 1, unit: '원' },
        { key: 'supportAmount', label: '지원금액', type: 'currency', placeholder: '0', colSpan: 1, unit: '원' },
      ],
    },
    {
      id: 'objective',
      title: '교육 목적',
      icon: '🎯',
      fields: [
        { key: 'objective', label: '목적 및 기대효과', type: 'textarea', placeholder: '교육 수강 목적과 기대 효과를 입력하세요', required: true, colSpan: 3, rows: 5 },
      ],
    },
  ],
};
