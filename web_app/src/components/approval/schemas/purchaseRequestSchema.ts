import type { ApprovalFormSchema } from '../types/formSchema';

export const purchaseRequestSchema: ApprovalFormSchema = {
  approvalType: '구매신청서',
  displayName: '구매신청서',
  sections: [
    {
      id: 'basic',
      title: '신청 기본 정보',
      fields: [
        { key: 'requestDate', label: '신청일', type: 'date', required: true, colSpan: 1 },
        { key: 'deliveryDate', label: '납품요구일', type: 'date', required: true, colSpan: 2 },
      ],
    },
    {
      id: 'purpose',
      title: '1. 목적 (사유)',
      fields: [
        {
          key: 'purpose',
          label: '구매 목적 및 사유',
          type: 'textarea',
          required: true,
          colSpan: 3,
          rows: 4,
          placeholder: '구매 목적 및 사유를 입력하세요',
        },
      ],
    },
    {
      id: 'items',
      title: '2. 내용 및 비용',
      type: 'repeatable',
      columns: [
        { key: 'itemName', label: '구입 항목', type: 'text', flex: 3, placeholder: '품명 입력' },
        { key: 'unitPrice', label: '단가', type: 'currency', flex: 2, unit: '원', align: 'right', placeholder: '0' },
        { key: 'quantity', label: '수량', type: 'number', flex: 1, align: 'center', placeholder: '0' },
        { key: 'totalAmount', label: '금액', type: 'readonly', flex: 2, unit: '원', align: 'right', computeFrom: ['unitPrice', 'quantity'] },
        { key: 'note', label: '비고', type: 'text', flex: 2, placeholder: '비고' },
      ],
      minRows: 1,
      note: '* 단가·금액은 VAT 포함 여부 필히 기재',
    },
    {
      id: 'totalCost',
      title: '3. 총 비용',
      fields: [
        {
          key: 'totalCost',
          label: '총 비용 및 예산 출처',
          type: 'textarea',
          colSpan: 3,
          rows: 2,
          placeholder: '예) 총 ○○○원 (VAT 포함), 예산 출처: 운영비',
        },
      ],
    },
    {
      id: 'quotation',
      title: '4. 견적서',
      fields: [
        {
          key: 'quotationNote',
          label: '견적서 관련 사항',
          type: 'textarea',
          colSpan: 3,
          rows: 2,
          placeholder: '견적서 첨부 여부 및 관련 사항을 입력하세요',
        },
      ],
    },
    {
      id: 'remarks',
      title: '5. 비고',
      fields: [
        {
          key: 'remarks',
          label: '항목별 구매처 URL, 업체, 구매방법 등',
          type: 'textarea',
          colSpan: 3,
          rows: 3,
          placeholder: '항목별 구매처 URL, 정보, 업체, 구매방법 등을 입력하세요',
        },
      ],
    },
  ],
};
