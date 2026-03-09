export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'currency' | 'readonly' | 'info';

// ─── 일반 필드 그리드 섹션 ───────────────────────────────────────────────────
export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  colSpan?: 1 | 2 | 3;
  unit?: string;
  rows?: number;
  defaultValue?: string; // info 타입 기본 표시값
}

export interface FormSection {
  id: string;
  title: string;
  icon?: string;
  type?: 'normal';
  fields: FormField[];
  note?: string;
}

// ─── 동적 행 추가 테이블 섹션 ────────────────────────────────────────────────
export interface RepeatableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'readonly' | 'textarea';
  flex?: number;
  unit?: string;
  computeFrom?: [string, string]; // [colA, colB] → colA * colB
  placeholder?: string;
  align?: 'left' | 'center' | 'right';
}

export interface RepeatableSection {
  id: string;
  title: string;
  icon?: string;
  type: 'repeatable';
  columns: RepeatableColumn[];
  minRows?: number;
  note?: string;
}

export interface CustomItemEntry {
  id: string;
  label: string;
  value: string;
}

export interface RepeatableSectionData {
  columns: RepeatableColumn[];
  rows: Array<Record<string, string>>;
  customItems: CustomItemEntry[];
}

export interface ApprovalFormData {
  fields: Record<string, string>;
  fixedTables: Record<string, Record<string, string>>;
  repeatableSections: Record<string, RepeatableSectionData>;
}

// ─── 고정 라벨 테이블 섹션 ───────────────────────────────────────────────────
// HTML 양식의 th(라벨) | td(입력) 구조를 재현
export interface FixedRow {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  note?: string;        // 셀 우측 또는 하단 보조 텍스트
  required?: boolean;
  options?: string[];   // select 타입용
  rows?: number;        // textarea 타입용
  defaultValue?: string; // info 타입 기본 표시값
  labelWidth?: string;  // 라벨 열 너비 override (기본 '32%')
}

export interface FixedTableSection {
  id: string;
  title: string;
  icon?: string;
  type: 'fixed-table';
  rows: FixedRow[];
  note?: string;
}

// ─── 유니온 타입 ─────────────────────────────────────────────────────────────
export type AnySection = FormSection | RepeatableSection | FixedTableSection;

export interface ApprovalFormSchema {
  approvalType: string;
  displayName: string;
  sections: AnySection[];
}
