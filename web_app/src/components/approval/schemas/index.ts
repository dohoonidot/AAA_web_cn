import { APPROVAL_TYPES_ALL } from '../ElectronicApprovalDraftPanel.shared';
import { approvalTemplates } from '../approvalTemplates';
import type { ApprovalFormSchema, FixedRow, RepeatableColumn } from '../types/formSchema';
import { businessTripSchema } from './businessTripSchema';
import { educationSchema } from './educationSchema';
import { purchaseRequestSchema } from './purchaseRequestSchema';

const handCraftedSchemas: Record<string, ApprovalFormSchema> = {
  '구매신청서': purchaseRequestSchema,
  '출장 신청서': businessTripSchema,
  '교육신청서': educationSchema,
};

function cleanText(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

function makeKey(prefix: string, tableIdx: number, rowIdx: number, cellIdx = 0): string {
  return `${prefix}_${tableIdx + 1}_${rowIdx + 1}_${cellIdx + 1}`;
}

function guessFieldType(label: string): 'text' | 'date' | 'currency' | 'textarea' {
  if (/일자|날짜|기간|date/i.test(label)) return 'date';
  if (/금액|비용|단가|매출|매입|예산|환급/i.test(label)) return 'currency';
  if (/사유|내용|목적|효과|특이사항|비고|보고/i.test(label)) return 'textarea';
  return 'text';
}

function guessColumnType(label: string): RepeatableColumn['type'] {
  if (/금액|비용|단가|매출|매입|예산|환급/i.test(label)) return 'currency';
  if (/수량|횟수|인원|day|no\./i.test(label)) return 'number';
  return 'text';
}

function buildSchemaFromTemplate(approvalType: string, templateHtml: string): ApprovalFormSchema {
  if (typeof DOMParser === 'undefined') {
    return {
      approvalType,
      displayName: approvalType,
      sections: [
        {
          id: 'basic',
          title: '상세 내용',
          fields: [
            {
              key: 'description',
              label: '상세 내용',
              type: 'textarea',
              rows: 8,
              colSpan: 3,
              placeholder: '내용을 입력하세요.',
            },
          ],
        },
      ],
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(templateHtml, 'text/html');
  const tables = Array.from(doc.querySelectorAll('table'));

  const sections: ApprovalFormSchema['sections'] = [];

  tables.forEach((table, tableIdx) => {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) return;

    const firstCells = Array.from(rows[0].querySelectorAll('th,td'));
    const headerTexts = firstCells.map((cell) => cleanText(cell.textContent || ''));
    const isGridTable = firstCells.length >= 3 && firstCells.every((cell) => cell.tagName.toLowerCase() === 'th');

    if (isGridTable) {
      const columns: RepeatableColumn[] = headerTexts
        .map((text, idx) => {
          const label = text || `컬럼 ${idx + 1}`;
          return {
            key: makeKey('col', tableIdx, 0, idx),
            label,
            type: guessColumnType(label),
            align: /금액|비용|단가|매출|매입/i.test(label) ? 'right' : 'left',
          } satisfies RepeatableColumn;
        });

      sections.push({
        id: `table_${tableIdx + 1}`,
        title: `표 ${tableIdx + 1}`,
        type: 'repeatable',
        minRows: Math.max(rows.length - 1, 1),
        columns,
      });
      return;
    }

    const fixedRows: FixedRow[] = [];
    rows.forEach((row, rowIdx) => {
      const cells = Array.from(row.querySelectorAll('th,td'));
      if (cells.length < 2) return;
      const label = cleanText(cells[0].textContent || '');
      if (!label) return;

      const fieldType = guessFieldType(label);
      fixedRows.push({
        key: makeKey('row', tableIdx, rowIdx),
        label,
        type: fieldType,
        rows: fieldType === 'textarea' ? 3 : undefined,
      });
    });

    if (fixedRows.length > 0) {
      sections.push({
        id: `fixed_${tableIdx + 1}`,
        title: `입력 항목 ${tableIdx + 1}`,
        type: 'fixed-table',
        rows: fixedRows,
      });
    }
  });

  if (sections.length === 0) {
    sections.push({
      id: 'basic',
      title: '상세 내용',
      fields: [
        {
          key: 'description',
          label: '상세 내용',
          type: 'textarea',
          rows: 8,
          colSpan: 3,
          placeholder: '내용을 입력하세요.',
        },
      ],
    });
  }

  return {
    approvalType,
    displayName: approvalType,
    sections,
  };
}

const generatedSchemas: Record<string, ApprovalFormSchema> = {};

APPROVAL_TYPES_ALL.forEach((type) => {
  if (type === '휴가 부여 상신') return;
  if (handCraftedSchemas[type]) {
    generatedSchemas[type] = handCraftedSchemas[type];
    return;
  }

  const template = approvalTemplates[type] || approvalTemplates['기본양식'];
  generatedSchemas[type] = buildSchemaFromTemplate(type, template);
});

export const MODERN_FORM_SCHEMAS: Record<string, ApprovalFormSchema> = generatedSchemas;

export function getModernFormSchema(approvalType: string): ApprovalFormSchema | undefined {
  if (!approvalType || approvalType === '휴가 부여 상신') return undefined;
  return MODERN_FORM_SCHEMAS[approvalType] ?? MODERN_FORM_SCHEMAS['기본양식'];
}
